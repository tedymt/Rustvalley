const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ChannelSelectMenuBuilder, ChannelType, MessageFlags } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const { guild, client } = interaction;

        const config = await client.db.guild.upsert({
            where: { id: guild.id },
            update: {},
            create: { id: guild.id }
        });

        const serverCount = await client.db.rustServer.count({ where: { guildId: guild.id } });
        
        // Status Visual
        const logStatus = config.rustLogChannel ? `<#${config.rustLogChannel}>` : '❌ Off';
        const announceStatus = config.rustAnnounceChannel ? `<#${config.rustAnnounceChannel}>` : '❌ Off';

        const embed = new EmbedBuilder()
            .setTitle('☢️ Rust Sentinel Manager')
            .setDescription('Gerencie wipes, monitore status e automação.')
            .addFields(
                { name: '📡 Servers', value: `\`${serverCount}/8\``, inline: true },
                { name: '🚨 Logs (Crash)', value: logStatus, inline: true },
                { name: '📢 Auto-Announce', value: announceStatus, inline: true }
            )
            .setColor('#CE422B')
            .setThumbnail('https://files.facepunch.com/rust/comm/2020/january/blog_header_2.png');

        // 1. Menu de Configuração de Canais
        const rowChannels = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('rust_channel_config')
                .setPlaceholder('📢 Configurar Canais de Alerta...')
                .addOptions([
                    { label: 'Definir Canal de Logs (Crashes)', value: 'set_log_channel', emoji: '🚨' },
                    { label: 'Definir Canal de Anúncios (Wipes)', value: 'set_announce_channel', emoji: '📢' }
                ])
        );

        // 2. Menu de Configurações Globais
        const rowServerOptions = new ActionRowBuilder().addComponents(
             new StringSelectMenuBuilder()
                .setCustomId('rust_config_select')
                .setPlaceholder('🛠️ Configurações Globais')
                .addOptions([
                    { label: 'Fuso Horário', value: 'set_timezone', emoji: '🌎' }
                ])
        );

        const components = [rowChannels, rowServerOptions];

        // 3. Menu de Seleção de Servidor (se houver)
        const servers = await client.db.rustServer.findMany({ where: { guildId: guild.id } });
        if (servers.length > 0) {
            const serverMenu = new StringSelectMenuBuilder()
                .setCustomId('rust_server_select')
                .setPlaceholder('⚙️ Gerenciar Servidor...')
                .addOptions(servers.map(s => ({
                    label: s.name,
                    value: s.id.toString(),
                    emoji: '☢️'
                })));
            components.push(new ActionRowBuilder().addComponents(serverMenu));
        }
        
        // 4. Botões de Ação (Com o novo Toggle)
        const btnRow = new ActionRowBuilder().addComponents(
             new ButtonBuilder()
                .setCustomId('btn_add_rust_server')
                .setLabel('Add Server')
                .setStyle(ButtonStyle.Success)
                .setEmoji('➕')
                .setDisabled(serverCount >= 8),
            new ButtonBuilder().setCustomId('module_rust_lfg').setLabel('Team Finder').setStyle(ButtonStyle.Primary).setEmoji('🤝'),
            // --- NOVO BOTÃO DE TOGGLE ---
             new ButtonBuilder()
                .setCustomId('btn_toggle_announce')
                .setLabel(config.rustAnnounceChannel ? 'Anúncios: ON' : 'Anúncios: OFF')
                .setStyle(config.rustAnnounceChannel ? ButtonStyle.Success : ButtonStyle.Secondary)
                .setEmoji(config.rustAnnounceChannel ? '🔔' : '🔕'),

             new ButtonBuilder()
                .setCustomId('back_to_main')
                .setLabel('Voltar')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('⬅️')
        );
        components.push(btnRow);

        if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
            if (interaction.replied || interaction.deferred) await interaction.editReply({ embeds: [embed], components: components, content: null });
            else await interaction.update({ embeds: [embed], components: components, content: null });
        } else {
            await interaction.reply({ embeds: [embed], components: components, flags: MessageFlags.Ephemeral });
        }
    }
};