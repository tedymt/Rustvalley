const moduleRustLfg = require('../modules/module_rust_lfg.js');

module.exports = {
    async execute(interaction) {
        await moduleRustLfg.execute(interaction);
    }
};