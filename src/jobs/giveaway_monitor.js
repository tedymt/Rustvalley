const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'giveaway_monitor',
    async execute(client) {
        // Checagem a cada 30 segundos
        setInterval(async () => {
            await checkGiveaways(client);
        }, 30 * 1000);
    }
};

async function checkGiveaways(client) {
    const now = new Date();

    try {
        // Busca sorteios que precisam encerrar
        const expired = await client.db.giveaway.findMany({
            where: {
                ended: false,
                endTime: { lte: now }
            }
        });

        for (const gw of expired) {
            await finishGiveaway(client, gw);
        }
    } catch (error) {
        console.error(' [ERRO MONITOR] Falha ao buscar sorteios:', error);
    }
}

/**
 * Função centralizada para finalizar o sorteio (usada pelo monitor e pelo botão FORCE)
 */
async function finishGiveaway(client, gw) {
    try {
        // 1. Marca como finalizado no banco imediatamente (Trava de segurança)
        await client.db.giveaway.update({
            where: { id: gw.id },
            data: { ended: true }
        });

        const channel = await client.channels.fetch(gw.channelId).catch(() => null);
        if (!channel) return;

        const message = await channel.messages.fetch(gw.messageId).catch(() => null);
        
        const entries = gw.entries;
        const winnersCount = gw.winners;
        let winners = [];

        // 2. Lógica de Sorteio
        if (entries.length > 0) {
            // Embaralha e seleciona os ganhadores
            const shuffled = [...entries].sort(() => 0.5 - Math.random());
            winners = shuffled.slice(0, Math.min(winnersCount, entries.length));
        }

        // 3. Processamento de Resultados
        if (winners.length > 0) {
            const winnerMentions = winners.map(w => `<@${w}>`).join(', ');

            // Embed de Vitória Bilíngue e Clean
            const winEmbed = new EmbedBuilder()
                .setTitle('🎊 TEMOS GANHADORES! / WE HAVE WINNERS!')
                .setDescription(`🇧🇷 Parabéns aos vencedores do sorteio: **${gw.prize}**\n🇺🇸 Congratulations to the giveaway winners: **${gw.prize}**`)
                .addFields(
                    { name: '🏆 Ganhadores / Winners', value: winnerMentions, inline: false },
                    { name: '🎟️ Participantes / Entries', value: `\`${entries.length}\``, inline: true }
                )
                .setColor('#F1C40F')
                .setFooter({ text: 'Abram ticket para resgatar! / Open a ticket to claim!' })
                .setTimestamp();

            await channel.send({ content: `🎉 ${winnerMentions}`, embeds: [winEmbed] });

            // Atualiza a Vitrine (Mensagem Original)
            if (message) {
                const finishedEmbed = EmbedBuilder.from(message.embeds[0])
                    .setTitle('🔴 SORTEIO ENCERRADO / GIVEAWAY ENDED')
                    .setColor('#2F3136')
                    .setDescription(`**${gw.prize}**\n\n🏆 **Ganhadores / Winners:** ${winnerMentions}`)
                    .setFields(
                        { name: '👥 Participantes / Entries', value: `\`${entries.length}\``, inline: true }
                    );

                // Remove botões para ninguém mais tentar clicar
                await message.edit({ embeds: [finishedEmbed], components: [] });
            }
        } else {
            // Caso ninguém tenha participado
            const noWinnersEmbed = new EmbedBuilder()
                .setTitle('🔴 ENCERRADO / ENDED')
                .setDescription(`🇧🇷 O sorteio de **${gw.prize}** encerrou sem participantes.\n🇺🇸 The giveaway for **${gw.prize}** ended with no participants.`)
                .setColor('#E74C3C');

            await channel.send({ embeds: [noWinnersEmbed] });

            if (message) {
                await message.edit({ embeds: [noWinnersEmbed], components: [] });
            }
        }
    } catch (error) {
        console.error(` [ERRO GIVEAWAY] Falha ao finalizar ID ${gw.id}:`, error);
    }
}