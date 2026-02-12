const { ActionRowBuilder, StringSelectMenuBuilder, MessageFlags } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const panelId = parseInt(interaction.customId.split('_').pop());
        const selectedRoleIds = interaction.values; // Apenas o que o usuário clicou nesta vez
        const member = interaction.member;

        // 1. Busca dados do painel no banco (apenas para reconstruir o menu depois)
        const panel = await interaction.client.db.rolePanel.findUnique({
            where: { id: panelId },
            include: { options: true }
        });

        if (!panel) {
            return interaction.reply({ 
                content: '❌ **Erro:** Painel não encontrado. / **Error:** Panel not found.', 
                flags: MessageFlags.Ephemeral 
            });
        }

        const added = [];
        const removed = [];

        // 2. Lógica de TOGGLE (Interruptor)
        // O bot só mexe no que foi selecionado. O resto é ignorado.
        for (const roleId of selectedRoleIds) {
            if (member.roles.cache.has(roleId)) {
                // Se já tem -> REMOVE
                await member.roles.remove(roleId).catch(() => {});
                removed.push(roleId);
            } else {
                // Se não tem -> ADICIONA
                await member.roles.add(roleId).catch(() => {});
                added.push(roleId);
            }
        }

        // 3. Monta a Mensagem de Feedback (Bilingue e Clara)
        let msg = '';

        if (added.length > 0) {
            msg += `✅ **Adicionado / Added:** ${added.map(r => `<@&${r}>`).join(', ')}\n`;
        }

        if (removed.length > 0) {
            msg += `🗑️ **Removido / Removed:** ${removed.map(r => `<@&${r}>`).join(', ')}\n`;
        }

        if (!msg) {
            msg = "ℹ️ **Nenhuma alteração detectada. / No changes detected.**";
        }

        // 4. RECONSTRÓI O MENU (Reset visual obrigatório)
        // Precisamos reenviar o componente "limpo" para destravar a seleção do Discord
        const select = new StringSelectMenuBuilder()
            .setCustomId(`public_role_panel_${panel.id}`)
            .setPlaceholder('👇 Clique (Add/Remover) / Click to Toggle')
            .setMinValues(0)
            .setMaxValues(panel.options.length);

        select.addOptions(panel.options.map(opt => ({
            label: opt.label,
            value: opt.roleId,
            emoji: opt.emoji,
            default: false // Garante que o menu volta limpo
        })));

        const row = new ActionRowBuilder().addComponents(select);

        // 5. ATUALIZA A MENSAGEM PÚBLICA (Reseta o Menu)
        await interaction.update({
            embeds: interaction.message.embeds, 
            components: [row]
        });

        // 6. ENVIA O FEEDBACK OCULTO
        await interaction.followUp({
            content: msg,
            flags: MessageFlags.Ephemeral
        });
    }
};