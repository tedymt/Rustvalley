const moduleDeps = require('../modules/ticket_deps.js');

module.exports = {
    async execute(interaction) {
        const depId = parseInt(interaction.values[0]);

        try {
            await interaction.client.db.department.delete({
                where: { id: depId }
            });

            // Recarrega o painel de departamentos atualizado
            await moduleDeps.execute(interaction);

        } catch (error) {
            console.error(error);
            await interaction.reply({ 
                content: '❌ Erro ao excluir departamento (Talvez ele já tenha sido removido).', 
                ephemeral: true 
            });
        }
    }
};