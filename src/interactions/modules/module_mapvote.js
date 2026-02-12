const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🗺️ Votação de Mapas / Map Vote')
            .setDescription(
                'Crie enquetes visuais para os jogadores escolherem o próximo mapa.\n' +
                'Create visual polls for players to choose the next map.'
            )
            .setColor('#E67E22')
            .addFields(
                { name: 'Como funciona?', value: 'O bot envia uma mensagem com as imagens dos dois mapas e botões de voto.' }
            )
            .setImage('https://files.facepunch.com/rust/comm/2020/january/blog_header_2.png'); // Placeholder Rust

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_create_mapvote')
                .setLabel('Criar Votação / Create Poll')
                .setStyle(ButtonStyle.Success)
                .setEmoji('📊'),
            
            new ButtonBuilder()
                .setCustomId('module_community')
                .setLabel('Voltar')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('⬅️')
        );

        const payload = { embeds: [embed], components: [row], content: null };
        if (interaction.replied || interaction.deferred) await interaction.editReply(payload);
        else await interaction.update(payload);
    }
};