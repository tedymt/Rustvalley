const moduleSecurity = require('../modules/module_security.js');

module.exports = {
    async execute(interaction) {
        const config = await interaction.client.db.guild.findUnique({ where: { id: interaction.guild.id } });
        
        await interaction.client.db.guild.update({
            where: { id: interaction.guild.id },
            data: { antiToxic: !config.antiToxic }
        });

        await moduleSecurity.execute(interaction);
    }
};