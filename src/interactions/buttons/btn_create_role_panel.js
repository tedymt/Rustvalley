const moduleRoles = require('../modules/module_roles.js');

module.exports = {
    async execute(interaction) {
        // Cria com textos padrão (Bilingue)
        await interaction.client.db.rolePanel.create({
            data: {
                guildId: interaction.guild.id,
                title: "🎭 Central de Cargos / Role Center",
                description: "🇧🇷 **Selecione os cargos abaixo** para personalizar seu perfil.\n🇺🇸 **Select the roles below** to customize your profile."
            }
        });

        await moduleRoles.execute(interaction);
    }
};