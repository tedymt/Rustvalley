const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const { guild, client } = interaction;

        // --- 1. BUSCA DADOS ---
        const tickets = await client.db.ticket.findMany({
            where: { 
                guildId: guild.id,
                status: 'CLOSED',
                staffId: { not: null }
            }
        });

        // --- 2. CÁLCULO DO RANKING ---
        const staffStats = {};
        tickets.forEach(t => {
            if (!staffStats[t.staffId]) {
                staffStats[t.staffId] = { count: 0, totalRating: 0, ratedCount: 0 };
            }
            staffStats[t.staffId].count++;
            if (t.rating) {
                staffStats[t.staffId].totalRating += t.rating;
                staffStats[t.staffId].ratedCount++;
            }
        });

        // Ordena por quantidade (Top 10)
        const sortedStaff = Object.entries(staffStats)
            .sort(([, a], [, b]) => b.count - a.count)
            .slice(0, 10);

        let desc = sortedStaff.length > 0 ? '' : 'Nenhum dado registrado ainda.';

        for (const [staffId, stats] of sortedStaff) {
            const avg = stats.ratedCount > 0 ? (stats.totalRating / stats.ratedCount).toFixed(1) : 'N/A';
            desc += `**<@${staffId}>**\n📦 Tickets: \`${stats.count}\` | ⭐ Média: \`${avg}\`\n\n`;
        }

        const embed = new EmbedBuilder()
            .setTitle('🏆 Ranking da Equipe / Staff Ranking')
            .setDescription(desc)
            .setColor('#F1C40F')
            .setFooter({ text: 'Koda Manager Analytics' });

        // --- 3. BOTÃO VOLTAR (Corrigido) ---
        // Aponta para 'back_to_tickets' para voltar ao menu anterior
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('back_to_tickets') 
                .setLabel('Voltar / Back')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('⬅️')
        );

        // --- 4. ENVIO (USANDO UPDATE PARA NÃO CRIAR NOVA MSG) ---
        // Se for Select Menu ou Botão, usamos update. Se for Slash Command, usamos reply.
        if (interaction.isMessageComponent()) {
            await interaction.update({ embeds: [embed], components: [row] });
        } else {
            // Fallback apenas se for chamado via comando direto (raro neste fluxo)
            await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
        }
    }
};