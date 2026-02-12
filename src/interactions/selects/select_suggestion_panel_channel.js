const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const channelId = interaction.values[0];
        const channel = interaction.guild.channels.cache.get(channelId);
        
        // Pega config do banco
        const config = await interaction.client.db.guild.findUnique({ where: { id: interaction.guild.id } });
        
        // Usa o banner configurado ou um padrão
        const bannerUrl = config.suggestionBanner || 'https://i.imgur.com/7w2yv8I.png';

        const embed = new EmbedBuilder()
            .setTitle('💡 Central de Sugestões / Suggestion Center')
            .setDescription(
                '🇧🇷 **Ajude a melhorar o servidor!** Clique abaixo para enviar sua ideia.\n' +
                '🇺🇸 **Help us improve!** Click below to send your feedback.'
            )
            .setColor('#F1C40F')
            .setImage(bannerUrl) // <--- IMAGEM DINÂMICA
            .setFooter({ text: 'Rustvalley Manager • Feedback' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_suggest_pt')
                .setLabel('💡 Sugerir (PT-BR)')
                .setStyle(ButtonStyle.Success),
            
            new ButtonBuilder()
                .setCustomId('btn_suggest_en')
                .setLabel('💡 Suggest (EN-US)')
                .setStyle(ButtonStyle.Primary)
        );

        await channel.send({ embeds: [embed], components: [row] });
        await interaction.update({ content: `✅ Vitrine enviada para ${channel}!`, components: [] });
    }
};