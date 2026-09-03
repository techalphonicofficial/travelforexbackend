const { Sequelize } = require('sequelize');
const db = require('./src/database');

async function addColumn() {
    try {
        await db.query(`ALTER TABLE "hotels" ADD COLUMN IF NOT EXISTS "is_hot_deal" BOOLEAN NOT NULL DEFAULT false;`);

    } catch (e) {
        console.error("Failed to add column:", e);
    } finally {
        process.exit();
    }
}

addColumn();
