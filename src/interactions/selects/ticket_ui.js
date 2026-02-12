const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlags } = require('discord.js');

module.exports = {
    async execute(interaction) {
        // 1. Busca Config Atual
        const config = await interaction.client.db.ticketConfig.findUnique({ 
            where: { guildId: interaction.guild.id } 
        });

        const modal = new ModalBuilder()
            .setCustomId('modal_ticket_ui')
            .setTitle('Aparência / Appearance');

        // 2. Preenche os campos com setValue()
        const titleInput = new TextInputBuilder()
            .setCustomId('ticket_title')
            .setLabel('Título / Title')
            .setStyle(TextInputStyle.Short)
            .setValue(config?.title || '') // <--- CARREGA O ATUAL
            .setRequired(false);

        const descInput = new TextInputBuilder()
            .setCustomId('ticket_desc')
            .setLabel('Descrição / Description')
            .setStyle(TextInputStyle.Paragraph)
            .setValue(config?.description || '') // <--- CARREGA O ATUAL
            .setRequired(false);

        const bannerInput = new TextInputBuilder()
            .setCustomId('ticket_banner')
            .setLabel('Link do Banner (URL)')
            .setStyle(TextInputStyle.Short)
            .setValue(config?.banner || '') // <--- CARREGA O ATUAL
            .setRequired(false);

        const colorInput = new TextInputBuilder()
            .setCustomId('ticket_color')
            .setLabel('Cor Hex (Ex: #FF0000)')
            .setStyle(TextInputStyle.Short)
            .setValue(config?.color || '#5865F2') // <--- CARREGA O ATUAL
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(titleInput),
            new ActionRowBuilder().addComponents(descInput),
            new ActionRowBuilder().addComponents(bannerInput),
            new ActionRowBuilder().addComponents(colorInput)
        );

        await interaction.showModal(modal);
    }
};