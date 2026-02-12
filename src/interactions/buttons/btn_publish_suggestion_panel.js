const { ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const row = new ActionRowBuilder().addComponents(
            new ChannelSelectMenuBuilder()
                .setCustomId('select_suggestion_panel_channel')
                .setPlaceholder('📢 Onde enviar a Vitrine de Sugestões?')
                .setChannelTypes(ChannelType.GuildText)
        );
        await interaction.reply({ content: 'Selecione o canal para a vitrine:', components: [row], ephemeral: true });
    }
};