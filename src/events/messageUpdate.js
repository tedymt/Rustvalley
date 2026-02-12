const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.MessageUpdate,
    async execute(oldMessage, newMessage) {
        if (!oldMessage.guild || oldMessage.author?.bot) return;
        
        // Ignora se o conteúdo for igual (mudança apenas de link/embed)
        if (oldMessage.content === newMessage.content) return;

        const config = await newMessage.client.db.guild.findUnique({ 
            where: { id: newMessage.guild.id },
            select: { securityLogChannel: true }
        });

        if (config && config.securityLogChannel) {
            const logChannel = newMessage.guild.channels.cache.get(config.securityLogChannel);
            if (logChannel) {
                const embed = new EmbedBuilder()
                    .setTitle('✏️ Mensagem Editada')
                    .setColor('#3498DB') // Azul
                    .setDescription(`**Autor:** ${newMessage.author} | **Canal:** ${newMessage.channel}`)
                    .addFields(
                        { name: '⬅️ Antes', value: `\`\`\`${oldMessage.content ? oldMessage.content.substring(0, 1000) : 'N/A'}\`\`\`` },
                        { name: '➡️ Depois', value: `\`\`\`${newMessage.content ? newMessage.content.substring(0, 1000) : 'N/A'}\`\`\`` }
                    )
                    .setTimestamp();
                
                // Adiciona link para ir até a mensagem
                const btnLink = `https://discord.com/channels/${newMessage.guild.id}/${newMessage.channel.id}/${newMessage.id}`;
                embed.addFields({ name: '🔗 Link', value: `[Ir para mensagem](${btnLink})` });

                logChannel.send({ embeds: [embed] });
            }
        }
    },
};