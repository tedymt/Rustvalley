const { MessageFlags } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const { guild, client } = interaction;

        // Busca config atual
        const config = await client.db.ticketConfig.findUnique({ where: { guildId: guild.id } });
        
        if (!config) {
            return interaction.reply({ content: '❌ Configuração não encontrada.', flags: MessageFlags.Ephemeral });
        }

        // Inverte o valor (True -> False / False -> True)
        const newValue = !config.sendTranscriptToDM;

        await client.db.ticketConfig.update({
            where: { guildId: guild.id },
            data: { sendTranscriptToDM: newValue }
        });

        // Recarrega o menu principal para atualizar o visual
        const moduleTickets = require('../modules/module_tickets.js');
        await moduleTickets.execute(interaction);
    }
};