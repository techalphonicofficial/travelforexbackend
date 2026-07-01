'use strict';

const tableExists = async (queryInterface, tableName) => {
  const tables = await queryInterface.showAllTables();
  return tables
    .map(table => (typeof table === 'object' ? (table.tableName || table.name) : table))
    .includes(tableName);
};

const addColumnIfMissing = async (queryInterface, tableName, columnName, definition) => {
  const table = await queryInterface.describeTable(tableName).catch(() => null);
  if (table && !table[columnName]) {
    await queryInterface.addColumn(tableName, columnName, definition);
  }
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = Sequelize.fn('now');

    if (!(await tableExists(queryInterface, 'vouchers'))) {
      await queryInterface.createTable('vouchers', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        voucher_no: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        voucher_type: {
          type: Sequelize.STRING,
          allowNull: false
        },
        voucher_date: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: now
        },
        financial_year: {
          type: Sequelize.STRING,
          allowNull: false
        },
        status: {
          type: Sequelize.STRING,
          allowNull: false,
          defaultValue: 'posted'
        },
        reference_type: {
          type: Sequelize.STRING,
          allowNull: true
        },
        reference_id: {
          type: Sequelize.STRING,
          allowNull: true
        },
        party_type: {
          type: Sequelize.STRING,
          allowNull: true
        },
        party_id: {
          type: Sequelize.STRING,
          allowNull: true
        },
        total_amount: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          defaultValue: 0.00
        },
        narration: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        metadata: {
          type: Sequelize.JSONB,
          allowNull: false,
          defaultValue: {}
        },
        created_by: {
          type: Sequelize.UUID,
          allowNull: true,
          references: { model: 'users', key: 'id' },
          onDelete: 'SET NULL'
        },
        posted_by: {
          type: Sequelize.UUID,
          allowNull: true,
          references: { model: 'users', key: 'id' },
          onDelete: 'SET NULL'
        },
        cancelled_by: {
          type: Sequelize.UUID,
          allowNull: true,
          references: { model: 'users', key: 'id' },
          onDelete: 'SET NULL'
        },
        posted_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        cancelled_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false
        }
      });

      await queryInterface.addIndex('vouchers', ['voucher_no'], { unique: true, name: 'vouchers_no_unique_idx' });
      await queryInterface.addIndex('vouchers', ['voucher_type'], { name: 'vouchers_type_idx' });
      await queryInterface.addIndex('vouchers', ['status'], { name: 'vouchers_status_idx' });
      await queryInterface.addIndex('vouchers', ['voucher_date'], { name: 'vouchers_date_idx' });
      await queryInterface.addIndex('vouchers', ['reference_type', 'reference_id'], { name: 'vouchers_reference_idx' });
    }

    if (!(await tableExists(queryInterface, 'voucher_sequences'))) {
      await queryInterface.createTable('voucher_sequences', {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          primaryKey: true
        },
        voucher_type: {
          type: Sequelize.STRING,
          allowNull: false
        },
        financial_year: {
          type: Sequelize.STRING,
          allowNull: false
        },
        prefix: {
          type: Sequelize.STRING,
          allowNull: false
        },
        current_number: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false
        }
      });

      await queryInterface.addIndex('voucher_sequences', ['voucher_type', 'financial_year'], {
        unique: true,
        name: 'voucher_sequences_type_year_unique_idx'
      });
    }

    await addColumnIfMissing(queryInterface, 'journal_entries', 'voucher_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'vouchers', key: 'id' },
      onDelete: 'SET NULL'
    });

    await queryInterface.addIndex('journal_entries', ['voucher_id'], { name: 'journal_entries_voucher_id_idx' }).catch(() => null);
  },

  down: async (queryInterface) => {
    const journalTable = await queryInterface.describeTable('journal_entries').catch(() => null);
    if (journalTable && journalTable.voucher_id) {
      await queryInterface.removeColumn('journal_entries', 'voucher_id');
    }

    if (await tableExists(queryInterface, 'voucher_sequences')) {
      await queryInterface.dropTable('voucher_sequences');
    }
    if (await tableExists(queryInterface, 'vouchers')) {
      await queryInterface.dropTable('vouchers');
    }
  }
};
