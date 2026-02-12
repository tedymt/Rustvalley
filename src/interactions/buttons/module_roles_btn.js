const moduleRoles = require('../modules/module_roles.js');

module.exports = {
    async execute(interaction) {
        await moduleRoles.execute(interaction);
    }
};