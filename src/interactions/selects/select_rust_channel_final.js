const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    async execute(interaction) {
        // ID: select_rust_channel_final_15
        const serverId = parseInt(interaction.customId.split('_').pop());
        const channelId = interaction.values[0];

        // Salva o Canal primeiro
        await interaction.client.db.rustServer.update({
            where: { id: serverId },
            data: { announceChannelId: channelId }
        });

        const embed = new EmbedBuilder()
            .setTitle('🌐 Escolha o Idioma / Choose Language')
            .setDescription('Em qual idioma o anúncio de Wipe deve ser enviado neste canal?')
            .setColor('#3498DB');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`btn_rust_lang_PT_${serverId}`).setLabel('Português 🇧🇷').setStyle(ButtonStyle.Success).setEmoji('🇧🇷'),
            new ButtonBuilder().setCustomId(`btn_rust_lang_EN_${serverId}`).setLabel('English 🇺🇸').setStyle(ButtonStyle.Secondary).setEmoji('🇺🇸'),
            // Botão extra para editar mensagem
            new ButtonBuilder().setCustomId(`btn_rust_msg_custom_${serverId}`).setLabel('Editar Texto Personalizado').setStyle(ButtonStyle.Primary).setEmoji('✏️')
        );

        await interaction.update({ embeds: [embed], components: [row] });
    }
};