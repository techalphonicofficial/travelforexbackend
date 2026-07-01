'use strict';

const normalizeTableName = (table) => {
  if (typeof table === 'string') return table;
  return table && (table.tableName || table.name);
};

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = (await queryInterface.showAllTables()).map(normalizeTableName);
    if (tables.includes('newsletters')) return;

    await queryInterface.createTable('newsletters', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(120),
        allowNull: true
      },
      email: {
        type: Sequelize.STRING(180),
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING(40),
        allowNull: true
      },
      source: {
        type: Sequelize.STRING(80),
        allowNull: false,
        defaultValue: 'website'
      },
      status: {
        type: Sequelize.STRING(30),
        allowNull: false,
        defaultValue: 'subscribed'
      },
      subscribed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('newsletters', ['email'], {
      name: 'newsletters_email_unique',
      unique: true
    });
    await queryInterface.addIndex('newsletters', ['status'], { name: 'newsletters_status_idx' });
    await queryInterface.addIndex('newsletters', ['created_at'], { name: 'newsletters_created_at_idx' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('newsletters');
  }
};
