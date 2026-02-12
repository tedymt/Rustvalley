const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

module.exports = {
    async execute(interaction, data = null) {
        const { client, guild } = interaction;

        // --- MENU PRINCIPAL (LISTA) ---
        if (!data) {
            const announcements = await client.db.scheduledAnnouncement.findMany({ 
                where: { guildId: guild.id } 
            });

            const embed = new EmbedBuilder()
                .setTitle('📢 Gerenciador de Anúncios / Manager')
                .setDescription('🇧🇷 Lista de anúncios agendados e ativos.\n🇺🇸 Scheduled and active announcements.')
                .setColor('#5865F2');

            if (announcements.length > 0) {
                const list = announcements.map(a => 
                    `🆔 \`${a.id}\` | **${a.title}**\n> 🕒 <t:${Math.floor(new Date(a.scheduledTime).getTime()/1000)}:f> | 🔁 ${a.intervalDays}d`
                ).join('\n\n');
                embed.addFields({ name: '📝 Ativos / Active', value: list.substring(0, 1000) });
            } else {
                embed.setDescription('Nenhum anúncio ativo. Clique em **Novo** para criar.');
            }

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('btn_ann_new').setLabel('Novo / New').setStyle(ButtonStyle.Success).setEmoji('➕'),
                new ButtonBuilder().setCustomId('btn_ann_delete_list').setLabel('Excluir / Delete').setStyle(ButtonStyle.Danger).setEmoji('🗑️'),
                new ButtonBuilder().setCustomId('back_to_community').setLabel('Voltar Menu').setStyle(ButtonStyle.Secondary)
            );

            const payload = { embeds: [embed], components: [row], content: null };
            if (interaction.replied || interaction.deferred) return await interaction.editReply(payload);
            return await interaction.update(payload);
        }

        // --- EDITOR (PREVIEW) ---
        const previewEmbed = new EmbedBuilder()
            .setTitle(data.title || 'Título do Anúncio')
            .setDescription(data.content || 'Corpo da mensagem...')
            .setColor('#2ECC71')
            .setFooter({ text: '👀 PREVIEW - Configure abaixo' });

        if (data.imageUrl) previewEmbed.setImage(data.imageUrl);

        const mentionTexto = data.mentionEveryone ? '✅ everyone' : '❌ Nenhuma';

        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('btn_ann_set_text').setLabel('Editar Texto').setStyle(ButtonStyle.Primary).setEmoji('📝'),
            new ButtonBuilder().setCustomId('btn_ann_toggle_everyone').setLabel(data.mentionEveryone ? 'Ping: ON' : 'Ping: OFF').setStyle(data.mentionEveryone ? ButtonStyle.Success : ButtonStyle.Secondary).setEmoji('🔔'),
            new ButtonBuilder().setCustomId('btn_ann_set_image').setLabel('Banner/Link').setStyle(ButtonStyle.Primary).setEmoji('🖼️')
        );

        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('btn_ann_confirm_save').setLabel('Agendar & Salvar').setStyle(ButtonStyle.Success).setEmoji('⏰'),
            // AQUI ESTÁ A MUDANÇA PARA 'VOLTAR'
            new ButtonBuilder().setCustomId('btn_ann_back').setLabel('Voltar / Back').setStyle(ButtonStyle.Secondary).setEmoji('↩️')
        );

        const statusMsg = `**Configurando Anúncio:**\n📢 Menção: ${mentionTexto}\n*O canal será escolhido na próxima etapa.*`;
        
        const finalPayload = { content: statusMsg, embeds: [previewEmbed], components: [row1, row2] };
        if (interaction.replied || interaction.deferred) return await interaction.editReply(finalPayload);
        return await interaction.update(finalPayload);
    }
};