/**
 * Seed Data Generator for RazorRecover AI
 * Creates 500+ synthetic transactions across all 4 MVP scenarios.
 *
 * Run: node src/data/seed-data.js
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');

// ─── Customer Pool ───────────────────────────────────────────────────────────

const customers = [
  { customerId: 'CUS_101', name: 'Rahul Sharma', email: 'rahul@example.com', phone: '+91-9876543210', successfulPayments: 5, totalSpend: 45000, riskLevel: 'low', consentChannels: ['email', 'sms'] },
  { customerId: 'CUS_102', name: 'Priya Patel', email: 'priya@example.com', phone: '+91-9876543211', successfulPayments: 12, totalSpend: 120000, riskLevel: 'low', consentChannels: ['email', 'sms', 'notification'] },
  { customerId: 'CUS_103', name: 'Amit Kumar', email: 'amit@example.com', phone: '+91-9876543212', successfulPayments: 3, totalSpend: 8500, riskLevel: 'medium', consentChannels: ['email'] },
  { customerId: 'CUS_104', name: 'Neha Singh', email: 'neha@example.com', phone: '+91-9876543213', successfulPayments: 8, totalSpend: 67000, riskLevel: 'low', consentChannels: ['email', 'sms'] },
  { customerId: 'CUS_105', name: 'Vikram Reddy', email: 'vikram@example.com', phone: '+91-9876543214', successfulPayments: 1, totalSpend: 2500, riskLevel: 'high', consentChannels: ['email'] },
  { customerId: 'CUS_106', name: 'Ananya Gupta', email: 'ananya@example.com', phone: '+91-9876543215', successfulPayments: 20, totalSpend: 250000, riskLevel: 'low', consentChannels: ['email', 'sms', 'notification'] },
  { customerId: 'CUS_107', name: 'Rohan Mehta', email: 'rohan@example.com', phone: '+91-9876543216', successfulPayments: 0, totalSpend: 0, riskLevel: 'high', consentChannels: ['email'] },
  { customerId: 'CUS_108', name: 'Deepika Joshi', email: 'deepika@example.com', phone: '+91-9876543217', successfulPayments: 15, totalSpend: 180000, riskLevel: 'low', consentChannels: ['email', 'sms'] },
  { customerId: 'CUS_109', name: 'Arjun Nair', email: 'arjun@example.com', phone: '+91-9876543218', successfulPayments: 6, totalSpend: 42000, riskLevel: 'low', consentChannels: ['email', 'sms'] },
  { customerId: 'CUS_110', name: 'Kavitha Rao', email: 'kavitha@example.com', phone: '+91-9876543219', successfulPayments: 2, totalSpend: 15000, riskLevel: 'medium', consentChannels: ['email'] },
  // B2B customers
  { customerId: 'CUS_201', name: 'TechStar Solutions Pvt Ltd', email: 'accounts@techstar.com', phone: '+91-9876543220', successfulPayments: 10, totalSpend: 2500000, riskLevel: 'low', consentChannels: ['email'] },
  { customerId: 'CUS_202', name: 'CloudNine Services', email: 'finance@cloudnine.com', phone: '+91-9876543221', successfulPayments: 8, totalSpend: 1800000, riskLevel: 'low', consentChannels: ['email'] },
  { customerId: 'CUS_203', name: 'Digital Dynamics Inc', email: 'billing@digitaldyn.com', phone: '+91-9876543222', successfulPayments: 4, totalSpend: 600000, riskLevel: 'medium', consentChannels: ['email'] },
  // Opted-out customer (for stopping rule demo)
  { customerId: 'CUS_301', name: 'Suresh Iyer', email: 'suresh@example.com', phone: '+91-9876543223', successfulPayments: 3, totalSpend: 12000, riskLevel: 'medium', optedOut: true, consentChannels: [] },
  // Disputed customer
  { customerId: 'CUS_302', name: 'Meera Krishnan', email: 'meera@example.com', phone: '+91-9876543224', successfulPayments: 7, totalSpend: 55000, riskLevel: 'medium', consentChannels: ['email'], disputeHistory: [{ disputeId: 'DSP_001', amount: 5000, status: 'open', createdAt: new Date() }] },
];

// ─── Helper Functions ────────────────────────────────────────────────────────

let paymentCounter = 1000;
function nextPaymentId() { return `pay_${++paymentCounter}`; }

let invoiceCounter = 100;
function nextInvoiceId() { return `inv_${++invoiceCounter}`; }

let subCounter = 50;
function nextSubId() { return `sub_${++subCounter}`; }

function randomAmount(min, max) {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function randomDate(daysBack) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  d.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
  return d;
}

// ─── Transaction Generators ──────────────────────────────────────────────────

function generateSuccessful(count) {
  const txns = [];
  for (let i = 0; i < count; i++) {
    const cust = randomChoice(customers.slice(0, 10));
    txns.push({
      paymentId: nextPaymentId(),
      customerId: cust.customerId,
      customerName: cust.name,
      customerEmail: cust.email,
      amount: randomAmount(199, 25000),
      method: randomChoice(['upi', 'card', 'netbanking', 'wallet']),
      status: 'success',
      failureReason: null,
      scenario: 'successful',
      attempts: 1,
      orderDescription: randomChoice(['Electronics', 'Clothing', 'Books', 'Software', 'Subscription', 'Groceries']),
      createdAt: randomDate(30)
    });
  }
  return txns;
}

function generatePaymentFailures(count) {
  const txns = [];
  const reasons = ['upi_timeout', 'bank_decline', 'insufficient_funds', 'network_error', 'authentication_failure'];
  const methods = ['upi', 'card', 'netbanking'];

  for (let i = 0; i < count; i++) {
    const cust = randomChoice(customers.slice(0, 10));
    const attempts = Math.floor(Math.random() * 4) + 1;
    txns.push({
      paymentId: nextPaymentId(),
      customerId: cust.customerId,
      customerName: cust.name,
      customerEmail: cust.email,
      amount: randomAmount(500, 50000),
      method: randomChoice(methods),
      status: 'failed',
      failureReason: randomChoice(reasons),
      scenario: 'payment_failure',
      attempts,
      orderDescription: randomChoice(['Premium Plan', 'Electronics', 'Course Fee', 'Software License', 'Annual Membership']),
      createdAt: randomDate(7)
    });
  }

  // ── Key demo cases ──
  // Case #001: Rahul, ₹6,999, UPI timeout, 1 attempt (high recovery)
  txns.push({
    paymentId: 'pay_demo_001',
    customerId: 'CUS_101',
    customerName: 'Rahul Sharma',
    customerEmail: 'rahul@example.com',
    amount: 6999,
    method: 'upi',
    status: 'failed',
    failureReason: 'upi_timeout',
    scenario: 'payment_failure',
    attempts: 1,
    orderDescription: 'Wireless Headphones',
    createdAt: new Date()
  });

  // Case #005: High value, too many retries → policy block
  txns.push({
    paymentId: 'pay_demo_005',
    customerId: 'CUS_106',
    customerName: 'Ananya Gupta',
    customerEmail: 'ananya@example.com',
    amount: 50000,
    method: 'card',
    status: 'failed',
    failureReason: 'bank_decline',
    scenario: 'payment_failure',
    attempts: 3,
    orderDescription: 'Annual Enterprise License',
    createdAt: new Date()
  });

  // Opted-out customer → stopping rule
  txns.push({
    paymentId: 'pay_demo_optout',
    customerId: 'CUS_301',
    customerName: 'Suresh Iyer',
    customerEmail: 'suresh@example.com',
    amount: 3500,
    method: 'upi',
    status: 'failed',
    failureReason: 'upi_timeout',
    scenario: 'payment_failure',
    attempts: 1,
    orderDescription: 'Monthly Subscription',
    createdAt: new Date()
  });

  // Disputed customer → stopping rule
  txns.push({
    paymentId: 'pay_demo_dispute',
    customerId: 'CUS_302',
    customerName: 'Meera Krishnan',
    customerEmail: 'meera@example.com',
    amount: 5000,
    method: 'card',
    status: 'failed',
    failureReason: 'bank_decline',
    scenario: 'payment_failure',
    attempts: 1,
    orderDescription: 'Premium Features',
    createdAt: new Date()
  });

  return txns;
}

function generateCheckoutAbandonment(count) {
  const txns = [];
  for (let i = 0; i < count; i++) {
    const cust = randomChoice(customers.slice(0, 10));
    const events = ['product_viewed', 'added_to_cart', 'checkout_started'];
    if (Math.random() > 0.3) events.push('payment_page_opened');
    events.push('customer_left');

    txns.push({
      paymentId: nextPaymentId(),
      customerId: cust.customerId,
      customerName: cust.name,
      customerEmail: cust.email,
      amount: randomAmount(999, 30000),
      method: randomChoice(['upi', 'card']),
      status: 'abandoned',
      failureReason: 'customer_abandonment',
      scenario: 'checkout_abandonment',
      checkoutEvents: events,
      attempts: 0,
      orderDescription: randomChoice(['Smartphone', 'Laptop', 'Fashion Bundle', 'Home Appliance', 'Fitness Tracker']),
      createdAt: randomDate(5)
    });
  }

  // Case #002: High-intent checkout abandonment
  txns.push({
    paymentId: 'pay_demo_002',
    customerId: 'CUS_104',
    customerName: 'Neha Singh',
    customerEmail: 'neha@example.com',
    amount: 12999,
    method: 'upi',
    status: 'abandoned',
    failureReason: 'customer_abandonment',
    scenario: 'checkout_abandonment',
    checkoutEvents: ['product_viewed', 'added_to_cart', 'checkout_started', 'payment_page_opened', 'customer_left'],
    attempts: 0,
    orderDescription: 'Smart Watch Pro',
    createdAt: new Date()
  });

  return txns;
}

function generateSubscriptionFailures(count) {
  const txns = [];
  const plans = ['Basic Monthly', 'Pro Monthly', 'Enterprise Monthly', 'Premium Annual'];
  const amounts = [299, 999, 2999, 9999];

  for (let i = 0; i < count; i++) {
    const cust = randomChoice(customers.slice(0, 10));
    const planIdx = Math.floor(Math.random() * plans.length);
    txns.push({
      paymentId: nextPaymentId(),
      customerId: cust.customerId,
      customerName: cust.name,
      customerEmail: cust.email,
      amount: amounts[planIdx],
      method: randomChoice(['card', 'upi', 'emandate']),
      status: 'failed',
      failureReason: randomChoice(['expired_card', 'insufficient_funds', 'bank_decline']),
      scenario: 'subscription_failure',
      subscriptionId: nextSubId(),
      attempts: 1,
      orderDescription: plans[planIdx],
      createdAt: randomDate(10)
    });
  }

  // Case #003: Priya, ₹999 subscription, expired card
  txns.push({
    paymentId: 'pay_demo_003',
    customerId: 'CUS_102',
    customerName: 'Priya Patel',
    customerEmail: 'priya@example.com',
    amount: 999,
    method: 'card',
    status: 'failed',
    failureReason: 'expired_card',
    scenario: 'subscription_failure',
    subscriptionId: 'sub_demo_003',
    attempts: 1,
    orderDescription: 'Pro Monthly Plan',
    createdAt: new Date()
  });

  return txns;
}

function generateOverdueInvoices(count) {
  const txns = [];

  for (let i = 0; i < count; i++) {
    const cust = randomChoice(customers.slice(10, 13)); // B2B customers
    const daysOverdue = Math.floor(Math.random() * 30) + 1;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() - daysOverdue);

    txns.push({
      paymentId: nextPaymentId(),
      customerId: cust.customerId,
      customerName: cust.name,
      customerEmail: cust.email,
      amount: randomAmount(25000, 500000),
      method: 'bank_transfer',
      status: 'failed',
      failureReason: 'invoice_overdue',
      scenario: 'invoice_overdue',
      invoiceId: nextInvoiceId(),
      dueDate,
      attempts: 0,
      orderDescription: randomChoice(['Consulting Services', 'Software Development', 'Cloud Hosting', 'API Integration', 'Support Contract']),
      createdAt: dueDate
    });
  }

  // Case #004: TechStar, ₹2,50,000 overdue invoice
  const demoDate = new Date();
  demoDate.setDate(demoDate.getDate() - 6);
  txns.push({
    paymentId: 'pay_demo_004',
    customerId: 'CUS_201',
    customerName: 'TechStar Solutions Pvt Ltd',
    customerEmail: 'accounts@techstar.com',
    amount: 250000,
    method: 'bank_transfer',
    status: 'failed',
    failureReason: 'invoice_overdue',
    scenario: 'invoice_overdue',
    invoiceId: 'inv_demo_004',
    dueDate: demoDate,
    attempts: 0,
    orderDescription: 'Q3 Cloud Infrastructure Services',
    createdAt: demoDate
  });

  return txns;
}

// ─── Main Seed Function ──────────────────────────────────────────────────────

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Transaction.deleteMany({});
    await Customer.deleteMany({});
    console.log('🗑️  Cleared existing transactions and customers');

    // Seed customers
    await Customer.insertMany(customers);
    console.log(`👥 Seeded ${customers.length} customers`);

    // Generate transactions
    const allTransactions = [
      ...generateSuccessful(300),
      ...generatePaymentFailures(66),   // 66 random + 4 demo = 70
      ...generateCheckoutAbandonment(49), // 49 random + 1 demo = 50
      ...generateSubscriptionFailures(34), // 34 random + 1 demo = 35
      ...generateOverdueInvoices(24)      // 24 random + 1 demo = 25
    ];

    await Transaction.insertMany(allTransactions);
    console.log(`📦 Seeded ${allTransactions.length} transactions`);

    // Summary
    const summary = {
      total: allTransactions.length,
      successful: allTransactions.filter(t => t.scenario === 'successful').length,
      paymentFailures: allTransactions.filter(t => t.scenario === 'payment_failure').length,
      checkoutAbandonment: allTransactions.filter(t => t.scenario === 'checkout_abandonment').length,
      subscriptionFailures: allTransactions.filter(t => t.scenario === 'subscription_failure').length,
      overdueInvoices: allTransactions.filter(t => t.scenario === 'invoice_overdue').length,
    };

    console.log('\n📊 Seed Summary:');
    console.table(summary);
    console.log('\n✅ Seeding complete!');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();

module.exports = { customers, generateSuccessful, generatePaymentFailures, generateCheckoutAbandonment, generateSubscriptionFailures, generateOverdueInvoices };
