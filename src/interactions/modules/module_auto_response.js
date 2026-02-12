const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType, MessageFlags } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const { guild, client } = interaction;

        const config = await client.db.guild.upsert({
            where: { id: guild.id },
            update: {},
            create: { id: guild.id }
        });

        const responses = await client.db.autoResponse.findMany({
            where: { guildId: guild.id }
        });

        const allowedChannels = config.autoResponseChannels 
            ? config.autoResponseChannels.split(',').map(id => `<#${id}>`).join(', ') 
            : '🌍 Todos os canais';

        // Status Visual
        const statusIcon = config.autoResponseEnabled ? '✅ Ativo' : '🔴 Desativado';
        const statusColor = config.autoResponseEnabled ? '#2ECC71' : '#95A5A6';

        const embed = new EmbedBuilder()
            .setTitle('🤖 Respostas Automáticas / Auto-Responder')
            .setDescription(`**Status do Sistema:** ${statusIcon}`)
            .addFields(
                { name: '📢 Canais Permitidos', value: allowedChannels, inline: false },
                { name: '💬 Gatilhos Ativos', value: `\`${responses.length}\` respostas configuradas.`, inline: false }
            )
            .setColor(statusColor)
            .setFooter({ text: 'Koda Manager • Automation' });

        if (responses.length > 0) {
            const list = responses.slice(0, 10).map(r => `• **${r.trigger}**: ${r.responsePT.substring(0, 20)}...`).join('\n');
            embed.addFields({ name: 'Lista Rápida (Top 10)', value: list });
        }

        const components = [];

        // 1. Configurar Canais
        const rowChannels = new ActionRowBuilder().addComponents(
            new ChannelSelectMenuBuilder()
                .setCustomId('select_autoresponse_channels')
                .setPlaceholder('📢 Selecione os canais permitidos (Vazio = Todos)')
                .setChannelTypes(ChannelType.GuildText)
                .setMinValues(0)
                .setMaxValues(10)
        );
        components.push(rowChannels);

        // 2. Botões de Ação
        const rowButtons = new ActionRowBuilder().addComponents(
            // BOTÃO TOGGLE NOVO
            new ButtonBuilder()
                .setCustomId('btn_toggle_autoresponse')
                .setLabel(config.autoResponseEnabled ? 'Desativar Sistema' : 'Ativar Sistema')
                .setStyle(config.autoResponseEnabled ? ButtonStyle.Secondary : ButtonStyle.Success)
                .setEmoji(config.autoResponseEnabled ? '⏹️' : '▶️'),

            new ButtonBuilder()
                .setCustomId('btn_create_response')
                .setLabel('Nova Resposta')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('➕'),
            
            new ButtonBuilder()
                .setCustomId('btn_delete_response')
                .setLabel('Excluir')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🗑️')
                .setDisabled(responses.length === 0)
        );
        components.push(rowButtons);

        // Botão Voltar separado
        const rowBack = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('module_community')
                .setLabel('Voltar')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('⬅️')
        );
        components.push(rowBack);

        if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
            if (interaction.replied || interaction.deferred) await interaction.editReply({ embeds: [embed], components: components, content: null });
            else await interaction.update({ embeds: [embed], components: components, content: null });
        } else {
            await interaction.reply({ embeds: [embed], components: components, flags: MessageFlags.Ephemeral });
        }
    }
};