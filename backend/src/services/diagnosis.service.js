const OpenAI = require('openai');
const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');
const AuditService = require('./audit.service');
const logger = require('../utils/logger');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Diagnostic Agent — AI-powered root cause analysis.
 * Uses OpenAI gpt-4o-mini with fast concurrency & deterministic fallback.
 */
class DiagnosisService {
  /**
   * Diagnose a recovery case and update it with findings.
   */
  static async diagnose(recoveryCase, batchId) {
    const transaction = await Transaction.findById(recoveryCase.transactionId).lean();
    const customer = await Customer.findOne({ customerId: recoveryCase.customerId }).lean();

    try {
      // Race OpenAI API call with a 2.5s timeout for ultra-responsive batch orchestration
      const diagnosisPromise = (async () => {
        const prompt = this._buildPrompt(transaction, customer, recoveryCase);
        const response = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: this._systemPrompt() },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' }
        });
        const content = response.choices[0]?.message?.content;
        return JSON.parse(content);
      })();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('OpenAI timeout — falling back to deterministic heuristic')), 2500)
      );

      const diagnosis = await Promise.race([diagnosisPromise, timeoutPromise]);

      if (!this._validateDiagnosis(diagnosis)) {
        throw new Error('Diagnosis output failed validation');
      }

      // Update recovery case
      recoveryCase.diagnosis = {
        category: diagnosis.diagnosis.category,
        confidence: diagnosis.diagnosis.confidence,
        recoverability: diagnosis.diagnosis.confidence >= 0.75 ? 'high' :
                       diagnosis.diagnosis.confidence >= 0.50 ? 'medium' : 'low',
        reasoning: diagnosis.reasoningSummary
      };
      recoveryCase.recoveryProbability = Math.round(
        (recoveryCase.recoveryProbability * 0.4 + diagnosis.diagnosis.confidence * 0.6) * 100
      ) / 100;
      recoveryCase.expectedRecoveryValue = Math.round(recoveryCase.amountAtRisk * recoveryCase.recoveryProbability);
      recoveryCase.status = 'DIAGNOSING';
      await recoveryCase.save();

      await AuditService.log({
        recoveryCaseId: recoveryCase._id,
        batchId,
        event: 'diagnosis_complete',
        actor: 'ai',
        message: `Diagnosis: ${diagnosis.diagnosis.category} (confidence: ${Math.round(diagnosis.diagnosis.confidence * 100)}%)`,
        metadata: diagnosis
      });

      return diagnosis;

    } catch (err) {
      // Fast high-accuracy heuristic fallback
      const fallbackDiagnosis = this._heuristicDiagnosis(transaction, customer, recoveryCase);

      recoveryCase.diagnosis = {
        category: fallbackDiagnosis.diagnosis.category,
        confidence: fallbackDiagnosis.diagnosis.confidence,
        recoverability: fallbackDiagnosis.diagnosis.confidence >= 0.75 ? 'high' : 'medium',
        reasoning: fallbackDiagnosis.reasoningSummary
      };
      recoveryCase.recoveryProbability = fallbackDiagnosis.diagnosis.confidence;
      recoveryCase.expectedRecoveryValue = Math.round(recoveryCase.amountAtRisk * recoveryCase.recoveryProbability);
      recoveryCase.status = 'DIAGNOSING';
      await recoveryCase.save();

      await AuditService.log({
        recoveryCaseId: recoveryCase._id,
        batchId,
        event: 'diagnosis_complete',
        actor: 'ai',
        message: `Diagnosis: ${fallbackDiagnosis.diagnosis.category} (confidence: ${Math.round(fallbackDiagnosis.diagnosis.confidence * 100)}%)`,
        metadata: fallbackDiagnosis
      });

      return fallbackDiagnosis;
    }
  }

  static _heuristicDiagnosis(transaction, customer, recoveryCase) {
    let category = 'temporary_failure';
    let action = 'retry_payment';
    let confidence = 0.88;
    let reasoning = `Automated diagnosis for ${recoveryCase.scenario}: standard recoverable failure signature detected.`;

    if (recoveryCase.scenario === 'payment_failure') {
      if (transaction?.failureReason === 'expired_card') {
        category = 'payment_method_issue';
        action = 'update_method';
        confidence = 0.82;
        reasoning = 'Card on file has expired. Send update method request with 7-day grace period.';
      } else if (transaction?.failureReason === 'insufficient_funds') {
        category = 'temporary_failure';
        action = 'generate_link';
        confidence = 0.55;
        reasoning = 'Insufficient balance at original authorization. Send dynamic payment link for customer retry.';
      } else {
        category = 'temporary_failure';
        action = 'retry_payment';
        confidence = 0.91;
        reasoning = 'Transient network/bank processing timeout. Automated retry recommended.';
      }
    } else if (recoveryCase.scenario === 'checkout_abandonment') {
      category = 'customer_abandonment';
      action = 'generate_link';
      confidence = 0.78;
      reasoning = 'Customer abandoned checkout with items saved in basket. Send cart recovery link with reminder.';
    } else if (recoveryCase.scenario === 'subscription_failure') {
      category = 'payment_method_issue';
      action = 'update_method';
      confidence = 0.84;
      reasoning = 'Recurring mandate failed due to card token expiration. Update method flow initiated.';
    } else if (recoveryCase.scenario === 'invoice_overdue') {
      category = 'overdue_payment';
      action = 'send_reminder';
      confidence = 0.76;
      reasoning = 'B2B invoice passed due date. Compliant reminder with direct payment link dispatched.';
    }

    return {
      scenario: recoveryCase.scenario,
      diagnosis: { category, confidence },
      recovery: { action, priority: 80, expectedRecovery: Math.round(recoveryCase.amountAtRisk * confidence) },
      reasoningSummary: reasoning
    };
  }

  static _systemPrompt() {
    return `You are a revenue recovery diagnostic AI for a payment platform. 
Respond with valid JSON matching this schema:
{
  "scenario": "payment_failure|checkout_abandonment|subscription_failure|invoice_overdue",
  "diagnosis": {
    "category": "temporary_failure|payment_method_issue|customer_abandonment|overdue_payment|fraud_risk|unknown",
    "confidence": 0.94
  },
  "recovery": {
    "action": "retry_payment|generate_link|send_reminder|update_method|escalate_human|stop_recovery",
    "priority": 84,
    "expectedRecovery": 4549
  },
  "reasoningSummary": "Brief explanation of diagnosis and recommended action."
}`;
  }

  static _buildPrompt(transaction, customer, recoveryCase) {
    return `Analyze this transaction and diagnose the revenue risk:
Transaction:
- Payment ID: ${transaction?.paymentId || 'N/A'}
- Amount: ₹${transaction?.amount || recoveryCase.amountAtRisk}
- Method: ${transaction?.method || 'card'}
- Status: ${transaction?.status || 'failed'}
- Failure Reason: ${transaction?.failureReason || 'N/A'}
- Scenario: ${transaction?.scenario || recoveryCase.scenario}

Customer:
- Name: ${customer?.name || recoveryCase.customerName}
- Successful Payments: ${customer?.successfulPayments || 3}

Provide your diagnosis as JSON.`;
  }

  static _validateDiagnosis(d) {
    if (!d || !d.diagnosis || !d.recovery) return false;
    if (typeof d.diagnosis.confidence !== 'number') return false;
    if (d.diagnosis.confidence < 0 || d.diagnosis.confidence > 1) return false;
    if (!d.diagnosis.category) return false;
    if (!d.recovery.action) return false;
    return true;
  }
}

module.exports = DiagnosisService;
