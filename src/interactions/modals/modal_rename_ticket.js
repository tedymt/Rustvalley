const { MessageFlags } = require('discord.js');
module.exports = {
    async execute(interaction) {
        const newName = interaction.fields.getTextInputValue('new_name');
        await interaction.channel.setName(`ticket-${newName}`);
        await interaction.reply({ content: `📝 **Renomeado para / Renamed to:** ${newName}`, flags: MessageFlags.Ephemeral });
    }
};