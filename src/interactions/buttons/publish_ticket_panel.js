const { ChannelSelectMenuBuilder, ActionRowBuilder, ChannelType, MessageFlags } = require('discord.js');

module.exports = {
    async execute(interaction) {
        // 1. Cria o Menu de Seleção de Canal (Nativo do Discord)
        // Isso permite pesquisar canais e mostra a lista completa do servidor
        const row = new ActionRowBuilder().addComponents(
            new ChannelSelectMenuBuilder()
                .setCustomId('confirm_publish_channel') // Mantém o ID para o handler funcionar
                .setPlaceholder('📍 Pesquise ou selecione o canal de destino...')
                .setChannelTypes(ChannelType.GuildText) // Filtra apenas canais de texto
        );

        // 2. Responde apenas para o admin (Ephemeral)
        await interaction.reply({ 
            content: '📢 Publicação da Vitrine\nSelecione abaixo em qual canal deseja enviar o painel de tickets:', 
            components: [row], 
            flags: MessageFlags.Ephemeral 
        });
    }
};
