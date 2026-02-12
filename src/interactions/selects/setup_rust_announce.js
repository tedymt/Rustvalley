const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        // Busca servidores da guilda
        const servers = await interaction.client.db.rustServer.findMany({
            where: { guildId: interaction.guild.id },
            orderBy: { id: 'asc' } // Ordem de criação
        });

        if (servers.length === 0) {
            return interaction.reply({ content: '❌ Nenhum servidor Rust configurado. Adicione um primeiro.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('📢 Configurar Anúncio de Wipe')
            .setDescription('Selecione abaixo **qual servidor** você deseja configurar o canal de anúncio.')
            .setColor('#E67E22');

        const select = new StringSelectMenuBuilder()
            .setCustomId('select_rust_server_announce') // Novo Handler
            .setPlaceholder('Escolha o servidor...')
            .addOptions(
                servers.map(s => ({
                    label: s.name,
                    description: s.announceChannelId ? `✅ Configurado: <#${s.announceChannelId}>` : '🔴 Não configurado',
                    value: String(s.id),
                    emoji: '🔥'
                }))
            );

        const row = new ActionRowBuilder().addComponents(select);

        await interaction.update({ embeds: [embed], components: [row] });
    }
};