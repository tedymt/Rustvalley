const moduleCommunity = require('../modules/module_community.js');

module.exports = {
    async execute(interaction) {
        await moduleCommunity.execute(interaction);
    }
};