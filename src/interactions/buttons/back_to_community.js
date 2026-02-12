const moduleCommunity = require('../modules/module_community.js');

module.exports = {
    async execute(interaction) {
        // Chama o módulo de comunidade novamente, atualizando a mensagem
        await moduleCommunity.execute(interaction);
    }
};