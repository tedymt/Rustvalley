const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const selectedChannelId = interaction.values[0];
        const { client, guild } = interaction;
        const channel = guild.channels.cache.get(selectedChannelId);

        // Busca as configurações "Enterprise" no Postgres
        const [config, departments] = await Promise.all([
            client.db.ticketConfig.findUnique({ where: { guildId: guild.id } }),
            client.db.department.findMany({ where: { guildId: guild.id }, take: 5 })
        ]);

        // Se o admin não configurou nada, usamos valores padrão (Fail-Safe)
        const embed = new EmbedBuilder()
            .setTitle(config?.title || "🎫 Central de Atendimento")
            .setDescription(config?.description || "Clique no botão do departamento desejado para abrir um ticket.")
            .setColor(config?.color || "#5865F2")
            .setFooter({ text: config?.footer || "Rustvalley Manager - Enterprise System" });

        if (config?.banner) embed.setImage(config.banner);

        const row = new ActionRowBuilder();

        if (departments.length > 0) {
            departments.forEach(dep => {
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(`open_ticket_${dep.id}`)
                        .setLabel(dep.name)
                        .setEmoji(dep.emoji || "📩")
                        .setStyle(ButtonStyle.Secondary)
                );
            });
        } else {
            // Botão padrão se não houver departamentos criados
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId('open_ticket_default')
                    .setLabel('Abrir/Open')
                    .setStyle(ButtonStyle.Primary)
            );
        }

        // Envia para o canal de destino
        await channel.send({ embeds: [embed], components: [row] });

        // Responde ao Admin no Painel
        await interaction.update({ 
            content: `✅ **Vitrine Enterprise publicada com sucesso em ${channel}!**`, 
            components: [], 
            embeds: [] 
        });
    }
};