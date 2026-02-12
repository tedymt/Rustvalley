const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const isPT = interaction.customId.includes('pt');
        const lang = isPT ? 'PT' : 'EN';

        const modal = new ModalBuilder()
            .setCustomId(`modal_lfg_submit_${lang}`)
            .setTitle(isPT ? 'Ficha de Jogador' : 'Player Card');

        // Pergunta 1: Horas de Jogo
        const hoursInput = new TextInputBuilder()
            .setCustomId('lfg_hours')
            .setLabel(isPT ? 'Horas de Rust' : 'Rust Hours')
            .setPlaceholder(isPT ? 'Ex: 2.5k horas' : 'Ex: 2.5k hours')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        // Pergunta 2: Idade
        const ageInput = new TextInputBuilder()
            .setCustomId('lfg_age')
            .setLabel(isPT ? 'Idade' : 'Age')
            .setPlaceholder('Ex: 18')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        // Pergunta 3: Função
        const roleInput = new TextInputBuilder()
            .setCustomId('lfg_role')
            .setLabel(isPT ? 'Estilo / Função' : 'Playstyle / Role')
            .setPlaceholder(isPT ? 'Ex: Builder, PvP, Farmer' : 'Ex: Builder, PvPer, Farmer')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        // Pergunta 4: Descrição
        const descInput = new TextInputBuilder()
            .setCustomId('lfg_desc')
            .setLabel(isPT ? 'Sobre você / O que procura?' : 'About you / Looking for?')
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(300)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(hoursInput),
            new ActionRowBuilder().addComponents(ageInput),
            new ActionRowBuilder().addComponents(roleInput),
            new ActionRowBuilder().addComponents(descInput)
        );

        await interaction.showModal(modal);
    }
};