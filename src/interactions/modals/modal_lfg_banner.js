module.exports = {
    async execute(interaction) {
        const url = interaction.fields.getTextInputValue('url');
        const { client, guild } = interaction;

        // Validação simples de URL (opcional, mas recomendada)
        if (url && !url.startsWith('http')) {
            return interaction.reply({ content: '❌ URL inválida. Use um link direto (https://...).', ephemeral: true });
        }

        await client.db.guild.update({
            where: { id: guild.id },
            data: { rustLfgBanner: url || null } // Se vazio, salva null (remove)
        });

        // Recarrega o módulo para mostrar a atualização
        const moduleLfg = require('../modules/module_rust_lfg.js');
        await moduleLfg.execute(interaction);
    }
};