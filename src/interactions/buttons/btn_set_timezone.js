const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('modal_rust_timezone')
            .setTitle('Fuso Horário / Timezone');

        const input = new TextInputBuilder()
            .setCustomId('timezone_input')
            .setLabel("Timezone IANA")
            .setPlaceholder('Ex: America/Sao_Paulo, UTC')
            .setValue('America/Sao_Paulo')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await interaction.showModal(modal);
    }
};