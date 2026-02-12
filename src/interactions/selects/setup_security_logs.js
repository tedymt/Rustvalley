const moduleSecurity = require('../modules/module_security.js');

module.exports = {
    async execute(interaction) {
        await interaction.client.db.guild.update({
            where: { id: interaction.guild.id },
            data: { securityLogChannel: interaction.values[0] }
        });
        await moduleSecurity.execute(interaction);
    }
};