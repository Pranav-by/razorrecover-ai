const RecoveryCase = require('../models/RecoveryCase');
const BatchRun = require('../models/BatchRun');
const RevenueDetectorService = require('./revenue-detector.service');
const DiagnosisService = require('./diagnosis.service');
const StrategyService = require('./strategy.service');
const PriorityService = require('./priority.service');
const StoppingRulesService = require('./stopping-rules.service');
const PolicyService = require('./policy.service');
const ComplianceService = require('./compliance.service');
const ActionService = require('./action.service');
const VerificationService = require('./verification.service');
const AuditService = require('./audit.service');
const logger = require('../utils/logger');

/**
 * Recovery Orchestrator — Master pipeline.
 * Coordinates all agents: detect → diagnose → prioritize → strategize →
 * stop check → policy → comply → act → verify → audit.
 */
class OrchestratorService {
  /**
   * Run a full batch recovery.
   * Returns batch results.
   */
  static async runBatch() {
    const batchId = `run_${new Date().toISOString().split('T')[0].replace(/-/g, '_')}_${Date.now().toString(36)}`;
    logger.info(`\n${'═'.repeat(60)}`);
    logger.info(`🚀 BATCH RECOVERY RUN: ${batchId}`);
    logger.info(`${'═'.repeat(60)}\n`);

    // Create batch run record
    const batchRun = await BatchRun.create({
      batchId,
      status: 'running',
      startedAt: new Date()
    });

    await AuditService.log({
      recoveryCaseId: null,
      batchId,
      event: 'batch_started',
      actor: 'system',
      message: `Batch recovery run started: ${batchId}`
    });

    try {
      // Step 1: DETECT — Scan for revenue at risk
      logger.info('\n── Step 1: REVENUE DETECTION ──');
      const cases = await RevenueDetectorService.detectAll(batchId);
      batchRun.casesScanned = cases.length;
      batchRun.totalRevenueAtRisk = cases.reduce((sum, c) => sum + c.amountAtRisk, 0);

      if (cases.length === 0) {
        logger.info('No revenue at risk detected.');
        batchRun.status = 'completed';
        batchRun.completedAt = new Date();
        await batchRun.save();
        return this._formatBatchResult(batchRun);
      }

      // Step 2: DIAGNOSE — AI diagnosis for each case
      logger.info('\n── Step 2: AI DIAGNOSIS ──');
      for (const recoveryCase of cases) {
        await DiagnosisService.diagnose(recoveryCase, batchId);
      }

      // Step 3: PRIORITIZE — Rank by expected recovery value
      logger.info('\n── Step 3: PRIORITY RANKING ──');
      const refreshedCases = await RecoveryCase.find({ batchId });
      const ranked = PriorityService.rankCases(refreshedCases);

      // Step 4: STRATEGIZE — Select intervention for each case
      logger.info('\n── Step 4: STRATEGY SELECTION ──');
      for (const recoveryCase of ranked) {
        const diagnosis = {
          diagnosis: recoveryCase.diagnosis,
          recovery: { action: recoveryCase.recommendedAction }
        };
        await StrategyService.selectStrategy(recoveryCase, diagnosis, batchId);
      }

      // Steps 5-8: For each case, run through stopping → policy → comply → act → verify
      logger.info('\n── Step 5-8: EXECUTION PIPELINE ──');
      let autoActioned = 0;
      let humanReview = 0;
      let blockedByPolicy = 0;
      let blockedByCompliance = 0;
      let stoppedByRules = 0;
      let recoveredAmount = 0;
      let pendingAmount = 0;

      for (let i = 0; i < ranked.length; i++) {
        const recoveryCase = ranked[i];
        batchRun.lastProcessedCaseIndex = i + 1;

        logger.info(`\n  ┌─ Case ${recoveryCase.caseId}: ₹${recoveryCase.amountAtRisk} (${recoveryCase.scenario})`);

        // Step 5: STOPPING RULES (checked FIRST)
        const stopResult = await StoppingRulesService.check(recoveryCase, batchId);
        if (stopResult.stopped) {
          stoppedByRules++;
          if (!stopResult.permanent) humanReview++;
          logger.info(`  └─ ${stopResult.permanent ? '🛑 HALTED' : '⏸ PAUSED'}: ${stopResult.rule}`);
          continue;
        }

        // Step 6: POLICY ENGINE
        const policyResult = await PolicyService.check(recoveryCase, batchId);
        if (!policyResult.allowed) {
          blockedByPolicy++;
          humanReview++;
          recoveryCase.status = 'HUMAN_REVIEW';
          await recoveryCase.save();
          await AuditService.log({
            recoveryCaseId: recoveryCase._id,
            batchId,
            event: 'human_review_required',
            actor: 'system',
            message: `Routed to human review: ${policyResult.reason}`,
            metadata: { policyResult }
          });
          logger.info(`  └─ ❌ BLOCKED → Human Review: ${policyResult.reason}`);
          continue;
        }

        // Step 7: COMPLIANT ESCALATION
        const complianceResult = await ComplianceService.check(recoveryCase, 'email', batchId);
        if (!complianceResult.passed) {
          blockedByCompliance++;
          logger.info(`  └─ 📋 COMPLIANCE BLOCKED: ${complianceResult.reason}`);
          continue;
        }

        // Step 8a: EXECUTE ACTION
        const actionResult = await ActionService.execute(recoveryCase, batchId);
        autoActioned++;

        // Step 8b: VERIFY OUTCOME
        const verifyResult = await VerificationService.verify(recoveryCase, actionResult, batchId);

        if (verifyResult.verified) {
          recoveredAmount += verifyResult.recoveredAmount;
          logger.info(`  └─ 💰 RECOVERED: ₹${verifyResult.recoveredAmount}`);
        } else if (verifyResult.finalStatus === 'VERIFYING' || verifyResult.finalStatus === 'PAUSED') {
          pendingAmount += recoveryCase.amountAtRisk;
          logger.info(`  └─ ⏳ PENDING: ${verifyResult.finalStatus}`);
        } else {
          logger.info(`  └─ ✗ FAILED: ${verifyResult.finalStatus}`);
        }
      }

      // Update batch run
      batchRun.recoverableCases = ranked.filter(c => c.recoveryProbability > 0.3).length;
      batchRun.autoActioned = autoActioned;
      batchRun.humanReviewRequired = humanReview;
      batchRun.blockedByPolicy = blockedByPolicy;
      batchRun.blockedByCompliance = blockedByCompliance;
      batchRun.stoppedByStoppingRules = stoppedByRules;
      batchRun.verifiedRecoveredAmount = recoveredAmount;
      batchRun.pendingVerificationAmount = pendingAmount;
      batchRun.recoveryRatePercent = batchRun.totalRevenueAtRisk > 0
        ? Math.round((recoveredAmount / batchRun.totalRevenueAtRisk) * 10000) / 100
        : 0;
      batchRun.status = 'completed';
      batchRun.completedAt = new Date();
      batchRun.caseIds = ranked.map(c => c._id);
      await batchRun.save();

      await AuditService.log({
        recoveryCaseId: null,
        batchId,
        event: 'batch_completed',
        actor: 'system',
        message: `Batch completed: ₹${recoveredAmount} recovered from ₹${batchRun.totalRevenueAtRisk} at risk (${batchRun.recoveryRatePercent}%)`,
        metadata: this._formatBatchResult(batchRun)
      });

      logger.info(`\n${'═'.repeat(60)}`);
      logger.info(`✅ BATCH COMPLETE: ${batchId}`);
      logger.info(`   Revenue at Risk: ₹${batchRun.totalRevenueAtRisk}`);
      logger.info(`   Recovered:       ₹${recoveredAmount}`);
      logger.info(`   Recovery Rate:   ${batchRun.recoveryRatePercent}%`);
      logger.info(`   Auto-actioned:   ${autoActioned}`);
      logger.info(`   Human Review:    ${humanReview}`);
      logger.info(`   Stopped by Rules:${stoppedByRules}`);
      logger.info(`${'═'.repeat(60)}\n`);

      return this._formatBatchResult(batchRun);

    } catch (err) {
      logger.error(`Batch run error: ${err.message}`);
      batchRun.status = 'failed';
      batchRun.completedAt = new Date();
      await batchRun.save();
      throw err;
    }
  }

  static _formatBatchResult(batchRun) {
    return {
      batchId: batchRun.batchId,
      status: batchRun.status,
      startedAt: batchRun.startedAt,
      completedAt: batchRun.completedAt,
      casesScanned: batchRun.casesScanned,
      totalRevenueAtRisk: batchRun.totalRevenueAtRisk,
      recoverableCases: batchRun.recoverableCases,
      autoActioned: batchRun.autoActioned,
      humanReviewRequired: batchRun.humanReviewRequired,
      blockedByPolicy: batchRun.blockedByPolicy,
      blockedByCompliance: batchRun.blockedByCompliance,
      stoppedByStoppingRules: batchRun.stoppedByStoppingRules,
      verifiedRecoveredAmount: batchRun.verifiedRecoveredAmount,
      pendingVerificationAmount: batchRun.pendingVerificationAmount,
      recoveryRatePercent: batchRun.recoveryRatePercent
    };
  }
}

module.exports = OrchestratorService;
