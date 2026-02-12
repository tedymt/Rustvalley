module.exports = {
    async execute(interaction) {
        const roleId = interaction.values[0];
        await interaction.client.db.ticketConfig.upsert({
            where: { guildId: interaction.guild.id },
            update: { supportRoleID: roleId },
            create: { guildId: interaction.guild.id, supportRoleID: roleId }
        });
        await interaction.reply({ content: `✅ Cargo de suporte definido com sucesso!`, ephemeral: true });
    }
};