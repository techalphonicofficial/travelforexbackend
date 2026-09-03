
const { Role } = require('./src/models');
const sequelize = require('./src/database');

async function checkRoles() {
    try {
        await sequelize.authenticate();

        const roles = await Role.findAll();

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkRoles();
