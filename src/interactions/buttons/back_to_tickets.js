const moduleTickets = require('../modules/module_tickets.js');

module.exports = {
    async execute(interaction) {
        // Chama o módulo de tickets novamente, atualizando a mensagem
        await moduleTickets.execute(interaction);
    }
};