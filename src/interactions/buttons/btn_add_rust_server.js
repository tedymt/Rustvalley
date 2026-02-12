const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const modal = new ModalBuilder().setCustomId('modal_add_rust_server').setTitle('Adicionar Servidor Rust');

        const nameInput = new TextInputBuilder()
            .setCustomId('server_name')
            .setLabel("Nome (Ex: Main 2x)")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const ipInput = new TextInputBuilder()
            .setCustomId('server_ip')
            .setLabel("IP (Ex: 192.168.1.1)")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const portInput = new TextInputBuilder()
            .setCustomId('server_port')
            .setLabel("Porta (Default: 28015)")
            .setValue("28015")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(nameInput),
            new ActionRowBuilder().addComponents(ipInput),
            new ActionRowBuilder().addComponents(portInput)
        );

        await interaction.showModal(modal);
    }
};