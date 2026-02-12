const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const { client, guild } = interaction;

        // 1. Busca a configuração para saber se está Ativado ou Desativado
        let config = await client.db.ticketConfig.findUnique({ where: { guildId: guild.id } });
        if (!config) {
            config = await client.db.ticketConfig.create({ data: { guildId: guild.id } });
        }

        const statusTranscript = config.sendTranscriptToDM ? '✅ Ativado' : '❌ Desativado';

        const embed = new EmbedBuilder()
            .setTitle('⚙️ Configuração de Tickets (Enterprise)')
            .setDescription(`Gerencie a estética, departamentos e visualize o desempenho da sua equipe.\n\n📩 **Transcript DM:** ${statusTranscript}`)
            .setColor('#2b2d31');

        const row1 = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('ticket_config_select')
                .setPlaceholder('Selecione o que deseja ajustar...')
                .addOptions([
                    { label: 'Definir Aparência', value: 'ticket_ui', emoji: '🖌️' },
                    { label: 'Gerenciar Departamentos', value: 'ticket_deps', emoji: '📂' },
                    { label: 'Configurar Canais/Cargos', value: 'ticket_infra', emoji: '⚙️' },
                    { label: 'Ranking da Staff', value: 'ticket_ranking', emoji: '🏆' }
                ])
        );

        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('publish_ticket_panel')
                .setLabel('Publicar Vitrine')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🚀'),
            
            new ButtonBuilder()
                .setCustomId('back_to_community') // Botão Voltar
                .setLabel('Voltar')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('⬅️'),
              
            new ButtonBuilder()
                .setCustomId('lookup_ticket_btn') 
                .setLabel('Localizar Ticket')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🔍'),

            // --- NOVO BOTÃO DE TOGGLE ---
            new ButtonBuilder()
                .setCustomId('btn_toggle_transcript_dm')
                .setLabel('Transcript DM')
                .setStyle(config.sendTranscriptToDM ? ButtonStyle.Success : ButtonStyle.Secondary)
                .setEmoji('📩')
        );

        // Usa update para manter a mesma mensagem
        await interaction.update({ embeds: [embed], components: [row1, row2] });
    }
};