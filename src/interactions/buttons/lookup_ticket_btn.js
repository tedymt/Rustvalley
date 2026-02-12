const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('modal_lookup_ticket')
            .setTitle('🔍 Localizar Atendimento');

        const input = new TextInputBuilder()
            .setCustomId('query_code')
            .setLabel('Código ou ID (Ex: K-9X2A)')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await interaction.showModal(modal);
    }
};