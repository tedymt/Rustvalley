const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('modal_lfg_banner')
            .setTitle('Banner da Vitrine LFG');

        const input = new TextInputBuilder()
            .setCustomId('url')
            .setLabel('URL da Imagem / Image URL')
            .setPlaceholder('https://i.imgur.com/exemplo.png')
            .setStyle(TextInputStyle.Short)
            .setRequired(false); // Se deixar vazio, remove o banner

        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await interaction.showModal(modal);
    }
};