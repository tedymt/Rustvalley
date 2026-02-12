const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('modal_announcement_schedule')
            .setTitle('Agendar Disparo');

        const timeInput = new TextInputBuilder()
            .setCustomId('ann_time')
            .setLabel('Data e Hora (DD/MM/AAAA HH:MM)')
            .setPlaceholder('Ex: 25/12/2026 18:00')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const intervalInput = new TextInputBuilder()
            .setCustomId('ann_interval')
            .setLabel('Repetir a cada quantos dias? (0 = Não)')
            .setPlaceholder('Ex: 7 (para repetir semanalmente)')
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(timeInput),
            new ActionRowBuilder().addComponents(intervalInput)
        );

        await interaction.showModal(modal);
    }
};