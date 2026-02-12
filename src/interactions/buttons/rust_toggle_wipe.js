const { ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    async execute(interaction) {
        const serverId = parseInt(interaction.customId.split('_')[3]);

        const server = await prisma.rustServer.findUnique({
            where: { id: serverId }
        });

        if (!server) {
            return interaction.reply({ content: '❌ Server not found / Servidor não encontrado.', ephemeral: true });
        }

        const guild = interaction.guild;
        const isPT = server.language === 'PT'; // Verifica idioma

        // LÓGICA DE TOGGLE
        if (server.wipeCountChannel) {
            // --- DESLIGAR ---
            const oldChannel = guild.channels.cache.get(server.wipeCountChannel);
            if (oldChannel) {
                await oldChannel.delete().catch(() => {});
            }

            await prisma.rustServer.update({
                where: { id: serverId },
                data: { wipeCountChannel: null }
            });

            await refreshPanel(interaction, serverId, false);

        } else {
            // --- LIGAR ---
            try {
                const channelName = `wipe-${server.name}`.toLowerCase().replace(/[^a-z0-9-]/g, '-'); // Sanitiza nome

                const newChannel = await guild.channels.create({
                    name: channelName, 
                    type: ChannelType.GuildText,
                    topic: isPT ? `Cronômetro automático para: ${server.name}` : `Automatic countdown for: ${server.name}`,
                    permissionOverwrites: [
                        {
                            id: guild.id, 
                            allow: [PermissionFlagsBits.ViewChannel],
                            deny: [PermissionFlagsBits.SendMessages] 
                        },
                        {
                            id: interaction.client.user.id, 
                            allow: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.EmbedLinks]
                        }
                    ]
                });

                // Mensagem Inicial Bilíngue
                const loadingText = isPT 
                    ? '⚙️ **Iniciando cronômetro...**\nO painel aparecerá aqui na próxima atualização (até 60s).'
                    : '⚙️ **Starting countdown...**\nThe panel will appear here on the next update (up to 60s).';

                const loadingEmbed = new EmbedBuilder()
                    .setDescription(loadingText)
                    .setColor('#2B2D31');
                
                await newChannel.send({ embeds: [loadingEmbed] });

                await prisma.rustServer.update({
                    where: { id: serverId },
                    data: { wipeCountChannel: newChannel.id }
                });

                await refreshPanel(interaction, serverId, true);

            } catch (error) {
                console.error(error);
                return interaction.reply({ content: '❌ Error creating channel. Check permissions!', ephemeral: true });
            }
        }
    }
};

// Função auxiliar de atualização do painel (Mantida igual, apenas contexto)
async function refreshPanel(interaction, serverId, isEnabled) {
    const updatedServer = await prisma.rustServer.findUnique({ where: { id: serverId } });
    
    const nextWipeDisplay = updatedServer.nextWipe 
            ? `<t:${Math.floor(updatedServer.nextWipe.getTime() / 1000)}:f> (<t:${Math.floor(updatedServer.nextWipe.getTime() / 1000)}:R>)` 
            : '🔴 N/A';

    const announceChannelDisplay = updatedServer.announceChannelId ? `<#${updatedServer.announceChannelId}>` : '❌ Off';
    const playerCountDisplay = updatedServer.playerCountChannel ? `<#${updatedServer.playerCountChannel}>` : '❌ Off';
    const wipeCountDisplay = updatedServer.wipeCountChannel ? `<#${updatedServer.wipeCountChannel}>` : '❌ Off';

    const embed = new EmbedBuilder()
        .setTitle(`⚙️ Config: ${updatedServer.name}`)
        .setDescription(`**IP:** \`${updatedServer.serverIP}:${updatedServer.serverPort}\`\n` +
            `**Wipe:** ${nextWipeDisplay}\n` +
            `**Announce:** ${announceChannelDisplay}\n` + 
            `**Players:** ${playerCountDisplay}\n` +
            `**Timer:** ${wipeCountDisplay}`
        )
        .setColor('#CE422B')
        .setFooter({ text: 'Koda Manager', iconURL: interaction.guild.iconURL() });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`rust_set_wipe_${serverId}`).setLabel('Set Date').setStyle(ButtonStyle.Primary).setEmoji('📅'),
        new ButtonBuilder().setCustomId(`rust_toggle_player_${serverId}`).setLabel('Player Counter').setStyle(updatedServer.playerCountChannel ? ButtonStyle.Success : ButtonStyle.Secondary).setEmoji('👥'),
        new ButtonBuilder().setCustomId(`rust_toggle_wipe_${serverId}`).setLabel('Wipe Timer').setStyle(isEnabled ? ButtonStyle.Success : ButtonStyle.Secondary).setEmoji('⏳'),
        new ButtonBuilder().setCustomId(`rust_delete_${serverId}`).setLabel('Delete').setStyle(ButtonStyle.Danger).setEmoji('🗑️')
    );

    const rowBack = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('module_rust_btn').setLabel('Back').setStyle(ButtonStyle.Secondary).setEmoji('⬅️')
    );

    await interaction.update({ embeds: [embed], components: [row, rowBack] });
}