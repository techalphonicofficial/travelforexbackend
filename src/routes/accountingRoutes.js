const express = require('express');
const router  = express.Router();
const { controllers } = require('../container');

const ac = (method) => (req, res) => controllers.accountingController[method](req, res);

router.get('/dashboard',      ac('dashboard'));
router.get('/vouchers',       ac('vouchers'));
router.get('/vouchers/new',   ac('newJournal'));
router.post('/vouchers',      ac('createJournal'));
router.get('/vouchers/:id',   ac('voucherDetail'));
router.get('/ledger',         ac('ledger'));
router.get('/accounts',       ac('accounts'));
router.get('/trial-balance',  ac('trialBalance'));
router.get('/pnl',            ac('pnl'));
router.get('/journal/new',    (req, res) => res.redirect('/accounting/vouchers/new'));
router.post('/journal',       ac('createJournal'));

module.exports = router;
