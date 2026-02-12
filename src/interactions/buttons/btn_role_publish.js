const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ChannelSelectMenuBuilder, ChannelType } = require('discord.js');

module.exports = {
    async execute(interaction) {
        // Passo 1: Perguntar onde enviar o painel (Seleção de Canal)
        // Isso evita erros de tentar enviar no canal errado
        const row = new ActionRowBuilder().addComponents(
            new ChannelSelectMenuBuilder()
                .setCustomId('select_role_publish_channel')
                .setPlaceholder('📢 Onde enviar o Painel de Cargos?')
                .setChannelTypes(ChannelType.GuildText)
        );

        await interaction.reply({ content: 'Selecione o canal para publicar o painel:', components: [row], ephemeral: true });
    }
};