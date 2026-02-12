const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = {
    async execute(interaction) {
        // 1. Busca os servidores cadastrados no banco
        const servers = await prisma.rustServer.findMany({
            where: { guildId: interaction.guild.id },
            orderBy: { id: 'asc' }
        });

        // Se não tiver servidor, avisa e para
        if (servers.length === 0) {
            return interaction.reply({ content: '❌ Nenhum servidor Rust encontrado. Cadastre um primeiro!', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('📢 Configurar Anúncio de Wipe')
            .setDescription('Selecione abaixo **qual servidor** você deseja configurar o canal de anúncio.')
            .setColor('#E67E22');

        // 2. Cria o MENU DE SELEÇÃO (StringSelectMenu)
        // O customId 'select_rust_server_announce' fará o bot procurar esse nome na pasta SELECTS quando o usuário escolher
        const select = new StringSelectMenuBuilder()
            .setCustomId('select_rust_server_announce') 
            .setPlaceholder('Escolha o servidor...')
            .addOptions(
                servers.map(s => ({
                    label: s.name,
                    description: s.announceChannelId ? '✅ Configurado' : '🔴 Não configurado',
                    value: String(s.id),
                    emoji: '🔥'
                }))
            );

        const row = new ActionRowBuilder().addComponents(select);

        // Atualiza a mensagem do botão para virar o menu
        await interaction.update({ content: null, embeds: [embed], components: [row] });
    }
};