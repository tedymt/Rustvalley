const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        // ID vem como btn_gw_edit_123
        const gwId = interaction.customId.split('_').pop();

        // Abre o mesmo Modal que criamos antes
        const modal = new ModalBuilder()
            .setCustomId(`modal_gw_edit_${gwId}`)
            .setTitle('Editar Sorteio / Edit Giveaway');

        const prizeInput = new TextInputBuilder()
            .setCustomId('new_prize')
            .setLabel("Novo Nome do Prêmio")
            .setPlaceholder("Deixe vazio para não alterar")
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const descInput = new TextInputBuilder()
            .setCustomId('new_desc')
            .setLabel("Nova Descrição")
            .setPlaceholder("Deixe vazio para não alterar")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(prizeInput),
            new ActionRowBuilder().addComponents(descInput)
        );

        await interaction.showModal(modal);
    }
};