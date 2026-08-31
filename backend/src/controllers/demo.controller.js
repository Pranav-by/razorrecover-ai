const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');
const RecoveryCase = require('../models/RecoveryCase');
const RecoveryAction = require('../models/RecoveryAction');
const AuditLog = require('../models/AuditLog');
const BatchRun = require('../models/BatchRun');

class DemoController {
  /**
   * POST /api/demo/seed
   */
  static async seed(req, res, next) {
    try {
      // Import seed data module (runs the generators, not the main function)
      const path = require('path');
      const seedModule = require(path.resolve(__dirname, '../data/seed-data.js'));
      // If we got here, seed already ran via require. Send result.
      res.json({ message: 'Seed data loaded. Run "npm run seed" for fresh data.' });
    } catch (err) { next(err); }
  }

  /**
   * POST /api/demo/reset
   */
  static async reset(req, res, next) {
    try {
      await RecoveryCase.deleteMany({});
      await RecoveryAction.deleteMany({});
      await AuditLog.collection.drop().catch(() => {});
      await BatchRun.deleteMany({});

      res.json({ message: 'Recovery data cleared. Transactions and customers preserved. Ready for a new batch run.' });
    } catch (err) { next(err); }
  }

  /**
   * POST /api/demo/full-reset
   */
  static async fullReset(req, res, next) {
    try {
      await Transaction.deleteMany({});
      await Customer.deleteMany({});
      await RecoveryCase.deleteMany({});
      await RecoveryAction.deleteMany({});
      await AuditLog.collection.drop().catch(() => {});
      await BatchRun.deleteMany({});

      res.json({ message: 'All data cleared. Run "npm run seed" to re-populate.' });
    } catch (err) { next(err); }
  }
}

module.exports = DemoController;
