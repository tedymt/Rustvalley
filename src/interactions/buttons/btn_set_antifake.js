const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('modal_set_antifake')
            .setTitle('Anti-Fake / Anti-Alt');

        const input = new TextInputBuilder()
            .setCustomId('days_input')
            .setLabel("Dias mínimos de conta (0 p/ desativar)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Ex: 7 (Contas com menos de 7 dias serão expulsas)')
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await interaction.showModal(modal);
    }
};