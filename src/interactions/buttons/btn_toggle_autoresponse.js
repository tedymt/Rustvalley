const moduleAutoResponse = require('../modules/module_auto_response.js');

module.exports = {
    async execute(interaction) {
        const config = await interaction.client.db.guild.findUnique({
            where: { id: interaction.guild.id }
        });

        // Inverte o valor (Se true vira false, se false vira true)
        const newState = !config.autoResponseEnabled;

        await interaction.client.db.guild.update({
            where: { id: interaction.guild.id },
            data: { autoResponseEnabled: newState }
        });

        // Recarrega o painel
        await moduleAutoResponse.execute(interaction);
    }
};