const moduleSuggestions = require('../modules/module_suggestions.js');

module.exports = {
    async execute(interaction) {
        // Verifica se é PT ou EN pelo final do ID
        const isPT = interaction.customId.endsWith('_pt');
        const channelId = interaction.values[0];

        if (isPT) {
            await interaction.client.db.guild.update({
                where: { id: interaction.guild.id },
                data: { suggestionChannelPT: channelId }
            });
        } else {
            await interaction.client.db.guild.update({
                where: { id: interaction.guild.id },
                data: { suggestionChannelEN: channelId }
            });
        }

        // Feedback e volta para o menu
        await interaction.update({ content: `✅ Canal **${isPT ? 'PT-BR' : 'EN-US'}** configurado!`, components: [] });
        
        // Opcional: Reabrir o painel principal para ver a mudança
        await moduleSuggestions.execute(interaction);
    }
};