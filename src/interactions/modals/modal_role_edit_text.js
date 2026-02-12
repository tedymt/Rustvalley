const moduleRoles = require('../selects/select_role_panel.js'); // Volta para o menu do painel

module.exports = {
    async execute(interaction) {
        const panelId = parseInt(interaction.customId.split('_').pop());
        const title = interaction.fields.getTextInputValue('title');
        const description = interaction.fields.getTextInputValue('description');

        await interaction.client.db.rolePanel.update({
            where: { id: panelId },
            data: { title, description }
        });

        // Simula o select para recarregar a tela correta
        interaction.values = [panelId.toString()];
        await moduleRoles.execute(interaction);
    }
};