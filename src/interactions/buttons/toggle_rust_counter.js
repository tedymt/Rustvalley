const moduleRust = require('../modules/module_rust.js');
const { ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const { guild, client } = interaction;
        const config = await client.db.guild.findUnique({ where: { id: guild.id } });

        if (config.rustCounterChannel) {
            // DESATIVAR: Deleta o canal e limpa o banco
            const channel = guild.channels.cache.get(config.rustCounterChannel);
            if (channel) await channel.delete().catch(() => {});

            await client.db.guild.update({
                where: { id: guild.id },
                data: { rustCounterChannel: null }
            });

        } else {
            // ATIVAR: Cria o canal
            // Precisa ter configurado o IP antes, idealmente, mas criamos o canal igual
            const channel = await guild.channels.create({
                name: '🔴 Getting Data...',
                type: ChannelType.GuildVoice,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionFlagsBits.Connect], // Ninguém entra, só vê
                        allow: [PermissionFlagsBits.ViewChannel]
                    }
                ]
            });

            await client.db.guild.update({
                where: { id: guild.id },
                data: { rustCounterChannel: channel.id }
            });
        }

        await moduleRust.execute(interaction);
    }
};