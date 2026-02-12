const moduleRust = require('../modules/module_rust.js');
const { DateTime } = require('luxon'); // Vamos usar luxon se tiver, ou Date nativo

module.exports = {
    async execute(interaction) {
        const dateStr = interaction.fields.getTextInputValue('wipe_date_input');
        // Espera formato DD/MM/YYYY HH:MM
        
        // Parse manual simples para garantir formato BR
        const parts = dateStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{1,2})/);
        
        if (!parts) {
            return interaction.reply({ content: '❌ Formato inválido! Use: **DD/MM/AAAA HH:MM** (Ex: 30/01/2026 14:00)', ephemeral: true });
        }

        // Cria objeto Date (Mês começa em 0 no JS)
        const dateObj = new Date(parts[3], parts[2] - 1, parts[1], parts[4], parts[5]);

        if (isNaN(dateObj.getTime())) {
            return interaction.reply({ content: '❌ Data impossível / Invalid Date.', ephemeral: true });
        }

        await interaction.client.db.guild.update({
            where: { id: interaction.guild.id },
            data: { rustWipeDate: dateObj }
        });

        await interaction.update({ content: '🔄 Atualizando...', components: [] });
        await moduleRust.execute(interaction);
    }
};