const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        const { guild, client } = member;

        try {
            const config = await client.db.guild.findUnique({ where: { id: guild.id } });
            if (!config || !config.byeChannel) return;

            const channel = guild.channels.cache.get(config.byeChannel);
            if (!channel) return;

            const embed = new EmbedBuilder()
                .setTitle(`😢 Um membro saiu / A member left`)
                .setDescription(
                    `🇧🇷 **${member.user.tag}** deixou o servidor.\n` +
                    `Agora somos **${guild.memberCount}** membros.\n\n` +
                    
                    `🇺🇸 **${member.user.tag}** left the server.\n` +
                    `We are now **${guild.memberCount}** members.`
                )
                .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                .setColor('#E74C3C') // Vermelho Triste
                .setFooter({ text: guild.name, iconURL: guild.iconURL() })
                .setTimestamp();

            await channel.send({ embeds: [embed] });

        } catch (error) {
            console.error('[BYE ERROR]', error);
        }
    },
};