const { Events, ActivityType } = require('discord.js');
const rustMonitor = require('../jobs/rust_monitor.js'); // <--- IMPORTANTE

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`✅ Logado como ${client.user.tag}`);
        
        // Define status
        client.user.setActivity('Rustvalley Manager Enterprise', { type: ActivityType.Watching });

        // --- INICIA O MONITOR RUST ---
        rustMonitor.execute(client);
        console.log('☢️ Monitor Rust iniciado.');
    },
};