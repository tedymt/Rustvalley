const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const isPT = interaction.customId.includes('_pt');
        const text = interaction.fields.getTextInputValue('suggestion_text');
        const { guild, client, user } = interaction;

        // 1. Configuração
        const config = await client.db.guild.findUnique({ where: { id: guild.id } });
        const targetChannelId = isPT ? config.suggestionChannelPT : config.suggestionChannelEN;

        if (!targetChannelId) {
            return interaction.reply({ 
                content: isPT ? '❌ Canal não configurado.' : '❌ Channel not set.', 
                ephemeral: true 
            });
        }

        const channel = guild.channels.cache.get(targetChannelId);
        
        // 2. Textos e Visual
        const labels = isPT ? {
            title: '👤 Sugestão de Jogador',
            status: '📊 Status',
            statusVal: '⏳ **Pendente**',
            footer: 'Votação Aberta',
            success: '✅ Sugestão enviada com sucesso!'
        } : {
            title: '👤 Player Suggestion',
            status: '📊 Status',
            statusVal: '⏳ **Pending**',
            footer: 'Voting Open',
            success: '✅ Suggestion sent successfully!'
        };

        const bannerUrl = config.suggestionBanner || 'https://i.imgur.com/7w2yv8I.png';

        // 3. Monta Embed (Rica com Foto e Banner)
        const embed = new EmbedBuilder()
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
            .setTitle(labels.title)
            .setDescription(`\`\`\`${text}\`\`\``)
            .addFields(
                { name: labels.status, value: labels.statusVal, inline: true },
                { name: '🆔 User ID', value: user.id, inline: true }
            )
            .setColor('#F1C40F')
            .setImage(bannerUrl)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
            .setFooter({ text: `ID: ... • ${labels.footer}` })
            .setTimestamp();

        // 4. Envia mensagem inicial
        const message = await channel.send({ embeds: [embed] });

        // 5. Salva no Banco (AGORA VAI FUNCIONAR COM O SCHEMA ATUALIZADO)
        const suggestion = await client.db.suggestion.create({
            data: {
                guildId: guild.id,
                authorId: user.id, // Correção aplicada (era userId)
                messageId: message.id,
                channelId: channel.id, // Correção aplicada (campo novo no schema)
                content: text,
                status: 'PENDING'
            }
        });

        // 6. Atualiza com Botões e ID Real
        const newEmbed = EmbedBuilder.from(embed).setFooter({ text: `ID: ${suggestion.id} • ${labels.footer}` });

        const rowVotes = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`suggestion_vote_up_${suggestion.id}`).setLabel('0').setEmoji('👍').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`suggestion_vote_down_${suggestion.id}`).setLabel('0').setEmoji('👎').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(`suggestion_thread_${suggestion.id}`).setLabel(isPT ? '💬 Discussão' : '💬 Discuss').setStyle(ButtonStyle.Secondary)
        );

        const rowAdmin = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`suggestion_approve_${suggestion.id}`).setLabel(isPT ? 'Aprovar' : 'Approve').setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId(`suggestion_deny_${suggestion.id}`).setLabel(isPT ? 'Negar' : 'Deny').setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId(`suggestion_analyze_${suggestion.id}`).setLabel(isPT ? 'Analisar' : 'Review').setStyle(ButtonStyle.Primary)
        );

        await message.edit({ embeds: [newEmbed], components: [rowVotes, rowAdmin] });
        await interaction.reply({ content: labels.success, ephemeral: true });
    }
};