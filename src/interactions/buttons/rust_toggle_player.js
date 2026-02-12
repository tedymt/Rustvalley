const { ChannelType, PermissionFlagsBits } = require('discord.js');
const serverSelect = require('../selects/rust_server_select.js'); // Para voltar ao menu do servidor

module.exports = {
    async execute(interaction) {
        const serverId = parseInt(interaction.customId.split('_').pop());
        const { guild, client } = interaction;

        const server = await client.db.rustServer.findUnique({ where: { id: serverId } });
        if (!server) return interaction.reply({ content: '❌ Servidor não existe mais.', ephemeral: true });

        if (server.playerCountChannel) {
            // DESATIVAR
            const channel = guild.channels.cache.get(server.playerCountChannel);
            if (channel) await channel.delete().catch(() => {});

            await client.db.rustServer.update({
                where: { id: serverId },
                data: { playerCountChannel: null }
            });
        } else {
            // ATIVAR
            const channel = await guild.channels.create({
                name: `🔴 ${server.name}: Loading...`,
                type: ChannelType.GuildVoice,
                permissionOverwrites: [
                    { id: guild.id, deny: [PermissionFlagsBits.Connect], allow: [PermissionFlagsBits.ViewChannel] }
                ]
            });

            await client.db.rustServer.update({
                where: { id: serverId },
                data: { playerCountChannel: channel.id }
            });
        }

        // Simula a seleção do menu para atualizar a tela
        interaction.values = [serverId.toString()];
        await serverSelect.execute(interaction);
    }
};