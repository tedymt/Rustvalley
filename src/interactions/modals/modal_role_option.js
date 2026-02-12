const selectRolePanel = require('../selects/select_role_panel.js');

module.exports = {
    async execute(interaction) {
        // CustomID: modal_role_option_PANELID_ROLEID
        const parts = interaction.customId.split('_');
        
        // Índices: [0]modal [1]role [2]option [3]PANEL_ID [4]ROLE_ID
        const panelId = parseInt(parts[3]);
        const roleId = parts[4];

        if (isNaN(panelId)) {
            return interaction.reply({ content: '❌ Erro crítico: ID do Painel inválido (NaN).', ephemeral: true });
        }

        const label = interaction.fields.getTextInputValue('label');
        const emoji = interaction.fields.getTextInputValue('emoji');

        try {
            // 1. Salva no Banco
            await interaction.client.db.roleOption.create({
                data: {
                    panelId: panelId,
                    roleId: roleId,
                    label: label,
                    emoji: emoji
                }
            });

            // 2. Atualiza a tela (Sem deferUpdate e sem message.edit)
            // Criamos um fakeInteraction que redireciona o 'update' para o interaction.update real do modal
            const fakeInteraction = {
                client: interaction.client,
                values: [String(panelId)], // Simula que selecionamos o painel 15
                guild: interaction.guild,
                
                // O PULO DO GATO: Usamos interaction.update() direto
                update: async (payload) => {
                    // Adicionamos um feedback visual no topo da mensagem
                    payload.content = `✅ **Sucesso!** Cargo **${label}** adicionado ao painel.`;
                    // payload.components e embeds vêm do select_role_panel
                    await interaction.update(payload); 
                }
            };

            // Chama o visualizador de painel para gerar o HTML (Embeds/Buttons) novos
            await selectRolePanel.execute(fakeInteraction);

        } catch (error) {
            console.error(error);
            if (!interaction.replied) {
                await interaction.reply({ content: '❌ Erro ao salvar no banco de dados.', ephemeral: true });
            }
        }
    }
};