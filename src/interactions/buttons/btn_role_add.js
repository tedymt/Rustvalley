const { ActionRowBuilder, RoleSelectMenuBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        // O ID vem como: btn_role_add_15 (15 é o ID do painel)
        const panelId = interaction.customId.split('_').pop();

        // Validação de segurança
        if (!panelId || isNaN(panelId)) {
            return interaction.reply({ content: '❌ Erro: ID do painel inválido.', ephemeral: true });
        }

        // Cria o seletor de cargos do Discord
        const select = new RoleSelectMenuBuilder()
            // AQUI ESTÁ O SEGREDO: Passamos o panelId no ID do select
            .setCustomId(`select_role_add_handler_${panelId}`) 
            .setPlaceholder('Selecione o cargo para adicionar ao painel');

        const row = new ActionRowBuilder().addComponents(select);

        await interaction.reply({ 
            content: '👇 **Selecione qual cargo** você quer adicionar neste painel:', 
            components: [row], 
            ephemeral: true 
        });
    }
};