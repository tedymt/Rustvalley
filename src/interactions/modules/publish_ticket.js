const { 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    MessageFlags
} = require('discord.js');

module.exports = {
    async execute(interaction) {
        if (!interaction.isStringSelectMenu()) return;

        const targetChannelId = interaction.values[0];
        const targetChannel = interaction.guild.channels.cache.get(targetChannelId);

        if (!targetChannel) {
            return interaction.reply({ 
                content: '❌ Canal inválido ou não encontrado. / Invalid channel.', 
                flags: MessageFlags.Ephemeral 
            });
        }

        try {
            const config = await interaction.client.db.ticketConfig.findUnique({ 
                where: { guildId: interaction.guild.id } 
            });
            
            const departments = await interaction.client.db.department.findMany({ 
                where: { guildId: interaction.guild.id } 
            });

            // --- LÓGICA DE OVERRIDE (FORÇA BRUTA) ---
            // Se o banco tiver os textos antigos, substituímos pelos novos Bilingues
            
            let title = config?.title;
            let description = config?.description;
            let footer = config?.footer;

            // Lista de textos "padrão antigo" para ignorar
            const oldDefaults = [
                'Suporte', 
                'Central de Atendimento', 
                'Clique abaixo para abrir um ticket',
                'Clique no botão do departamento desejado para abrir um ticket.',
                'Koda Studios'
            ];

            // Se o título for vazio OU for um dos antigos, usa o novo
            if (!title || oldDefaults.includes(title)) {
                title = 'Central de Atendimento / Support Center';
            }

            // Se a descrição for vazia OU for uma das antigas, usa a nova
            if (!description || oldDefaults.includes(description)) {
                description = '🇧🇷 **Olá! Como podemos ajudar?**\n' +
                    'Selecione abaixo o departamento que melhor se encaixa na sua necessidade.\n\n' +
                    '🇺🇸 **Hello! How can we help?**\n' +
                    'Select the department below that best fits your needs.';
            }

            // Se o footer for vazio OU for o antigo, usa o novo
            if (!footer || oldDefaults.includes(footer)) {
                footer = 'Koda Manager • Enterprise System';
            }

            // --- MONTA A VITRINE ---
            const embed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .setColor(config?.color || '#5865F2')
                .setThumbnail(interaction.guild.iconURL({ dynamic: true, size: 512 }))
                .setImage(config?.banner || null)
                .setFooter({ text: footer });

            // --- BOTÕES ---
            const rows = [];
            let currentRow = new ActionRowBuilder();

            if (departments.length > 0) {
                departments.forEach((dep, index) => {
                    const btn = new ButtonBuilder()
                        .setCustomId(`open_ticket_${dep.id}`)
                        .setLabel(dep.name)
                        .setStyle(ButtonStyle.Secondary)
                        .setEmoji(dep.emoji || '🎫');

                    currentRow.addComponents(btn);

                    if ((index + 1) % 5 === 0) {
                        rows.push(currentRow);
                        currentRow = new ActionRowBuilder();
                    }
                });
                if (currentRow.components.length > 0) rows.push(currentRow);
            } else {
                currentRow.addComponents(
                    new ButtonBuilder()
                        .setCustomId('open_ticket_general')
                        .setLabel('Abrir Ticket / Open Ticket')
                        .setStyle(ButtonStyle.Success)
                        .setEmoji('🎫')
                );
                rows.push(currentRow);
            }

            await targetChannel.send({ embeds: [embed], components: rows });
            
            await interaction.reply({ 
                content: `✅ **Vitrine publicada com sucesso!**`, 
                flags: MessageFlags.Ephemeral 
            });

        } catch (error) {
            console.error('[PUBLISH ERROR]', error);
            await interaction.reply({ content: '❌ Erro ao publicar vitrine.', flags: MessageFlags.Ephemeral });
        }
    }
};