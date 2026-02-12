const moduleRust = require('../modules/module_rust.js');

module.exports = {
    async execute(interaction) {
        const channelId = interaction.values[0];
        
        await interaction.client.db.guild.update({
            where: { id: interaction.guild.id },
            data: { rustLogChannel: channelId }
        });

        await moduleRust.execute(interaction);
    }
};