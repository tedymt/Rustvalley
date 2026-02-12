const moduleRust = require('../modules/module_rust.js');

module.exports = {
    async execute(interaction) {
        await moduleRust.execute(interaction);
    }
};