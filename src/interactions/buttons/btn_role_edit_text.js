const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const panelId = interaction.customId.split('_').pop();

        // Busca dados atuais para preencher o modal
        const panel = await interaction.client.db.rolePanel.findUnique({
            where: { id: parseInt(panelId) }
        });

        const modal = new ModalBuilder()
            .setCustomId(`modal_role_edit_text_${panelId}`)
            .setTitle('Editar Texto do Painel');

        const titleInput = new TextInputBuilder()
            .setCustomId('title')
            .setLabel("Título do Painel")
            .setValue(panel.title)
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const descInput = new TextInputBuilder()
            .setCustomId('description')
            .setLabel("Descrição (Instruções)")
            .setValue(panel.description)
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(titleInput),
            new ActionRowBuilder().addComponents(descInput)
        );

        await interaction.showModal(modal);
    }
};