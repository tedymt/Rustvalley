const { 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ChannelSelectMenuBuilder, 
    ChannelType, 
    MessageFlags 
} = require('discord.js');

module.exports = {
    async execute(interaction) {
        const { guild, client } = interaction;

        const config = await client.db.guild.upsert({
            where: { id: guild.id },
            update: {},
            create: { id: guild.id }
        });

        // Status Visual (Mantido original + Adição do Anti-Mídia)
        const sLink = config.antiLink ? '✅ On' : '❌ Off';
        const sToxic = config.antiToxic ? '✅ On' : '❌ Off';
        const sSpam = config.antiSpam ? '✅ On' : '❌ Off';
        const sMedia = config.antiMedia ? '✅ On' : '❌ Off'; // <--- NOVO STATUS
        const sMention = config.maxMentions > 0 ? `✅ Max: ${config.maxMentions}` : '❌ Off';
        const sLog = config.securityLogChannel ? `<#${config.securityLogChannel}>` : '❌ N/A';

        const embed = new EmbedBuilder()
            .setTitle('🛡️ Central de Segurança Completa')
            .setDescription('Gerencie todas as camadas de defesa do servidor.')
            .addFields(
                { name: '🔗 Anti-Link', value: sLink, inline: true },
                { name: '🤬 Anti-Toxic', value: sToxic, inline: true },
                { name: '⚡ Anti-Spam', value: sSpam, inline: true },
                { name: '🖼️ Anti-Mídia', value: sMedia, inline: true }, // <--- NOVO CAMPO
                { name: '📢 Max Mentions', value: sMention, inline: true },
                { name: '👶 Anti-Fake', value: config.minAccountAge > 0 ? `${config.minAccountAge}d` : 'Off', inline: true },
                { name: '📜 Logs', value: sLog, inline: true }
            )
            .setColor('#2b2d31')
            .setFooter({ text: 'Rustvalley Manager • Enterprise Protection Suite' });

        // Menu de Canais (Mantido)
        const rowLogs = new ActionRowBuilder().addComponents(
            new ChannelSelectMenuBuilder()
                .setCustomId('setup_security_logs')
                .setPlaceholder('📜 Selecione o Canal de Logs de Segurança...')
                .setChannelTypes(ChannelType.GuildText)
        );

        // Linha 1 de Botões (Mantido + Toggle Mídia)
        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_toggle_antilink')
                .setLabel('Anti-Link')
                .setStyle(config.antiLink ? ButtonStyle.Success : ButtonStyle.Secondary)
                .setEmoji('🔗'),
            new ButtonBuilder()
                .setCustomId('btn_toggle_antitoxic')
                .setLabel('Anti-Toxic')
                .setStyle(config.antiToxic ? ButtonStyle.Success : ButtonStyle.Secondary)
                .setEmoji('🤬'),
            new ButtonBuilder()
                .setCustomId('btn_toggle_antispam')
                .setLabel('Anti-Spam')
                .setStyle(config.antiSpam ? ButtonStyle.Success : ButtonStyle.Secondary)
                .setEmoji('⚡'),
            // ADICIONADO AQUI PARA NÃO QUEBRAR O LAYOUT
            new ButtonBuilder()
                .setCustomId('btn_toggle_antimedia') // Handler já criado anteriormente
                .setLabel('Anti-Mídia')
                .setStyle(config.antiMedia ? ButtonStyle.Success : ButtonStyle.Secondary)
                .setEmoji('🖼️')
        );

        // Linha 2 de Botões (Mantido + Voltar para Comunidade)
        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_set_mentions')
                .setLabel('Limite Menções')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📢'),
            new ButtonBuilder()
                .setCustomId('btn_set_antifake')
                .setLabel('Anti-Fake')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('👶'),
            // Alterado para voltar ao menu "Comunidade" que agora é o pai da segurança
            new ButtonBuilder()
                .setCustomId('module_community') 
                .setLabel('Voltar')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('⬅️')
        );

        // Lógica de Envio (Mantido)
        if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ embeds: [embed], components: [rowLogs, row1, row2], content: null });
            } else {
                await interaction.update({ embeds: [embed], components: [rowLogs, row1, row2], content: null });
            }
        } else {
            await interaction.reply({ embeds: [embed], components: [rowLogs, row1, row2], flags: MessageFlags.Ephemeral });
        }
    }
};