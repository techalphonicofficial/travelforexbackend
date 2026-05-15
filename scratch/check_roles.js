
const { Role } = require('./src/models');
const sequelize = require('./src/database');

async function checkRoles() {
    try {
        await sequelize.authenticate();
        console.log('Connection established.');
        const roles = await Role.findAll();
        console.log('Roles:', JSON.stringify(roles, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkRoles();
