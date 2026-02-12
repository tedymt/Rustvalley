const moduleSecurity = require('../modules/module_security.js');

module.exports = {
    async execute(interaction) {
        const config = await interaction.client.db.guild.findUnique({ where: { id: interaction.guild.id } });
        
        // Inverte o valor atual (True -> False / False -> True)
        await interaction.client.db.guild.update({
            where: { id: interaction.guild.id },
            data: { antiLink: !config.antiLink }
        });

        await moduleSecurity.execute(interaction); // Atualiza o painel
    }
};