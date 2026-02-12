const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    async execute(interaction) {
        // ID: suggestion_vote_up_15
        const parts = interaction.customId.split('_');
        const action = parts[2]; // 'up' ou 'down'
        const suggestionId = parseInt(parts[3]);
        const userId = interaction.user.id;

        try {
            // Busca dados
            const suggestion = await interaction.client.db.suggestion.findUnique({ where: { id: suggestionId } });
            if (!suggestion) return interaction.reply({ content: '❌ Error: Data not found.', ephemeral: true });

            const config = await interaction.client.db.guild.findUnique({ where: { id: interaction.guild.id } });

            // DETECÇÃO DE IDIOMA DO CANAL
            // Se o canal da sugestão for o Canal PT configurado, falamos PT. Senão, EN.
            const isPT = suggestion.channelId === config.suggestionChannelPT;

            // Mensagens Traduzidas
            const msgs = isPT ? {
                removed: '🗑️ Voto removido.',
                updated: '🔄 Voto atualizado!',
                registered: '✅ Voto registrado!',
                error: '❌ Erro ao votar.'
            } : {
                removed: '🗑️ Vote removed.',
                updated: '🔄 Vote updated!',
                registered: '✅ Vote registered!',
                error: '❌ Error voting.'
            };

            // Lógica de Voto
            const existingVote = await interaction.client.db.vote.findUnique({
                where: { suggestionId_userId: { suggestionId, userId } }
            });

            if (existingVote) {
                if (existingVote.type === action.toUpperCase()) {
                    await interaction.client.db.vote.delete({ where: { id: existingVote.id } });
                    await interaction.reply({ content: msgs.removed, ephemeral: true });
                } else {
                    await interaction.client.db.vote.update({
                        where: { id: existingVote.id },
                        data: { type: action.toUpperCase() }
                    });
                    await interaction.reply({ content: msgs.updated, ephemeral: true });
                }
            } else {
                await interaction.client.db.vote.create({
                    data: { userId, suggestionId, type: action.toUpperCase() }
                });
                await interaction.reply({ content: msgs.registered, ephemeral: true });
            }

            // Atualiza Botões (Contadores)
            const upvotes = await interaction.client.db.vote.count({ where: { suggestionId, type: 'UP' } });
            const downvotes = await interaction.client.db.vote.count({ where: { suggestionId, type: 'DOWN' } });

            const row1 = interaction.message.components[0];
            const row2 = interaction.message.components[1];

            // Reconstrói a linha de botões preservando o estilo, mas mudando o label (número)
            const newRow1 = new ActionRowBuilder();
            row1.components.forEach((btn, index) => {
                const builder = ButtonBuilder.from(btn);
                if (index === 0) builder.setLabel(`${upvotes}`); // Botão UP
                if (index === 1) builder.setLabel(`${downvotes}`); // Botão DOWN
                newRow1.addComponents(builder);
            });

            await interaction.message.edit({ components: [newRow1, row2] });

        } catch (error) {
            console.error('[VOTE ERROR]', error);
            // Fallback seguro se não conseguir detectar língua
            await interaction.reply({ content: '❌ Error / Erro.', ephemeral: true });
        }
    }
};