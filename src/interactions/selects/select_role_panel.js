const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        // Se vier de um modal ou update, values pode não estar direto, tratamos isso
        // O select envia array, mas nossos updates manuais enviam string as vezes
        let panelId;
        if (interaction.values && interaction.values.length > 0) {
            panelId = parseInt(interaction.values[0]);
        } else if (interaction.customId) {
            // Fallback se chamarmos manualmente
            // ... (lógica existente ou simplificada)
        }
        
        // Se a gente estiver vindo do Modal de Banner, o panelId pode estar escondido
        // Vamos padronizar: quem chama esse arquivo deve garantir que consegue passar o ID
        // Vou usar a lógica robusta:
        
        if (!panelId && interaction.message) {
             // Tenta pegar do footer ou descrição se não vier do select (caso de refresh)
             // Mas o jeito certo é quem chama passar.
             // Vou assumir que quem chama via 'fakeInteraction' (como no modal) passa 'values'
        }

        const panel = await interaction.client.db.rolePanel.findUnique({
            where: { id: panelId },
            include: { options: true }
        });

        if (!panel) return interaction.reply({ content: '❌ Painel não encontrado.', ephemeral: true });

        // Lista de Cargos
        const rolesList = panel.options.length > 0
            ? panel.options.map(o => `${o.emoji} **${o.label}** (<@&${o.roleId}>)`).join('\n')
            : '⚠️ Nenhum cargo adicionado ainda.';

        const embed = new EmbedBuilder()
            .setTitle(`⚙️ Editando: ${panel.title}`)
            .setDescription(`${panel.description}\n\n**Cargos Configurados:**\n${rolesList}`)
            .setColor('#9B59B6')
            .addFields(
                { name: '📍 Status', value: panel.channelId ? `Publicado em <#${panel.channelId}>` : '🔴 Não publicado', inline: true },
                { name: '🖼️ Banner', value: panel.imageUrl ? '[Link da Imagem](Check)' : 'Nenhum', inline: true }
            );

        if (panel.imageUrl) embed.setImage(panel.imageUrl); // Mostra preview do banner aqui também

        // Botões de Ação (Max 5 por linha)
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`btn_role_add_${panel.id}`).setLabel('Add Cargo').setStyle(ButtonStyle.Primary).setEmoji('➕'),
            new ButtonBuilder().setCustomId(`btn_role_edit_text_${panel.id}`).setLabel('Editar Texto').setStyle(ButtonStyle.Secondary).setEmoji('📝'),
            // BOTÃO NOVO AQUI 👇
            new ButtonBuilder().setCustomId(`btn_role_set_banner_${panel.id}`).setLabel('Banner').setStyle(ButtonStyle.Secondary).setEmoji('🖼️'),
            
            new ButtonBuilder().setCustomId(`btn_role_publish_${panel.id}`).setLabel('Publicar').setStyle(ButtonStyle.Success).setEmoji('🚀'),
            new ButtonBuilder().setCustomId(`btn_role_delete_${panel.id}`).setLabel('Excluir').setStyle(ButtonStyle.Danger).setEmoji('🗑️')
        );

        const rowBack = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('module_roles_btn').setLabel('Voltar Lista').setStyle(ButtonStyle.Secondary).setEmoji('⬅️')
        );

        // Se for resposta inicial ou update
        if (interaction.replied || interaction.deferred) await interaction.editReply({ embeds: [embed], components: [row, rowBack] });
        else await interaction.update({ embeds: [embed], components: [row, rowBack] });
    }
};