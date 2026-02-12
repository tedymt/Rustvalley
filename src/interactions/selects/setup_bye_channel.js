const moduleWelcome = require('../modules/module_welcome.js');

module.exports = {
    async execute(interaction) {
        const channelId = interaction.values[0];
        await interaction.client.db.guild.update({
            where: { id: interaction.guild.id },
            data: { byeChannel: channelId }
        });
        await moduleWelcome.execute(interaction); // Recarrega o painel
    }
};