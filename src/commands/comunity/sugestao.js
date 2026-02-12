const { SlashCommandBuilder } = require('discord.js');
const btnHandler = require('../../interactions/buttons/btn_suggest_pt.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('sugestao')
        .setDescription('🇧🇷 Enviar uma sugestão para o servidor.'),
    async execute(interaction) {
        // Reutiliza a lógica do botão que abre o Modal PT
        await btnHandler.execute(interaction);
    },
};