const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        // Pega o ID do servidor (ex: rust_set_image_6 -> pega o 6)
        const parts = interaction.customId.split('_');
        const serverId = parts[parts.length - 1]; 

        const modal = new ModalBuilder()
            .setCustomId(`modal_rust_image_${serverId}`)
            .setTitle('Definir Banner do Wipe');

        const input = new TextInputBuilder()
            .setCustomId('image_url')
            .setLabel('Link da Imagem (URL)')
            .setPlaceholder('https://i.imgur.com/suaimagem.png')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const row = new ActionRowBuilder().addComponents(input);
        modal.addComponents(row);

        await interaction.showModal(modal);
    }
};