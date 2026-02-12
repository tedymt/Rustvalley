const selectRolePanel = require('../selects/select_role_panel.js');

module.exports = {
    async execute(interaction) {
        // ID: modal_role_set_banner_15
        const panelId = parseInt(interaction.customId.split('_').pop());
        const url = interaction.fields.getTextInputValue('banner_url');

        // Validação básica (se tiver texto)
        if (url && !url.startsWith('http')) {
            return interaction.reply({ content: '❌ URL inválida.', ephemeral: true });
        }

        // Salva (ou remove se vazio)
        await interaction.client.db.rolePanel.update({
            where: { id: panelId },
            data: { imageUrl: url || null }
        });

        // Atualiza a visualização usando o select_role_panel
        // Criamos o fakeInteraction para reaproveitar a lógica de exibição
        const fakeInteraction = {
            client: interaction.client,
            guild: interaction.guild,
            values: [String(panelId)], // Passa o ID como se tivesse selecionado no menu
            user: interaction.user,
            replied: true, // Já respondemos (deferUpdate abaixo)
            editReply: async (payload) => await interaction.editReply(payload),
            update: async (payload) => await interaction.editReply(payload)
        };

        await interaction.deferUpdate();
        await selectRolePanel.execute(fakeInteraction);
        
        await interaction.followUp({ content: '✅ Banner atualizado com sucesso!', ephemeral: true });
    }
};