const moduleRoles = require('../modules/module_roles.js');

module.exports = {
    async execute(interaction) {
        const panelId = parseInt(interaction.customId.split('_').pop());

        await interaction.client.db.rolePanel.delete({
            where: { id: panelId }
        });

        // Retorna ao menu principal de roles
        await moduleRoles.execute(interaction);
    }
};