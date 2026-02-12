const { SlashCommandBuilder } = require('discord.js');
const btnHandler = require('../../interactions/buttons/btn_suggest_en.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('suggestion')
        .setDescription('🇺🇸 Submit a suggestion to the server.'),
    async execute(interaction) {
        // Reutiliza a lógica do botão que abre o Modal EN
        await btnHandler.execute(interaction);
    },
};