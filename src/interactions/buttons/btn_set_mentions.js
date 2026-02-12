const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
module.exports = {
    async execute(interaction) {
        const modal = new ModalBuilder().setCustomId('modal_set_massmention').setTitle('Limite de Menções');
        const input = new TextInputBuilder()
            .setCustomId('qty_input')
            .setLabel("Máximo de menções (0 = Desativar)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: 5 (Acima de 5 marcações, deleta)')
            .setRequired(true);
        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await interaction.showModal(modal);
    }
};