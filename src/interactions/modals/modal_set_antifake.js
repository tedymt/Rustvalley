const moduleSecurity = require('../modules/module_security.js');

module.exports = {
    async execute(interaction) {
        const inputVal = interaction.fields.getTextInputValue('days_input');
        const days = parseInt(inputVal);

        if (isNaN(days) || days < 0) {
            // Se não for número válido, avisa e para (não tenta atualizar o painel)
            // Precisamos responder porque é um modal
            return interaction.reply({ content: '❌ Por favor, insira um número válido (0 ou maior).', ephemeral: true });
        }

        // Salva no banco
        await interaction.client.db.guild.update({
            where: { id: interaction.guild.id },
            data: { minAccountAge: days }
        });

        // Feedback visual rápido (opcional, mas bom para UX)
        // Isso coloca o estado "deferred/replied" como true, ativando a correção no module_security
        await interaction.update({ content: '🔄 Salvando configuração...', components: [] });

        // Chama o painel para recarregar (ele vai sobrescrever a mensagem acima)
        await moduleSecurity.execute(interaction);
    }
};