const { MessageFlags } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const selected = interaction.values[0];

        try {
            // Roteamento para os arquivos corretos
            if (selected === 'ticket_ui') {
                // Configuração de Aparência (está na pasta selects)
                const handler = require('./ticket_ui.js');
                await handler.execute(interaction);
            } 
            else if (selected === 'ticket_infra') {
                // Configuração de Infraestrutura (está na pasta selects)
                const handler = require('./ticket_infra.js');
                await handler.execute(interaction);
            } 
            else if (selected === 'ticket_deps') {
                // Departamentos (está na pasta modules)
                const handler = require('../modules/ticket_deps.js');
                await handler.execute(interaction);
            } 
            else if (selected === 'ticket_ranking') {
                // Ranking (está na pasta modules)
                const handler = require('../modules/ticket_ranking.js');
                await handler.execute(interaction);
            }
            else {
                console.warn(`[ROTA DESCONHECIDA] ${selected}`);
                await interaction.reply({ 
                    content: '❌ Funcionalidade não mapeada.', 
                    flags: MessageFlags.Ephemeral 
                });
            }

        } catch (error) {
            console.error(`[ERRO ROUTER TICKETS] Falha ao carregar ${selected}:`, error);
            await interaction.reply({ 
                content: '❌ Erro interno ao carregar a opção selecionada.', 
                flags: MessageFlags.Ephemeral 
            });
        }
    }
};