const moduleRust = require('../modules/module_rust.js');

module.exports = {
    async execute(interaction) {
        const { guild, client } = interaction;
        
        // Busca config atual
        const config = await client.db.guild.findUnique({ where: { id: guild.id } });

        if (config.rustAnnounceChannel) {
            // --- DESATIVAR (Limpa o canal) ---
            await client.db.guild.update({
                where: { id: guild.id },
                data: { rustAnnounceChannel: null }
            });
            // Não precisa responder, o painel recarrega
        } else {
            // --- TENTATIVA DE ATIVAR SEM CANAL ---
            return interaction.reply({ 
                content: '⚠️ **Para ativar os anúncios:**\nPor favor, selecione um canal no menu **"📢 Configurar Canais"** logo acima!', 
                ephemeral: true 
            });
        }

        // Recarrega o painel
        await moduleRust.execute(interaction);
    }
};