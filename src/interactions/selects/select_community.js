const { MessageFlags } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const selected = interaction.values[0];

        if (selected === 'opt_tickets') {
            const module = require('../modules/module_tickets.js');
            await module.execute(interaction);
        } 
        else if (selected === 'opt_welcome') {
            const module = require('../modules/module_welcome.js');
            await module.execute(interaction);
        } 
        // --- CORREÇÃO: AGORA APONTA PARA O MÓDULO REAL ---
        else if (selected === 'opt_suggestions') {
            const module = require('../modules/module_suggestions.js');
            await module.execute(interaction);
        }
    }
};