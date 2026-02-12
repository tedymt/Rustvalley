const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        // CustomId: select_role_add_handler_15
        const panelId = interaction.customId.split('_').pop();
        const roleId = interaction.values[0];

        // Validação extra
        if (isNaN(panelId)) {
            return interaction.reply({ content: '❌ Erro crítico: ID do painel perdido.', ephemeral: true });
        }

        // Abre modal passando AMBOS os IDs
        const modal = new ModalBuilder()
            .setCustomId(`modal_role_option_${panelId}_${roleId}`) // Formato: modal_role_option_15_987654321
            .setTitle('Configurar Aparência');

        const labelInput = new TextInputBuilder()
            .setCustomId('label')
            .setLabel("Nome no Botão (Ex: Membro)")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const emojiInput = new TextInputBuilder()
            .setCustomId('emoji')
            .setLabel("Emoji (Copie e cole)")
            .setValue("💠")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(labelInput),
            new ActionRowBuilder().addComponents(emojiInput)
        );

        await interaction.showModal(modal);
    }
};