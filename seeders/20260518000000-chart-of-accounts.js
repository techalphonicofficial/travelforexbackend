'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    
    // Default Chart of Accounts for Picktrails Travel Agency
    const accounts = [
      // Assets
      { id: uuidv4(), code: '1000', name: 'Cash and Bank', type: 'asset', description: 'Main operating bank account', is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), code: '1100', name: 'Accounts Receivable', type: 'asset', description: 'Money owed by customers', is_active: true, created_at: now, updated_at: now },
      
      // Liabilities
      { id: uuidv4(), code: '2000', name: 'Vendor Payables (Wallets)', type: 'liability', description: 'Funds held in vendor wallets', is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), code: '2100', name: 'Tax Payable', type: 'liability', description: 'Taxes collected to be paid to government', is_active: true, created_at: now, updated_at: now },
      
      // Revenue
      { id: uuidv4(), code: '4000', name: 'Sales Revenue', type: 'revenue', description: 'Commission or markup on packages', is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), code: '4100', name: 'Service Fees', type: 'revenue', description: 'Additional service fees charged', is_active: true, created_at: now, updated_at: now },
      
      // Expenses
      { id: uuidv4(), code: '5000', name: 'Cost of Goods Sold (Vendor Payments)', type: 'expense', description: 'Direct cost of packages paid to vendors', is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), code: '5100', name: 'Marketing & Advertising', type: 'expense', description: 'Ad spend', is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), code: '5200', name: 'Software Subscriptions', type: 'expense', description: 'SaaS tools, servers', is_active: true, created_at: now, updated_at: now },
      { id: uuidv4(), code: '5300', name: 'Bank & Payment Fees', type: 'expense', description: 'Gateway processing fees', is_active: true, created_at: now, updated_at: now }
    ];

    await queryInterface.bulkInsert('accounts', accounts, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('accounts', null, {});
  }
};
