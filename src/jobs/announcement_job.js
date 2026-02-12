const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'announcement_job',
    async execute(client) {
        console.log('⏰ Motor de Anúncios iniciado...');
        
        setInterval(async () => {
            const now = new Date();
            const pending = await client.db.scheduledAnnouncement.findMany({
                where: { status: 'PENDING', scheduledTime: { lte: now } }
            });

            for (const ann of pending) {
                try {
                    const guild = await client.guilds.fetch(ann.guildId).catch(() => null);
                    if (!guild) continue;
                    const channel = await guild.channels.fetch(ann.channelId).catch(() => null);
                    if (!channel) continue;

                    const embed = new EmbedBuilder()
                        .setTitle(ann.title)
                        .setDescription(ann.content)
                        .setColor('#5865F2')
                        .setTimestamp();
                    if (ann.imageUrl) embed.setImage(ann.imageUrl);

                    await channel.send({ 
                        content: ann.mentionEveryone ? '@everyone' : null, 
                        embeds: [embed] 
                    });

                    if (ann.intervalDays > 0) {
                        const next = new Date();
                        next.setDate(next.getDate() + ann.intervalDays);
                        await client.db.scheduledAnnouncement.update({ where: { id: ann.id }, data: { scheduledTime: next } });
                    } else {
                        await client.db.scheduledAnnouncement.update({ where: { id: ann.id }, data: { status: 'SENT' } });
                    }
                } catch (e) { console.error(e); }
            }
        }, 60000);
    }
};