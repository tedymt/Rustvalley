const { MessageFlags } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const selectedModule = interaction.values[0];

        try {
            // --- MÓDULO RUST ---
            if (selectedModule === 'module_rust') {
                const module = require('../modules/module_rust.js');
                await module.execute(interaction);
            } 
            // --- MÓDULO COMUNIDADE (Tickets, Boas-vindas, Sugestões) ---
            else if (selectedModule === 'module_community') {
                const module = require('../modules/module_community.js');
                await module.execute(interaction);
            } 
            // --- MÓDULO SEGURANÇA (Anti-Link, Anti-Fake, Logs) ---
            else if (selectedModule === 'module_security') {
                const module = require('../modules/module_security.js'); // <--- AGORA APONTA PARA O MÓDULO REAL
                await module.execute(interaction);
            }
        } catch (error) {
            console.error(`[ERRO MÓDULO] Falha ao carregar ${selectedModule}:`, error);
            await interaction.reply({ 
                content: '❌ Erro ao carregar o módulo. Verifique o console.', 
                flags: MessageFlags.Ephemeral 
            });
        }
    }
};