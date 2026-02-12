const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
module.exports = {
    async execute(interaction) {
        const modal = new ModalBuilder().setCustomId('modal_suggest_en').setTitle('New Suggestion');
        const input = new TextInputBuilder().setCustomId('suggestion_text').setLabel('Describe your suggestion:').setStyle(TextInputStyle.Paragraph).setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await interaction.showModal(modal);
    }
};