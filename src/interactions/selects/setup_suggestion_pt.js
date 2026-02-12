const { ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const row = new ActionRowBuilder().addComponents(
            new ChannelSelectMenuBuilder()
                .setCustomId('setup_suggestion_channel_pt') // ID Específico para PT
                .setPlaceholder('🇧🇷 Selecione o canal de Sugestões PT-BR')
                .setChannelTypes(ChannelType.GuildText)
        );

        // Usa reply se for a primeira resposta, ou update se vier de outro componente
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'Selecione o canal abaixo:', components: [row], ephemeral: true });
        } else {
            await interaction.reply({ content: 'Selecione o canal abaixo:', components: [row], ephemeral: true });
        }
    }
};