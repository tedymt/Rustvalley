const moduleSecurity = require('../modules/module_security.js');
module.exports = {
    async execute(interaction) {
        const qty = parseInt(interaction.fields.getTextInputValue('qty_input'));
        if (isNaN(qty) || qty < 0) return interaction.reply({ content: '❌ Número inválido.', ephemeral: true });

        await interaction.client.db.guild.update({
            where: { id: interaction.guild.id },
            data: { maxMentions: qty }
        });
        await interaction.update({ content: '🔄 Salvando...', components: [] });
        await moduleSecurity.execute(interaction);
    }
};