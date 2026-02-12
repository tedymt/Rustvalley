const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const { guild, client } = interaction;

        // 1. Busca todos os painéis criados para colocar no Select Menu
        const panels = await client.db.rolePanel.findMany({
            where: { guildId: guild.id },
            orderBy: { id: 'desc' }
        });

        const embed = new EmbedBuilder()
            .setTitle('🎭 Gerenciador de Auto-Role')
            .setDescription('Crie painéis onde usuários clicam para ganhar cargos.\n\n👇 **Selecione um painel abaixo para editar ou excluir.**')
            .setColor('#9B59B6')
            .setFooter({ text: `Total de painéis: ${panels.length}` });

        const components = [];

        // 2. Cria o Menu de Seleção de Painéis (Se houver painéis)
        if (panels.length > 0) {
            const selectPanel = new StringSelectMenuBuilder()
                .setCustomId('select_role_panel') // Vai para o arquivo select_role_panel.js
                .setPlaceholder('📂 Selecione um painel para editar...')
                .addOptions(
                    panels.map(p => ({
                        label: p.title.substring(0, 100),
                        description: `ID: ${p.id} • ${p.description.substring(0, 50)}...`,
                        value: String(p.id),
                        emoji: '📝'
                    }))
                );
            components.push(new ActionRowBuilder().addComponents(selectPanel));
        }

        // 3. Botões de Controle
        const rowButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_create_role_panel')
                .setLabel('Novo Painel')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🆕'),
            
            new ButtonBuilder()
                .setCustomId('module_community')
                .setLabel('Voltar')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('⬅️')
        );
        components.push(rowButtons);

        const payload = { embeds: [embed], components: components, content: null };
        if (interaction.replied || interaction.deferred) await interaction.editReply(payload);
        else await interaction.update(payload);
    }
};