const moduleDeps = require('../modules/ticket_deps.js');

module.exports = {
    async execute(interaction) {
        const name = interaction.fields.getTextInputValue('dep_name');
        const emoji = interaction.fields.getTextInputValue('dep_emoji') || '🎫';

        await interaction.client.db.department.create({
            data: {
                guildId: interaction.guild.id,
                name: name,
                emoji: emoji
            }
        });

        // CORREÇÃO: Não fazemos update aqui.
        // Chamamos direto o painel, que agora sabe lidar com o ModalSubmit
        await moduleDeps.execute(interaction);
    }
};