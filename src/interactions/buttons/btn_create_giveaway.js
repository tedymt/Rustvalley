const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('modal_create_giveaway')
            .setTitle('Novo Sorteio 🎉');

        const prizeInput = new TextInputBuilder()
            .setCustomId('prize')
            .setLabel("Prêmio/Prize")
            .setPlaceholder("Ex: VIP, Skin Rust, Nitro")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const durationInput = new TextInputBuilder()
            .setCustomId('duration')
            .setLabel("Duração (m=min, h=horas, d=dias)")
            .setPlaceholder("Ex: 10m, 2h, 1d")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const winnersInput = new TextInputBuilder()
            .setCustomId('winners')
            .setLabel("Número de Ganhadores")
            .setValue("1")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(prizeInput),
            new ActionRowBuilder().addComponents(durationInput),
            new ActionRowBuilder().addComponents(winnersInput)
        );

        await interaction.showModal(modal);
    }
};