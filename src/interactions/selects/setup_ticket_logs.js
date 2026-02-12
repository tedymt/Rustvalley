module.exports = {
    async execute(interaction) {
        const logId = interaction.values[0];
        await interaction.client.db.ticketConfig.upsert({
            where: { guildId: interaction.guild.id },
            update: { logsChannelID: logId },
            create: { guildId: interaction.guild.id, logsChannelID: logId }
        });
        await interaction.reply({ content: `✅ Canal de logs definido com sucesso!`, ephemeral: true });
    }
};