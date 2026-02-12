const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const parts = interaction.customId.split('_');
        const action = parts[1]; // 'approve', 'deny', 'analyze', 'thread'
        const suggestionId = parseInt(parts[2]);

        // Busca dados para saber a língua
        const suggestion = await interaction.client.db.suggestion.findUnique({ where: { id: suggestionId } });
        if (!suggestion) return interaction.reply({ content: '❌ 404: Suggestion not found.', ephemeral: true });

        const config = await interaction.client.db.guild.findUnique({ where: { id: interaction.guild.id } });
        const isPT = suggestion.channelId === config.suggestionChannelPT;

        // Textos Traduzidos
        const txt = isPT ? {
            noPerm: '❌ Apenas Staff pode gerenciar sugestões.',
            threadExists: '❌ Já existe uma discussão para esta sugestão.',
            threadCreated: '✅ Discussão criada:',
            threadTitle: 'Discussão Sugestão',
            statusApproved: '✅ **APROVADA**',
            statusDenied: '❌ **NEGADA**',
            statusReview: '🕵️ **EM ANÁLISE**',
            success: '✅ Status atualizado!'
        } : {
            noPerm: '❌ Only Staff can manage suggestions.',
            threadExists: '❌ A thread already exists.',
            threadCreated: '✅ Thread created:',
            threadTitle: 'Suggestion Discussion',
            statusApproved: '✅ **APPROVED**',
            statusDenied: '❌ **DENIED**',
            statusReview: '🕵️ **UNDER REVIEW**',
            success: '✅ Status updated!'
        };

        // --- AÇÃO: CRIAR THREAD ---
        if (action === 'thread') {
            if (interaction.message.hasThread) return interaction.reply({ content: txt.threadExists, ephemeral: true });

            const thread = await interaction.message.startThread({
                name: `${txt.threadTitle} #${suggestionId}`,
                autoArchiveDuration: 1440,
            });
            
            await thread.members.add(interaction.user.id);
            return interaction.reply({ content: `${txt.threadCreated} ${thread}`, ephemeral: true });
        }

        // --- AÇÕES ADMIN (APROVAR/NEGAR) ---
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: txt.noPerm, ephemeral: true });
        }

        let statusText = '';
        let color = '';
        let dbStatus = '';

        switch (action) {
            case 'approve':
                statusText = txt.statusApproved;
                color = '#2ECC71';
                dbStatus = 'APPROVED';
                break;
            case 'deny':
                statusText = txt.statusDenied;
                color = '#E74C3C';
                dbStatus = 'DENIED';
                break;
            case 'analyze':
                statusText = txt.statusReview;
                color = '#3498DB';
                dbStatus = 'REVIEW';
                break;
        }

        // Atualiza Banco
        await interaction.client.db.suggestion.update({
            where: { id: suggestionId },
            data: { status: dbStatus }
        });

        // Atualiza Embed Visual (Mantendo a língua original da embed)
        const oldEmbed = interaction.message.embeds[0];
        const newEmbed = EmbedBuilder.from(oldEmbed)
            .setColor(color)
            // Atualiza apenas o campo "Status" (índice 0)
            .spliceFields(0, 1, { name: oldEmbed.fields[0].name, value: statusText, inline: true });

        await interaction.message.edit({ embeds: [newEmbed] });
        await interaction.reply({ content: txt.success, ephemeral: true });
    }
};