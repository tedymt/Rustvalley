const { Events, EmbedBuilder, AuditLogEvent } = require('discord.js');

module.exports = {
    name: Events.MessageDelete,
    async execute(message) {
        if (!message.guild || message.author?.bot) return;

        const config = await message.client.db.guild.findUnique({ 
            where: { id: message.guild.id },
            select: { securityLogChannel: true }
        });

        if (config && config.securityLogChannel) {
            const logChannel = message.guild.channels.cache.get(config.securityLogChannel);
            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setTitle('🗑️ Mensagem Apagada')
                    .setColor('#FFA500') // Laranja
                    .addFields(
                        { name: '👤 Autor', value: `${message.author}`, inline: true },
                        { name: '📍 Canal', value: `${message.channel}`, inline: true },
                        { name: '📝 Conteúdo', value: message.content ? `\`\`\`${message.content.substring(0, 1000)}\`\`\`` : '*Conteúdo não texto (Imagem/Embed)*' }
                    )
                    .setFooter({ text: `ID: ${message.id}` })
                    .setTimestamp();

                logChannel.send({ embeds: [embed] });
            }
        }
    },
};