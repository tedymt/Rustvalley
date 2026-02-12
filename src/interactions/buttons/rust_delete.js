const moduleRust = require('../modules/module_rust.js');

module.exports = {
    async execute(interaction) {
        const serverId = parseInt(interaction.customId.split('_').pop());
        const { guild, client } = interaction;

        const server = await client.db.rustServer.findUnique({ where: { id: serverId } });
        
        if (server) {
            // Deleta canais do Discord se existirem
            if (server.playerCountChannel) {
                const c = guild.channels.cache.get(server.playerCountChannel);
                if (c) await c.delete().catch(() => {});
            }
            if (server.wipeCountChannel) {
                const c = guild.channels.cache.get(server.wipeCountChannel);
                if (c) await c.delete().catch(() => {});
            }

            // Deleta do Banco
            await client.db.rustServer.delete({ where: { id: serverId } });
        }

        // Volta para o Painel Principal
        await moduleRust.execute(interaction);
    }
};