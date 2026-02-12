const moduleRustLfg = require('../modules/module_rust_lfg.js');

module.exports = {
    async execute(interaction) {
        const isPT = interaction.customId === 'setup_rust_lfg_pt';
        const channelId = interaction.values[0];

        if (isPT) {
            await interaction.client.db.guild.update({
                where: { id: interaction.guild.id },
                data: { rustLfgChannelPT: channelId }
            });
        } else {
            await interaction.client.db.guild.update({
                where: { id: interaction.guild.id },
                data: { rustLfgChannelEN: channelId }
            });
        }

        await moduleRustLfg.execute(interaction);
    }
};