const moduleRust = require('../modules/module_rust.js');

module.exports = {
    async execute(interaction) {
        const serverId = parseInt(interaction.customId.split('_').pop());
        const dateStr = interaction.fields.getTextInputValue('wipe_date_input');

        const parts = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2})/);
        
        if (!parts) {
            return interaction.reply({ content: '❌ Formato inválido! Use: **DD/MM/AAAA HH:MM**', ephemeral: true });
        }

        const dateObj = new Date(parts[3], parts[2] - 1, parts[1], parts[4], parts[5]);

        if (isNaN(dateObj.getTime())) {
            return interaction.reply({ content: '❌ Data inválida.', ephemeral: true });
        }

        // ATUALIZAÇÃO AQUI: Reseta 'wipeAnnounced' para false
        await interaction.client.db.rustServer.update({
            where: { id: serverId },
            data: { 
                nextWipe: dateObj,
                wipeAnnounced: false // <--- PREPARA PARA O PRÓXIMO ANÚNCIO
            }
        });

        await interaction.reply({ content: `✅ Data atualizada para <t:${Math.floor(dateObj.getTime()/1000)}:f>! O anúncio automático foi rearmado.`, ephemeral: true });
    }
};