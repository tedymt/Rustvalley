const { 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    PermissionsBitField, 
    ChannelType,
    StringSelectMenuBuilder,
    MessageFlags 
} = require('discord.js');

const { generateTranscript } = require('../../utils/transcriptGenerator');

const generateTicketCode = () => `K-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

const formatDuration = (start, end) => {
    const ms = end - start;
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
};

module.exports = {
    async execute(interaction) {
        const { user, client, customId, channel } = interaction;
        // Busca a guilda completa para garantir acesso a iconURL e outros métodos
        const guild = await client.guilds.fetch(interaction.guildId).catch(() => interaction.guild);

        // --- 1. ABRIR TICKET (OPEN TICKET) ---
        if (customId.startsWith('open_ticket')) {
            const existing = await client.db.ticket.findFirst({
                where: { authorId: user.id, guildId: guild.id, status: 'OPEN' }
            });

            if (existing) {
                return interaction.reply({ 
                    content: '❌ **Você já possui um ticket aberto.**\n❌ **You already have an open ticket.**', 
                    flags: MessageFlags.Ephemeral 
                });
            }

            const depIdString = customId.replace('open_ticket_', '');
            let channelName = `ticket-${user.username}`;
            // Texto bilíngue padrão
            let welcomeDesc = `🇧🇷 Olá ${user}, a equipe foi notificada.\n🇺🇸 Hello ${user}, staff notified.`;
            let emoji = '🎫';

            if (depIdString !== 'general') {
                const depId = parseInt(depIdString);
                if (!isNaN(depId)) {
                    const department = await client.db.department.findUnique({ where: { id: depId } });
                    if (department) {
                        const cleanDepName = department.name.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 10);
                        channelName = `${cleanDepName}-${user.username}`;
                        emoji = department.emoji;
                        // Texto bilíngue dinâmico
                        welcomeDesc = `🇧🇷 **Departamento:** ${department.emoji} ${department.name}\nOlá ${user}, um especialista irá atendê-lo.\n\n🇺🇸 **Department:** ${department.emoji} ${department.name}\nHello ${user}, a specialist will assist you.`;
                    }
                }
            }

            const config = await client.db.ticketConfig.findUnique({ where: { guildId: guild.id } });
            const ticketCode = generateTicketCode();

            const ticketChannel = await guild.channels.create({
                name: channelName,
                type: ChannelType.GuildText,
                parent: config?.categoryID || null,
                permissionOverwrites: [
                    { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.AttachFiles] },
                    { id: config?.supportRoleID || guild.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
                ],
            });

            await client.db.ticket.create({
                data: { 
                    guildId: guild.id, 
                    channelId: ticketChannel.id, 
                    authorId: user.id, 
                    status: 'OPEN',
                    ticketCode: ticketCode 
                }
            });

            const welcomeEmbed = new EmbedBuilder()
                .setTitle(`${emoji} Atendimento Iniciado / Support Started`)
                .setDescription(welcomeDesc + `\n\n🆔 **Protocolo:** \`${ticketCode}\``)
                .setColor(config?.color || '#5865F2')
                .setThumbnail(guild.iconURL({ dynamic: true }))
                .setFooter({ text: 'Koda Manager Enterprise' });

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('close_ticket').setLabel('Fechar / Close').setStyle(ButtonStyle.Danger).setEmoji('🔒'),
                new ButtonBuilder().setCustomId('claim_ticket').setLabel('Assumir / Claim').setStyle(ButtonStyle.Success).setEmoji('🙋‍♂️'),
                new ButtonBuilder().setCustomId('staff_tools').setLabel('Painel Staff').setStyle(ButtonStyle.Secondary).setEmoji('🛠️')
            );

            await ticketChannel.send({ 
                content: config?.supportRoleID ? `<@&${config.supportRoleID}>` : '', 
                embeds: [welcomeEmbed], 
                components: [row] 
            });

            await interaction.reply({ 
                content: `✅ **Ticket Criado / Ticket Created:** ${ticketChannel}`, 
                flags: MessageFlags.Ephemeral 
            });
        }

        // --- 2. ASSUMIR TICKET (CLAIM TICKET) ---
        if (customId === 'claim_ticket') {
            await client.db.ticket.update({ where: { channelId: channel.id }, data: { staffId: user.id } });

            const newRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('close_ticket').setLabel('Fechar / Close').setStyle(ButtonStyle.Danger).setEmoji('🔒'),
                new ButtonBuilder().setCustomId('claim_ticket_disabled').setLabel(`Staff: ${user.username}`).setStyle(ButtonStyle.Success).setDisabled(true).setEmoji('✅'),
                new ButtonBuilder().setCustomId('staff_tools').setLabel('Painel Staff').setStyle(ButtonStyle.Secondary).setEmoji('🛠️')
            );

            await interaction.message.edit({ components: [newRow] });
            
            // Mensagem bilíngue ao assumir
            await interaction.reply({ 
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`✅ **Atendimento assumido por:** ${user}\n✅ **Support claimed by:** ${user}`)
                        .setColor('#2ECC71')
                ] 
            });
        }

        // --- 3. PAINEL STAFF (TOOLS) ---
        if (customId === 'staff_tools') {
            const toolsMenu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('ticket_actions')
                    .setPlaceholder('Ferramentas / Tools...')
                    .addOptions([
                        { label: 'Notificar DM (Notify DM)', value: 'notify_dm', emoji: '🔔' },
                        { label: 'Renomear (Rename)', value: 'rename_ticket', emoji: '📝' },
                        { label: 'Adicionar Membro (Add Member)', value: 'add_member', emoji: '👤' },
                        { label: 'Remover Membro (Remove Member)', value: 'remove_member', emoji: '🚫' }
                    ])
            );
            await interaction.reply({ 
                content: '🛠️ **Painel Administrativo / Staff Panel**', 
                components: [toolsMenu], 
                flags: MessageFlags.Ephemeral 
            });
        }

        // --- 4. FECHAR TICKET (CLOSE TICKET) ---
        if (customId === 'close_ticket') {
            const ticketData = await client.db.ticket.findUnique({ where: { channelId: channel.id } });
            
            if (!ticketData) return interaction.reply({ 
                content: "❌ Erro ao buscar dados do ticket. / Error fetching ticket data.", 
                flags: MessageFlags.Ephemeral 
            });

            await interaction.reply('🔒 **Gerando transcript e fechando... / Generating transcript and closing...**');

            const closedAt = new Date();
            const duration = formatDuration(ticketData.createdAt, closedAt);
            const transcriptAttachment = await generateTranscript(channel, guild);
            
            const config = await client.db.ticketConfig.findUnique({ where: { guildId: guild.id } });
            const author = await client.users.fetch(ticketData.authorId).catch(() => null);
            const staff = ticketData.staffId ? await client.users.fetch(ticketData.staffId).catch(() => null) : 'Nenhum/None';
            
            let savedTranscriptUrl = null;

            // 1. LOG NO CANAL (Embed Bilíngue)
            if (config?.logsChannelID) {
                const logChannel = guild.channels.cache.get(config.logsChannelID);
                if (logChannel && transcriptAttachment) {
                    const logEmbed = new EmbedBuilder()
                        .setTitle('📑 Ticket Finalizado / Ticket Closed')
                        .addFields(
                            { name: '🆔 Protocolo', value: `\`${ticketData.ticketCode || 'N/A'}\``, inline: true },
                            { name: '👤 Usuário/User', value: `${author || 'N/A'}`, inline: true },
                            { name: '🛡️ Staff', value: `${staff}`, inline: true },
                            { name: '⏱️ Duração/Duration', value: `\`${duration}\``, inline: true }
                        )
                        .setColor('#E74C3C')
                        .setTimestamp();

                    const logMsg = await logChannel.send({
                        embeds: [logEmbed],
                        files: [transcriptAttachment] 
                    });

                    if (logMsg.attachments.size > 0) savedTranscriptUrl = logMsg.attachments.first().url;
                }
            }

            // 2. DM PARA O USUÁRIO (Bilíngue + Arquivo Opcional)
            if (author) {
                const dmEmbed = new EmbedBuilder()
                    .setTitle(`✅ Atendimento Finalizado / Ticket Closed`)
                    .setDescription(
                        `🇧🇷 Olá **${author.username}**, seu ticket em **${guild.name}** foi encerrado.\n` +
                        `🇺🇸 Hello **${author.username}**, your ticket at **${guild.name}** has been closed.\n\n` +
                        `🆔 **Protocolo:** \`${ticketData.ticketCode || 'N/A'}\`\n` +
                        `⏱️ **Duração / Duration:** ${duration}`
                    )
                    .setColor('#2ECC71')
                    .setThumbnail(guild.iconURL({ dynamic: true }))
                    .setFooter({ text: 'Obrigado / Thank you' });

                const rateRow = new ActionRowBuilder().addComponents(
                    [1, 2, 3, 4, 5].map(n => new ButtonBuilder().setCustomId(`rate_${ticketData.id}_${n}`).setLabel(`${n} ⭐`).setStyle(ButtonStyle.Secondary))
                );

                const dmPayload = { 
                    embeds: [dmEmbed], 
                    components: [rateRow],
                    files: [] 
                };

                // Verifica Toggle de Transcript
                if (config?.sendTranscriptToDM && transcriptAttachment) {
                    dmPayload.files.push(transcriptAttachment);
                }

                await author.send(dmPayload).catch(() => {});
            }

            // 3. ATUALIZA BANCO
            await client.db.ticket.update({ 
                where: { id: ticketData.id }, 
                data: { status: 'CLOSED', closedAt: closedAt, transcriptUrl: savedTranscriptUrl } 
            });

            setTimeout(() => channel.delete().catch(() => {}), 5000);
        }
    }
};