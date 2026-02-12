const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const channelId = interaction.values[0];
        const channel = interaction.guild.channels.cache.get(channelId);

        // Busca a configuração do servidor para pegar o banner customizado (se houver)
        const config = await interaction.client.db.guild.findUnique({ 
            where: { id: interaction.guild.id } 
        });

        // Define a imagem: Usa a do banco se existir, senão usa a padrão do Rust
        const bannerUrl = config?.rustLfgBanner || 'https://files.facepunch.com/rust/comm/2020/january/blog_header_2.png';

        const embed = new EmbedBuilder()
            .setTitle('🤝 Encontre seu Time / Find your Team')
            .setDescription(
                '🇧🇷 **Procurando grupo?** Clique no botão abaixo para criar um anúncio.\n' +
                '🇺🇸 **Looking for a group?** Click below to create a post.'
            )
            .setColor('#E67E22')
            .setImage(bannerUrl) // Aplica a imagem configurada ou a padrão
            .setFooter({ text: 'Rustvalley Manager • LFG System' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_lfg_start_pt')
                .setLabel('🇧🇷 Procurar Time')
                .setStyle(ButtonStyle.Success),
            
            new ButtonBuilder()
                .setCustomId('btn_lfg_start_en')
                .setLabel('🇺🇸 Find Team')
                .setStyle(ButtonStyle.Primary)
        );

        await channel.send({ embeds: [embed], components: [row] });
        await interaction.update({ content: `✅ Painel enviado para ${channel}!`, components: [] });
    }
};