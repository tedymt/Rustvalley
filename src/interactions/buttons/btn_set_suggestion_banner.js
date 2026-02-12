const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('modal_set_suggestion_banner')
            .setTitle('Configurar Banner');

        const input = new TextInputBuilder()
            .setCustomId('banner_url')
            .setLabel('Link da Imagem (URL)')
            .setPlaceholder('https://imgur.com/...')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await interaction.showModal(modal);
    }
};