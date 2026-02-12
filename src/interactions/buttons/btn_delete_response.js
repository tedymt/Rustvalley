const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const responses = await interaction.client.db.autoResponse.findMany({
            where: { guildId: interaction.guild.id }
        });

        if (responses.length === 0) {
            return interaction.reply({ content: '❌ Nenhuma resposta para excluir.', ephemeral: true });
        }

        const select = new StringSelectMenuBuilder()
            .setCustomId('select_delete_response')
            .setPlaceholder('Selecione para excluir...')
            .addOptions(responses.map(r => ({
                label: r.trigger,
                description: r.responsePT.substring(0, 50),
                value: r.id.toString(),
                emoji: '🗑️'
            })));

        const row = new ActionRowBuilder().addComponents(select);
        
        await interaction.reply({ content: 'Selecione o gatilho para remover:', components: [row], ephemeral: true });
    }
};