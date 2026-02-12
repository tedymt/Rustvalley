const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🎉 Sistema de Sorteios / Giveaways')
            .setDescription(
                'Gerencie sorteios automáticos no seu servidor.\n' +
                'Manage automatic giveaways on your server.'
            )
            .setColor('#FF007F') // Rosa choque
            .addFields(
                { name: 'Comandos', value: 'Use os botões abaixo para criar, listar ou editar.' }
            );

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_create_giveaway')
                .setLabel('Novo Sorteio')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🎉'),
    

            new ButtonBuilder()
                .setCustomId('module_community')
                .setLabel('Voltar')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('⬅️')
        );

        const payload = { embeds: [embed], components: [row], content: null };
        if (interaction.replied || interaction.deferred) await interaction.editReply(payload);
        else await interaction.update(payload);
    }
};