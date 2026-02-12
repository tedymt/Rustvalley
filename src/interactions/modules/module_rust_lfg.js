const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const { guild, client } = interaction;
        const config = await client.db.guild.findUnique({ where: { id: guild.id } });

        const channelPT = config.rustLfgChannelPT ? `<#${config.rustLfgChannelPT}>` : '❌ Não definido';
        const channelEN = config.rustLfgChannelEN ? `<#${config.rustLfgChannelEN}>` : '❌ Not set';
        
        // --- NOVA LINHA: Exibir status do Banner ---
        const bannerStatus = config.rustLfgBanner ? `✅ [Link Configurado](${config.rustLfgBanner})` : '❌ Padrão (Sem imagem)';

        const embed = new EmbedBuilder()
            .setTitle('🤝 Rust Team Finder (LFG)')
            .setDescription('Configure onde os anúncios de "Procuro Grupo" serão postados.\nSepare a comunidade BR da Gringa para organização.')
            .addFields(
                { name: '🇧🇷 Canal PT-BR', value: channelPT, inline: true },
                { name: '🇺🇸 Canal EN-US', value: channelEN, inline: true },
                { name: '🖼️ Banner Vitrine', value: bannerStatus, inline: true } // Campo novo
            )
            .setColor('#E67E22');
        
        // Se tiver banner configurado, mostra na embed de setup também
        if (config.rustLfgBanner) {
            embed.setThumbnail(config.rustLfgBanner);
        }

        // Seletores de Canal (MANTIDOS)
        const rowPT = new ActionRowBuilder().addComponents(
            new ChannelSelectMenuBuilder()
                .setCustomId('setup_rust_lfg_pt')
                .setPlaceholder('🇧🇷 Selecione o canal de posts BR...')
                .setChannelTypes(ChannelType.GuildText)
        );

        const rowEN = new ActionRowBuilder().addComponents(
            new ChannelSelectMenuBuilder()
                .setCustomId('setup_rust_lfg_en')
                .setPlaceholder('🇺🇸 Select the EN posts channel...')
                .setChannelTypes(ChannelType.GuildText)
        );

        // Botões (ATUALIZADO COM O BOTÃO DE BANNER)
        const rowBtns = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_publish_lfg_interface')
                .setLabel('Publicar Interface / Publish UI')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🚀'),
            
            // --- NOVO BOTÃO DE BANNER ---
            new ButtonBuilder()
                .setCustomId('btn_lfg_banner')
                .setLabel('Definir Banner')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🖼️'),
            // -----------------------------

            new ButtonBuilder()
                .setCustomId('module_rust_btn') // Voltar para o painel Rust
                .setLabel('Voltar / Back')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('⬅️')
        );

        // Verifica se é reply ou update para evitar erros
        if (interaction.replied || interaction.deferred) {
            await interaction.editReply({ embeds: [embed], components: [rowPT, rowEN, rowBtns], content: null });
        } else {
            await interaction.update({ embeds: [embed], components: [rowPT, rowEN, rowBtns], content: null });
        }
    }
};