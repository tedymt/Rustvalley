const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        // Verifica se o canal está configurado antes de abrir
        const config = await interaction.client.db.guild.findUnique({ where: { id: interaction.guild.id } });
        
        if (!config?.suggestionChannel) {
            return interaction.reply({ 
                content: '❌ **O canal de sugestões não está configurado.** Peça a um admin para configurar.', 
                ephemeral: true 
            });
        }

        const modal = new ModalBuilder()
            .setCustomId('modal_suggest')
            .setTitle('Nova Sugestão / New Suggestion');

        const input = new TextInputBuilder()
            .setCustomId('suggest_content')
            .setLabel("Sua ideia / Your idea")
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('Descreva sua sugestão detalhadamente...')
            .setMaxLength(1000)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await interaction.showModal(modal);
    }
};