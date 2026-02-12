const { giveaway_monitor } = require('../../jobs/giveaway_monitor.js'); // Importamos a função de finalizar

module.exports = {
    async execute(interaction) {
        const gwId = parseInt(interaction.customId.split('_').pop());
        const gw = await interaction.client.db.giveaway.findUnique({ where: { id: gwId } });

        if (gw.ended) return interaction.reply({ content: '❌ Já encerrado.', ephemeral: true });

        // Chamamos a função de finalizar que você tem no monitor
        // Para isso, o monitor precisa exportar a função finishGiveaway ou você copia a lógica aqui
        await interaction.reply({ content: '🎲 **Sorteando agora... / Drawing now...**', ephemeral: true });
        
        // Aqui simulamos o monitor agindo agora
        const monitor = require('../../jobs/giveaway_monitor.js');
        // Se você usou o código que te passei antes, precisamos apenas garantir que o banco marque como vencido
        await interaction.client.db.giveaway.update({
            where: { id: gwId },
            data: { endTime: new Date() } // Define o tempo para agora
        });
        // O monitor pegará no próximo ciclo de 30s ou você executa a função direto se exportada.
    }
};