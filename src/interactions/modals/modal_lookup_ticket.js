const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const query = interaction.fields.getTextInputValue('query_code');
        const guildId = interaction.guild.id;

        // Busca por TicketCode ou ID
        let ticket = await interaction.client.db.ticket.findUnique({ 
            where: { ticketCode: query } 
        });

        if (!ticket && !isNaN(query)) {
             ticket = await interaction.client.db.ticket.findUnique({ 
                where: { id: parseInt(query) } 
            });
        }

        if (!ticket || ticket.guildId !== guildId) {
            return interaction.reply({ content: '❌ Ticket não encontrado neste servidor.', flags: MessageFlags.Ephemeral });
        }

        const author = await interaction.client.users.fetch(ticket.authorId).catch(() => 'Desconhecido');
        const staff = ticket.staffId ? await interaction.client.users.fetch(ticket.staffId).catch(() => 'N/A') : 'Ninguém';
        const date = `<t:${Math.floor(new Date(ticket.createdAt).getTime() / 1000)}:f>`;
        const closed = ticket.closedAt ? `<t:${Math.floor(new Date(ticket.closedAt).getTime() / 1000)}:f>` : 'Em Aberto';

        const embed = new EmbedBuilder()
            .setTitle(`📂 Ficha: ${query}`)
            .addFields(
                { name: '🆔 Código', value: `\`${ticket.ticketCode || 'N/A'}\``, inline: true },
                { name: '🔢 ID Interno', value: `\`${ticket.id}\``, inline: true },
                { name: '👤 Autor', value: `${author}`, inline: true },
                { name: '🛡️ Staff', value: `${staff}`, inline: true },
                { name: '📅 Aberto', value: date, inline: true },
                { name: '🔒 Fechado', value: closed, inline: true },
                { name: '⭐ Nota', value: ticket.rating ? `${ticket.rating} ⭐` : 'N/A', inline: true }
            )
            .setColor(ticket.status === 'OPEN' ? '#2ECC71' : '#E74C3C');

        const components = [];

        // Se tiver URL do Transcript salvo, adiciona o botão de baixar
        if (ticket.transcriptUrl) {
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setLabel('📥 Baixar Transcript')
                    .setStyle(ButtonStyle.Link)
                    .setURL(ticket.transcriptUrl)
            );
            components.push(row);
        }

        await interaction.reply({ embeds: [embed], components: components, flags: MessageFlags.Ephemeral });
    }
};