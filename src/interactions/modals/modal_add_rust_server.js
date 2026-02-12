const moduleRust = require('../modules/module_rust.js');

module.exports = {
    async execute(interaction) {
        const name = interaction.fields.getTextInputValue('server_name');
        const ip = interaction.fields.getTextInputValue('server_ip');
        const port = interaction.fields.getTextInputValue('server_port');

        await interaction.client.db.rustServer.create({
            data: {
                guildId: interaction.guild.id,
                name: name,
                serverIP: ip,
                serverPort: port
            }
        });

        await interaction.update({ content: '🔄 Adicionando...', components: [] });
        await moduleRust.execute(interaction);
    }
};