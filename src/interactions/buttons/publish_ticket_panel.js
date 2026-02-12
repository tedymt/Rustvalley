const { StringSelectMenuBuilder, ActionRowBuilder, ChannelType, MessageFlags } = require('discord.js');

module.exports = {
    async execute(interaction) {
        // 1. Busca os primeiros 25 canais de texto do servidor
        const channels = interaction.guild.channels.cache
            .filter(c => c.type === ChannelType.GuildText)
            .first(25); // O Discord limita select menus a 25 opções

        if (channels.length === 0) {
            return interaction.reply({ 
                content: '❌ Nenhum canal de texto encontrado neste servidor.', 
                flags: MessageFlags.Ephemeral 
            });
        }

        // 2. Cria o Menu de Seleção
        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('confirm_publish_channel') // Já temos o handler para isso em 'selects/'
                .setPlaceholder('📍 Selecione o canal de destino')
                .addOptions(channels.map(c => ({ label: c.name, value: c.id })))
        );

        // 3. Responde apenas para o admin (Ephemeral) para não fechar o painel principal
        await interaction.reply({ 
            content: '📢 **Publicação da Vitrine**\nSelecione abaixo em qual canal deseja enviar o painel de tickets:', 
            components: [row], 
            flags: MessageFlags.Ephemeral 
        });
    }
};