const { MessageFlags } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const timeInput = interaction.fields.getTextInputValue('ann_time'); // Ex: 15/02/2026 20:00
        const intervalInput = interaction.fields.getTextInputValue('ann_interval') || '0';

        // Lógica simples de conversão de data (DD/MM/YYYY HH:MM)
        const [datePart, timePart] = timeInput.split(' ');
        const [day, month, year] = datePart.split('/');
        const [hour, minute] = timePart.split(':');
        
        const scheduledDate = new Date(year, month - 1, day, hour, minute);

        if (isNaN(scheduledDate.getTime()) || scheduledDate < new Date()) {
            return interaction.reply({ content: '❌ Data inválida ou no passado! Use: DD/MM/AAAA HH:MM', flags: MessageFlags.Ephemeral });
        }

        // Aqui você salvaria no banco de dados ScheduledAnnouncement
        // Usando os dados que estavam no estado do Preview (Titulo, Conteúdo, etc)
        // Dica: Você pode usar cache ou variáveis globais temporárias para segurar os dados entre modais
        
        await interaction.reply({ content: `✅ Anúncio agendado com sucesso para <t:${Math.floor(scheduledDate.getTime()/1000)}:F>!`, flags: MessageFlags.Ephemeral });
    }
};