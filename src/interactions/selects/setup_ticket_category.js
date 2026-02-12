module.exports = {
    async execute(interaction) {
        const categoryId = interaction.values[0];
        await interaction.client.db.ticketConfig.upsert({
            where: { guildId: interaction.guild.id },
            update: { categoryID: categoryId },
            create: { guildId: interaction.guild.id, categoryID: categoryId }
        });
        await interaction.reply({ content: `✅ Categoria de tickets definida com sucesso!`, ephemeral: true });
    }
};