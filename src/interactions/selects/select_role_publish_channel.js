const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const channelId = interaction.values[0];
        const channel = interaction.guild.channels.cache.get(channelId);
        
        // Busca o último painel configurado no banco
        // (Assumindo que você tenha salvo em 'rolePanel' como fizemos nos passos anteriores)
        const panel = await interaction.client.db.rolePanel.findFirst({
            where: { guildId: interaction.guild.id },
            include: { options: true }, // Inclui as opções de cargo
            orderBy: { id: 'desc' } // Pega o mais recente
        });

        if (!panel || panel.options.length === 0) {
            return interaction.update({ content: '❌ Nenhum painel/cargo configurado. Crie um primeiro!', components: [] });
        }

        const embed = new EmbedBuilder()
            .setTitle(panel.title || '🎭 Escolha seus Cargos / Choose Roles')
            .setDescription(panel.description || 'Clique nos botões abaixo para pegar seus cargos.\nClick below to get your roles.')
            .setColor('#2F3136')
            .setFooter({ text: 'Atualizado em tempo real • Live updated' });

        if (panel.imageUrl) embed.setImage(panel.imageUrl);

        // --- CONSTRUÇÃO DOS BOTÕES COM CONTADOR ---
        const rows = [];
        let currentRow = new ActionRowBuilder();

        // Ordena as opções se necessário
        const options = panel.options; 

        for (let i = 0; i < options.length; i++) {
            const opt = options[i];
            
            // Busca o cargo para contar membros
            const role = interaction.guild.roles.cache.get(opt.roleId);
            const count = role ? role.members.size : 0;

            const btn = new ButtonBuilder()
                .setCustomId(`btn_role_toggle_${opt.roleId}`) 
                .setLabel(`${opt.label} (${count})`) // NOME (CONTADOR)
                .setStyle(ButtonStyle.Secondary) 
                .setEmoji(opt.emoji || '🎭');

            currentRow.addComponents(btn);

            // Limite de 5 botões por linha (Regra do Discord)
            if (currentRow.components.length === 5 || i === options.length - 1) {
                rows.push(currentRow);
                currentRow = new ActionRowBuilder();
            }
        }

        await channel.send({ embeds: [embed], components: rows });
        await interaction.update({ content: `✅ Painel enviado para ${channel}!`, components: [] });
    }
};