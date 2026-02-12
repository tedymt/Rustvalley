const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const serverId = interaction.customId.split('_').pop();
        
        const modal = new ModalBuilder()
            .setCustomId(`modal_rust_msg_${serverId}`)
            .setTitle('Mensagem de Wipe Personalizada');

        const input = new TextInputBuilder()
            .setCustomId('msg_content')
            .setLabel("Mensagem (Use {connect} para o IP)")
            .setPlaceholder("Ex: ⚠️ O SERVIDOR WIPOU! Entre agora: {connect}")
            .setStyle(TextInputStyle.Paragraph)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(input));
        await interaction.showModal(modal);
    }
};