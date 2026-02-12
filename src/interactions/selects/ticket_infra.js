const { 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ChannelSelectMenuBuilder, 
    RoleSelectMenuBuilder, 
    ChannelType, 
    MessageFlags 
} = require('discord.js');

module.exports = {
    async execute(interaction) {
        const { guild, client } = interaction;

        // 1. Busca Configuração Atual
        const config = await client.db.ticketConfig.findUnique({ 
            where: { guildId: guild.id } 
        });

        // 2. Monta o Embed Informativo
        const embed = new EmbedBuilder()
            .setTitle('⚙️ Infraestrutura dos Tickets')
            .setDescription('Configure onde os tickets serão abertos e quem poderá atendê-los.')
            .addFields(
                { 
                    name: '📂 Categoria', 
                    value: config?.categoryID ? `<#${config.categoryID}>` : '❌ Não definida (Tickets ficarão soltos)', 
                    inline: true 
                },
                { 
                    name: '📜 Canal de Logs', 
                    value: config?.logsChannelID ? `<#${config.logsChannelID}>` : '❌ Desativado', 
                    inline: true 
                },
                { 
                    name: '🛡️ Cargo de Suporte', 
                    value: config?.supportRoleID ? `<@&${config.supportRoleID}>` : '❌ @everyone (Perigoso)', 
                    inline: true 
                }
            )
            .setColor('#2b2d31')
            .setFooter({ text: 'As alterações são salvas automaticamente ao selecionar.' });

        // 3. Menus de Seleção
        
        // Menu de Categoria
        const rowCategory = new ActionRowBuilder().addComponents(
            new ChannelSelectMenuBuilder()
                .setCustomId('setup_ticket_category')
                .setPlaceholder('📂 Selecione a Categoria dos Tickets')
                .setChannelTypes(ChannelType.GuildCategory)
        );

        // Menu de Canal de Logs
        const rowLogs = new ActionRowBuilder().addComponents(
            new ChannelSelectMenuBuilder()
                .setCustomId('setup_ticket_logs')
                .setPlaceholder('📜 Selecione o Canal de Logs (Transcripts)')
                .setChannelTypes(ChannelType.GuildText)
        );

        // Menu de Cargo de Suporte
        const rowRole = new ActionRowBuilder().addComponents(
            new RoleSelectMenuBuilder()
                .setCustomId('setup_ticket_role')
                .setPlaceholder('🛡️ Selecione o Cargo de Staff/Suporte')
        );

        // 4. BOTÃO VOLTAR (ADICIONADO)
        const rowButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('back_to_tickets') // Redireciona para o menu anterior
                .setLabel('Voltar')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('⬅️')
        );

        // 5. Envia/Atualiza o Painel
        if (interaction.isMessageComponent()) {
            await interaction.update({ 
                embeds: [embed], 
                components: [rowCategory, rowLogs, rowRole, rowButtons] 
            });
        } else {
            await interaction.reply({ 
                embeds: [embed], 
                components: [rowCategory, rowLogs, rowRole, rowButtons], 
                flags: MessageFlags.Ephemeral 
            });
        }
    }
};