const moduleAutoResponse = require('../modules/module_auto_response.js');
module.exports = {
    async execute(interaction) {
        await moduleAutoResponse.execute(interaction);
    }
};