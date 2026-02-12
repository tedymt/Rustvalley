const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        // Busca sorteios ativos (não terminados)
        const giveaways = await interaction.client.db.giveaway.findMany({
            where: { 
                guildId: interaction.guild.id,
                ended: false 
            }
        });

        if (giveaways.length === 0) {
            return interaction.reply({ content: '❌ Nenhum sorteio ativo para editar.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('📝 Editar Sorteio / Edit Giveaway')
            .setDescription('Selecione abaixo qual sorteio você deseja alterar.')
            .setColor('#FF007F');

        const select = new StringSelectMenuBuilder()
            .setCustomId('select_gw_edit')
            .setPlaceholder('Selecione um sorteio...')
            .addOptions(
                giveaways.map(gw => ({
                    label: gw.prize.substring(0, 100),
                    description: `ID: ${gw.id} • Termina em: ${new Date(gw.endTime).toLocaleDateString()}`,
                    value: String(gw.id),
                    emoji: '🎁'
                }))
            );

        const row = new ActionRowBuilder().addComponents(select);

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }
};