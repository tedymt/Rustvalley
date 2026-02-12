const { EmbedBuilder, ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType } = require('discord.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    async execute(interaction) {
        // AQUI sim podemos ler o values[0], pois é uma interação de Select Menu
        const serverId = interaction.values[0]; 

        const server = await prisma.rustServer.findUnique({
            where: { id: parseInt(serverId) }
        });

        if (!server) {
            return interaction.reply({ content: '❌ Servidor não encontrado no banco.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle(`📢 Definir Canal: ${server.name}`)
            .setDescription(`Você selecionou o servidor **${server.name}**.\nAgora, escolha o **Canal de Texto** onde os avisos de Wipe serão enviados.`)
            .setColor('#3498DB');

        // Cria o seletor de CANAL
        const channelSelect = new ChannelSelectMenuBuilder()
            .setCustomId(`select_rust_channel_final_${server.id}`) // Passa o ID pro próximo passo
            .setPlaceholder('Selecione o canal de texto...')
            .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement);

        const row = new ActionRowBuilder().addComponents(channelSelect);

        await interaction.update({ content: null, embeds: [embed], components: [row] });
    }
};