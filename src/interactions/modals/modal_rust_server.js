const moduleRust = require('../modules/module_rust.js');

module.exports = {
    async execute(interaction) {
        const ip = interaction.fields.getTextInputValue('server_ip');
        const port = interaction.fields.getTextInputValue('server_port');

        await interaction.client.db.guild.update({
            where: { id: interaction.guild.id },
            data: { 
                rustServerIP: ip,
                rustServerPort: port
            }
        });

        await interaction.update({ content: '🔄 Salvando...', components: [] });
        await moduleRust.execute(interaction);
    }
};