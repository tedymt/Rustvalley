const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    async execute(interaction) {
        const serverId = parseInt(interaction.values[0]);
        const server = await prisma.rustServer.findUnique({ where: { id: serverId } });

        if (!server) return interaction.reply({ content: '❌ Erro: Servidor não encontrado.', ephemeral: true });

        const nextWipe = server.nextWipe ? `<t:${Math.floor(server.nextWipe.getTime() / 1000)}:R>` : 'N/A';
        const bannerStatus = server.imageUrl ? '✅ Custom' : '⚠️ Padrão';

        const embed = new EmbedBuilder()
            .setTitle(`⚙️ Configuração: ${server.name}`)
            .setDescription(`Gerencie as opções do servidor abaixo.\n\n` +
                `📡 **IP:** \`${server.serverIP}:${server.serverPort}\`\n` +
                `📅 **Wipe:** ${nextWipe}\n` +
                `🖼️ **Banner:** ${bannerStatus}`
            )
            .setColor('#2B2D31')
            .setThumbnail(interaction.guild.iconURL())
            .setImage(server.imageUrl || 'https://i.imgur.com/4i4Z5vD.png'); // Mostra preview

        // Linha 1: Configurações Principais
        const row1 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`rust_set_wipe_${serverId}`).setLabel('Definir Data').setStyle(ButtonStyle.Primary).setEmoji('📅'),
            new ButtonBuilder().setCustomId(`rust_set_image_${serverId}`).setLabel('Banner Wipe').setStyle(ButtonStyle.Secondary).setEmoji('🖼️'), // NOVO
            new ButtonBuilder().setCustomId(`rust_delete_${serverId}`).setLabel('Deletar').setStyle(ButtonStyle.Danger).setEmoji('🗑️')
        );

        // Linha 2: Funcionalidades
        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`rust_toggle_player_${serverId}`).setLabel('Players').setStyle(server.playerCountChannel ? ButtonStyle.Success : ButtonStyle.Secondary).setEmoji('👥'),
            new ButtonBuilder().setCustomId(`rust_toggle_wipe_${serverId}`).setLabel('Cronômetro').setStyle(server.wipeCountChannel ? ButtonStyle.Success : ButtonStyle.Secondary).setEmoji('⏳')
        );
        
        const row3 = new ActionRowBuilder().addComponents(
             new ButtonBuilder().setCustomId('module_rust_btn').setLabel('Voltar').setStyle(ButtonStyle.Secondary).setEmoji('⬅️')
        );

        await interaction.update({ embeds: [embed], components: [row1, row2, row3] });
    }
};