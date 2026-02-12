const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const { guild, client } = interaction;
        const config = await client.db.guild.upsert({
            where: { id: guild.id },
            update: {},
            create: { id: guild.id }
        });

        const ptStatus = config.suggestionChannelPT ? `<#${config.suggestionChannelPT}>` : '❌ Off';
        const enStatus = config.suggestionChannelEN ? `<#${config.suggestionChannelEN}>` : '❌ Off';
        const bannerStatus = config.suggestionBanner ? '✅ Custom' : '⚠️ Padrão/Default';

        const embed = new EmbedBuilder()
            .setTitle('💡 Configuração de Sugestões / Suggestions Config')
            .setDescription('Gerencie canais de sugestão e a aparência da vitrine.')
            .addFields(
                { name: '🇧🇷 Canal PT-BR', value: ptStatus, inline: true },
                { name: '🇺🇸 Canal EN-US', value: enStatus, inline: true },
                { name: '🖼️ Banner', value: bannerStatus, inline: true }
            )
            .setColor('#F1C40F');

        if (config.suggestionBanner) {
            embed.setImage(config.suggestionBanner);
        }

        // Seletores de Canal
        const rowSelects = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('suggestion_channel_setup_menu')
                .setPlaceholder('📢 Configurar Canais...')
                .addOptions([
                    { label: 'Definir Canal PT-BR', value: 'setup_suggestion_pt', emoji: '🇧🇷' },
                    { label: 'Definir Canal EN-US', value: 'setup_suggestion_en', emoji: '🇺🇸' }
                ])
        );

        // Botões de Ação
        const rowButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_set_suggestion_banner') // <--- NOVO
                .setLabel('Definir Banner')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🖼️'),
            
            new ButtonBuilder()
                .setCustomId('btn_publish_suggestion_panel') // <--- NOVO
                .setLabel('Enviar Vitrine / Publish UI')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🚀'),

            new ButtonBuilder()
                .setCustomId('module_community')
                .setLabel('Voltar')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('⬅️')
        );

        // Ajuste de envio
        const payload = { embeds: [embed], components: [rowSelects, rowButtons], content: null };
        if (interaction.replied || interaction.deferred) await interaction.editReply(payload);
        else await interaction.update(payload);
    }
};