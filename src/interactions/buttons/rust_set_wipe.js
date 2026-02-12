const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        // ID vem como rust_set_wipe_123
        const serverId = interaction.customId.split('_').pop();

        const modal = new ModalBuilder()
            .setCustomId(`modal_rust_server_wipe_${serverId}`) // ID Dinâmico para o Modal
            .setTitle('Data do Wipe (Server)');

        const input = new TextInputBuilder()
            .setCustomId('wipe_date_input')
            .setLabel('Data/Hora (DD/MM/AAAA HH:MM)')
            .setPlaceholder('Ex: 25/12/2026 16:00')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await interaction.showModal(modal);
    }
};