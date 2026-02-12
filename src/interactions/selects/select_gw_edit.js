const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const gwId = interaction.values[0];
        
        // Busca dados atuais para referência (opcional, mas bom pra logica)
        // const gw = await interaction.client.db.giveaway.findUnique({ where: { id: parseInt(gwId) } });

        const modal = new ModalBuilder()
            .setCustomId(`modal_gw_edit_${gwId}`)
            .setTitle('Editar Sorteio / Edit Giveaway');

        // Campos para edição
        const prizeInput = new TextInputBuilder()
            .setCustomId('new_prize')
            .setLabel("Novo Nome do Prêmio")
            .setPlaceholder("Deixe vazio para manter o atual")
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        const descInput = new TextInputBuilder()
            .setCustomId('new_desc')
            .setLabel("Nova Descrição")
            .setPlaceholder("Deixe vazio para manter a atual")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(false);

        // Adicionar input de tempo seria complexo (parse de data), vamos focar em texto por enquanto.
        
        modal.addComponents(
            new ActionRowBuilder().addComponents(prizeInput),
            new ActionRowBuilder().addComponents(descInput)
        );

        await interaction.showModal(modal);
    }
};