const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('modal_mapvote')
            .setTitle('Nova Votação / New Map Vote');

        // Campos de URL (Links das imagens)
        const urlA = new TextInputBuilder().setCustomId('map_a_url').setLabel("Link Imagem A").setStyle(TextInputStyle.Short).setRequired(true);
        const urlB = new TextInputBuilder().setCustomId('map_b_url').setLabel("Link Imagem B").setStyle(TextInputStyle.Short).setRequired(true);
        const urlC = new TextInputBuilder().setCustomId('map_c_url').setLabel("Link Imagem C (Opcional)").setStyle(TextInputStyle.Short).setRequired(false);

        // Campo de Nomes Unificado (Para economizar espaço no modal)
        const names = new TextInputBuilder()
            .setCustomId('map_names')
            .setLabel("Nomes (Separe por vírgula)")
            .setPlaceholder("Ex: Procedural, Barren, Hapis Island")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(urlA),
            new ActionRowBuilder().addComponents(urlB),
            new ActionRowBuilder().addComponents(urlC),
            new ActionRowBuilder().addComponents(names)
        );

        await interaction.showModal(modal);
    }
};