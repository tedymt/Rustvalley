const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, MessageFlags } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const { guild, client } = interaction;

        // 1. Busca departamentos existentes
        const departments = await client.db.department.findMany({
            where: { guildId: guild.id },
            orderBy: { id: 'asc' }
        });

        // 2. Monta a Lista Visual
        let description = departments.length > 0 
            ? departments.map(d => `**${d.emoji} ${d.name}** (ID: \`${d.id}\`)`).join('\n')
            : '❌ Nenhum departamento criado ainda.';

        const embed = new EmbedBuilder()
            .setTitle('📂 Gerenciar Departamentos')
            .setDescription(description)
            .setColor(departments.length > 0 ? '#5865F2' : '#E74C3C')
            .setFooter({ text: `Total: ${departments.length}/5 (Limite Máximo)` });

        const components = [];

        // 3. Menu de Exclusão (Só aparece se tiver departamentos)
        if (departments.length > 0) {
            const deleteMenu = new ActionRowBuilder().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('menu_delete_dep')
                    .setPlaceholder('🗑️ Selecione para Excluir...')
                    .addOptions(departments.map(d => ({
                        label: d.name,
                        description: `ID: ${d.id} - Clique para remover`,
                        value: d.id.toString(),
                        emoji: '🗑️'
                    })))
            );
            components.push(deleteMenu);
        }

        // 4. Botões de Ação
        const buttons = new ActionRowBuilder();

        // --- TRAVA DE LIMITE (5 DEPARTAMENTOS) ---
        if (departments.length < 5) {
            buttons.addComponents(
                new ButtonBuilder()
                    .setCustomId('btn_create_dep')
                    .setLabel('Novo Departamento')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('➕')
            );
        } else {
            buttons.addComponents(
                new ButtonBuilder()
                    .setCustomId('btn_create_dep_disabled')
                    .setLabel('Limite Atingido (5/5)')
                    .setStyle(ButtonStyle.Secondary) // Cinza
                    .setDisabled(true) // Bloqueado
                    .setEmoji('🚫')
            );
        }

        buttons.addComponents(
            new ButtonBuilder()
                .setCustomId('back_to_tickets')
                .setLabel('Voltar')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('⬅️')
        );
        components.push(buttons);

        // --- 5. LÓGICA DE ENVIO CORRIGIDA ---
        // Se for Botão, Menu OU Modal Submit, usamos update
        if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
            // Se por algum motivo já foi respondido, usa editReply
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ embeds: [embed], components: components, content: null });
            } else {
                await interaction.update({ embeds: [embed], components: components, content: null });
            }
        } else {
            // Se for comando slash, usa reply
            await interaction.reply({ embeds: [embed], components: components, flags: MessageFlags.Ephemeral });
        }
    }
};