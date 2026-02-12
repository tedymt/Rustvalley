const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    async execute(interaction) {
        // ID: btn_mapvote_CHOICE_POLLID
        const parts = interaction.customId.split('_');
        const choice = parts[2];
        const pollId = parseInt(parts[3]);
        const userId = interaction.user.id;

        try {
            const poll = await interaction.client.db.mapPoll.findUnique({ where: { id: pollId } });
            if (!poll) return interaction.reply({ content: '❌ Enquete não encontrada / Poll not found.', ephemeral: true });

            const existingVote = await interaction.client.db.mapPollVote.findUnique({
                where: { pollId_userId: { pollId, userId } }
            });

            // Lógica de Voto
            if (existingVote) {
                if (existingVote.choice === choice) {
                    await interaction.client.db.mapPollVote.delete({ where: { id: existingVote.id } });
                    await interaction.reply({ content: '🗑️ Voto removido. / Vote removed.', ephemeral: true });
                } else {
                    await interaction.client.db.mapPollVote.update({
                        where: { id: existingVote.id },
                        data: { choice: choice }
                    });
                    const mapName = choice === 'A' ? poll.mapA_Name : (choice === 'B' ? poll.mapB_Name : poll.mapC_Name);
                    // Feedback Bilingue Limpo
                    await interaction.reply({ content: `🔄 Voto alterado para **${mapName}**! / Vote changed to **${mapName}**!`, ephemeral: true });
                }
            } else {
                await interaction.client.db.mapPollVote.create({
                    data: { pollId, userId, choice }
                });
                const mapName = choice === 'A' ? poll.mapA_Name : (choice === 'B' ? poll.mapB_Name : poll.mapC_Name);
                // Feedback Bilingue Limpo
                await interaction.reply({ content: `✅ Votou em **${mapName}**! / Voted for **${mapName}**!`, ephemeral: true });
            }

            // Atualiza Contadores
            const countA = await interaction.client.db.mapPollVote.count({ where: { pollId, choice: 'A' } });
            const countB = await interaction.client.db.mapPollVote.count({ where: { pollId, choice: 'B' } });
            const countC = await interaction.client.db.mapPollVote.count({ where: { pollId, choice: 'C' } });

            // Recria Botões (Mantendo "Vote")
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId(`btn_mapvote_A_${poll.id}`).setLabel(`Vote ${poll.mapA_Name} (${countA})`).setStyle(ButtonStyle.Primary).setEmoji('🇦'),
                new ButtonBuilder().setCustomId(`btn_mapvote_B_${poll.id}`).setLabel(`Vote ${poll.mapB_Name} (${countB})`).setStyle(ButtonStyle.Danger).setEmoji('🇧')
            );

            if (poll.mapC_Name) {
                row.addComponents(
                    new ButtonBuilder().setCustomId(`btn_mapvote_C_${poll.id}`).setLabel(`Vote ${poll.mapC_Name} (${countC})`).setStyle(ButtonStyle.Success).setEmoji('🇨')
                );
            }

            await interaction.message.edit({ components: [row] });

        } catch (error) {
            console.error(error);
            if (!interaction.replied) await interaction.reply({ content: '❌ Error.', ephemeral: true });
        }
    }
};