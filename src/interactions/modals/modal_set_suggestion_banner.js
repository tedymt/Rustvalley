const moduleSuggestions = require('../modules/module_suggestions.js');

module.exports = {
    async execute(interaction) {
        const url = interaction.fields.getTextInputValue('banner_url');

        // Validação simples de URL
        if (!url.startsWith('http')) {
            return interaction.reply({ content: '❌ URL inválida. Use um link direto (imgur, discord cdn, etc).', ephemeral: true });
        }

        await interaction.client.db.guild.update({
            where: { id: interaction.guild.id },
            data: { suggestionBanner: url }
        });

        await moduleSuggestions.execute(interaction);
    }
};