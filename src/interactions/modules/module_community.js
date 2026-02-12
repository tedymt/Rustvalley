const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🏙️ Central da Comunidade / Community Center')
            .setDescription('🇧🇷 Gerencie todos os aspectos sociais do seu servidor em um único lugar.\n🇺🇸 Manage all social aspects of your server in one place.')
            .addFields(
                { name: '👋 Boas-Vindas (Welcome)', value: 'Mensagens de entrada e saída.', inline: true },
                { name: '📢 Anúncios (Broadcast)', value: 'Agendamento de mensagens.', inline: true }, // <--- ADICIONADO
                { name: '💡 Sugestões (Suggestions)', value: 'Votação e feedback visual.', inline: true },
                { name: '🛡️ Segurança (Security)', value: 'Anti-Spam, Filtros e Logs.', inline: true },
                { name: '🎭 Cargos (Roles)', value: 'Painéis de reação/botão.', inline: true },
                { name: '🤖 Auto-Res (AI)', value: 'Respostas automáticas no chat.', inline: true },
                { name: '🎉 Sorteios (Giveaways)', value: 'Crie e gerencie sorteios.', inline: true },
                { name: '🎫 Tickets (Support)', value: 'Painéis de atendimento.', inline: true }
            )
            .setColor('#2ECC71')
            .setThumbnail('https://cdn-icons-png.flaticon.com/512/476/476863.png')
            .setFooter({ text: 'Selecione uma categoria abaixo / Select a category below' });

        // MENU UNIFICADO (CLEAN)
        const select = new StringSelectMenuBuilder()
            .setCustomId('select_community_feature')
            .setPlaceholder('👇 Escolha um módulo para configurar...')
            .addOptions([
                { label: 'Boas-Vindas / Welcome', value: 'module_welcome', emoji: '👋', description: 'Configure mensagens de entrada/saída.' },
                { label: 'Anúncios / Announcements', value: 'module_announcements', emoji: '📢', description: 'Agende anúncios únicos ou recorrentes.' }, // <--- ADICIONADO
                { label: 'Sugestões / Suggestions', value: 'module_suggestions', emoji: '💡', description: 'Sistema de sugestões com votação.' },
                { label: 'Segurança / Security', value: 'module_security', emoji: '🛡️', description: 'Anti-Link, Anti-Toxic, Logs.' },
                { label: 'Cargos / Reaction Roles', value: 'module_roles_btn', emoji: '🎭', description: 'Auto-Roles por menu interativo.' },
                { label: 'Respostas Auto / Auto-Res', value: 'module_auto_response_btn', emoji: '🤖', description: 'Gatilhos de texto automáticos.' },
                { label: 'Sorteios / Giveaways', value: 'module_giveaway', emoji: '🎉', description: 'Iniciar sorteios e prêmios.' },
                { label: 'Votação de Mapas / MapVote', value: 'module_mapvote', emoji: '🗺️', description: 'Crie enquetes de mapas com imagens.' },
                { label: 'Tickets / Support', value: 'module_tickets', emoji: '🎫', description: 'Configurar painéis e suporte.' }
            ]);

        const rowSelect = new ActionRowBuilder().addComponents(select);

        const rowBack = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('back_to_main')
                .setLabel('Voltar ao Início')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🏠')
        );

        if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ embeds: [embed], components: [rowSelect, rowBack], content: null });
            } else {
                await interaction.update({ embeds: [embed], components: [rowSelect, rowBack], content: null });
            }
        } else {
            await interaction.reply({ embeds: [embed], components: [rowSelect, rowBack], flags: MessageFlags.Ephemeral });
        }
    }
};