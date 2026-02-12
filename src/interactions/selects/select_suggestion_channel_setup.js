const setupPT = require('./setup_suggestion_pt.js');
const setupEN = require('./setup_suggestion_en.js');

module.exports = {
    async execute(interaction) {
        // O valor vem como ['setup_suggestion_pt'] ou ['setup_suggestion_en']
        const choice = interaction.values[0];

        if (choice === 'setup_suggestion_pt') {
            await setupPT.execute(interaction);
        } else if (choice === 'setup_suggestion_en') {
            await setupEN.execute(interaction);
        } else {
            await interaction.reply({ content: '❌ Opção inválida.', ephemeral: true });
        }
    }
};