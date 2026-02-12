const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType } = require('discord.js');

module.exports = {
    async execute(interaction) {
        // Pede onde enviar a interface
        const row = new ActionRowBuilder().addComponents(
            new ChannelSelectMenuBuilder()
                .setCustomId('select_publish_lfg_channel')
                .setPlaceholder('📢 Onde enviar o painel "Procurar Time"?')
                .setChannelTypes(ChannelType.GuildText)
        );

        await interaction.reply({ content: 'Selecione o canal para enviar o painel:', components: [row], ephemeral: true });
    }
};