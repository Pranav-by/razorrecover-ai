const OpenAI = require('openai');
const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');
const AuditService = require('./audit.service');
const logger = require('../utils/logger');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Diagnostic Agent — AI-powered root cause analysis.
 * Uses OpenAI gpt-4o-mini to diagnose why revenue is at risk.
 * Returns structured JSON validated against output contract.
 */
class DiagnosisService {
  /**
   * Diagnose a recovery case and update it with findings.
   */
  static async diagnose(recoveryCase, batchId) {
    logger.agent('DIAGNOSTIC_AGENT', `Diagnosing case ${recoveryCase.caseId}...`);

    const transaction = await Transaction.findById(recoveryCase.transactionId).lean();
    const customer = await Customer.findOne({ customerId: recoveryCase.customerId }).lean();

    try {
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
      const diagnosis = JSON.parse(content);

      // Validate output contract
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

      logger.agent('DIAGNOSTIC_AGENT', `Diagnosed ${recoveryCase.caseId}: ${diagnosis.diagnosis.category} (${Math.round(diagnosis.diagnosis.confidence * 100)}%)`);
      return diagnosis;

    } catch (err) {
      logger.error(`Diagnosis failed for ${recoveryCase.caseId}: ${err.message}`);

      // Fallback: set low confidence, route to human review
      recoveryCase.diagnosis = {
        category: 'unknown',
        confidence: 0.3,
        recoverability: 'low',
        reasoning: `AI diagnosis failed: ${err.message}. Routed to human review.`
      };
      recoveryCase.status = 'DIAGNOSING';
      await recoveryCase.save();

      await AuditService.log({
        recoveryCaseId: recoveryCase._id,
        batchId,
        event: 'diagnosis_complete',
        actor: 'ai',
        message: `Diagnosis fallback: AI error — ${err.message}`,
        metadata: { error: err.message }
      });

      return {
        scenario: recoveryCase.scenario,
        diagnosis: { category: 'unknown', confidence: 0.3 },
        recovery: { action: 'escalate_human', priority: 30, expectedRecovery: 0 },
        reasoningSummary: 'Unable to diagnose automatically. Human review required.'
      };
    }
  }

  static _systemPrompt() {
    return `You are a revenue recovery diagnostic AI for a payment platform. 
Your job is to analyze failed/at-risk transactions and determine:
1. Why the revenue is at risk (root cause category)
2. Your confidence in the diagnosis (0-1)
3. What recovery action is most appropriate
4. A brief human-readable reasoning

You MUST respond with valid JSON matching this exact schema:
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
}

Rules:
- Be conservative with confidence scores. Only use >0.90 for clear-cut cases.
- For expired cards, recommend update_method, NOT retry_payment.
- For insufficient funds, recommend delayed retry or payment link.
- For checkout abandonment, recommend generate_link + send_reminder.
- For overdue invoices, recommend send_reminder.
- If fraud is suspected, always recommend escalate_human.
- Priority should be 0-100 based on expected recovery value and urgency.`;
  }

  static _buildPrompt(transaction, customer, recoveryCase) {
    return `Analyze this transaction and diagnose the revenue risk:

Transaction:
- Payment ID: ${transaction.paymentId}
- Amount: ₹${transaction.amount}
- Method: ${transaction.method}
- Status: ${transaction.status}
- Failure Reason: ${transaction.failureReason || 'N/A'}
- Scenario: ${transaction.scenario}
- Attempts: ${transaction.attempts}
- Order: ${transaction.orderDescription || 'N/A'}
- Created: ${transaction.createdAt}

Customer:
- Name: ${customer?.name || 'Unknown'}
- Successful Payments: ${customer?.successfulPayments || 0}
- Total Spend: ₹${customer?.totalSpend || 0}
- Risk Level: ${customer?.riskLevel || 'unknown'}
- Opted Out: ${customer?.optedOut || false}
${transaction.scenario === 'checkout_abandonment' ? `- Checkout Events: ${(transaction.checkoutEvents || []).join(' → ')}` : ''}
${transaction.scenario === 'subscription_failure' ? `- Subscription: ${transaction.subscriptionId}` : ''}
${transaction.scenario === 'invoice_overdue' ? `- Invoice: ${transaction.invoiceId}, Due: ${transaction.dueDate}` : ''}

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
