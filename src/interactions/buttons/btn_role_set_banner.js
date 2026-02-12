const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        // ID: btn_role_set_banner_15
        const panelId = interaction.customId.split('_').pop();

        const modal = new ModalBuilder()
            .setCustomId(`modal_role_set_banner_${panelId}`)
            .setTitle('Definir Banner do Painel');

        const input = new TextInputBuilder()
            .setCustomId('banner_url')
            .setLabel('Link da Imagem (URL)')
            .setPlaceholder('https://i.imgur.com/...')
            .setStyle(TextInputStyle.Short)
            .setRequired(false); // Se deixar vazio, remove o banner

        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await interaction.showModal(modal);
    }
};