const moduleRust = require('../modules/module_rust.js');

module.exports = {
    async execute(interaction) {
        const tz = interaction.fields.getTextInputValue('timezone_input');

        try {
            // Testa se o timezone é válido
            Intl.DateTimeFormat(undefined, { timeZone: tz });
            
            await interaction.client.db.guild.update({
                where: { id: interaction.guild.id },
                data: { rustTimezone: tz }
            });

            await interaction.update({ content: '🔄 Salvando...', components: [] });
            await moduleRust.execute(interaction);

        } catch (e) {
            return interaction.reply({ content: `❌ Fuso horário inválido: \`${tz}\`. Tente \`America/Sao_Paulo\` ou \`UTC\`.`, ephemeral: true });
        }
    }
};