const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('modal_create_response')
            .setTitle('Nova Resposta (Auto-Tradutor)');

        const triggerInput = new TextInputBuilder()
            .setCustomId('trigger')
            .setLabel("Gatilho em Português")
            .setPlaceholder("Ex: wipe, loja, discord")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const respPT = new TextInputBuilder()
            .setCustomId('response_pt')
            .setLabel("Resposta em Português")
            .setPlaceholder("Ex: Nossa loja fica em loja.com")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        // O Admin não vê o campo EN, o bot faz sozinho!

        modal.addComponents(
            new ActionRowBuilder().addComponents(triggerInput),
            new ActionRowBuilder().addComponents(respPT)
        );

        await interaction.showModal(modal);
    }
};