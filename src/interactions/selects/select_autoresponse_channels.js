const moduleAutoResponse = require('../modules/module_auto_response.js');

module.exports = {
    async execute(interaction) {
        // Se vazio, salva null (significa todos ou nenhum, vamos tratar como todos por padrão se quiser, ou limitar)
        // O select retorna array de IDs
        const channels = interaction.values.length > 0 ? interaction.values.join(',') : null;

        await interaction.client.db.guild.update({
            where: { id: interaction.guild.id },
            data: { autoResponseChannels: channels }
        });

        await interaction.update({ content: '✅ Canais atualizados!', components: [] });
        await moduleAutoResponse.execute(interaction);
    }
};