const moduleAutoResponse = require('../modules/module_auto_response.js');

module.exports = {
    async execute(interaction) {
        const id = parseInt(interaction.values[0]);

        await interaction.client.db.autoResponse.delete({
            where: { id }
        });

        await interaction.update({ content: '✅ Gatilho removido.', components: [] });
        await moduleAutoResponse.execute(interaction); // Volta pro painel principal (você precisará ajustar se quiser voltar pra lá direto ou só confirmar)
    }
};