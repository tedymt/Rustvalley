const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    async execute(interaction) {
        // 1. Coleta os dados (Adicionamos description aqui)
        const prize = interaction.fields.getTextInputValue('prize');
        const durationStr = interaction.fields.getTextInputValue('duration').toLowerCase();
        const winners = parseInt(interaction.fields.getTextInputValue('winners')) || 1;
        // Se o campo descrição não existir no modal antigo, usamos um padrão.
        // Se você já atualizou o btn_create_giveaway para ter o campo, ele pega o valor.
        let description = '';
        try {
            description = interaction.fields.getTextInputValue('description');
        } catch (e) {
            description = `🇧🇷 Clique no botão abaixo para participar!\n🇺🇸 Click the button below to join!`;
        }

        // 2. Lógica de Tempo Original (Funcional)
        const match = durationStr.match(/^(\d+)([mhd])$/);
        if (!match) return interaction.reply({ content: '❌ Formato inválido! Use: `10m`, `2h`, `1d`.', ephemeral: true });

        const value = parseInt(match[1]);
        const unit = match[2];
        let ms = 0;
        if (unit === 'm') ms = value * 60 * 1000;
        if (unit === 'h') ms = value * 60 * 60 * 1000;
        if (unit === 'd') ms = value * 24 * 60 * 60 * 1000;

        const endTime = new Date(Date.now() + ms);

        // 3. Monta a Embed (Incluindo a descrição se ela foi personalizada)
        const embed = new EmbedBuilder()
            .setTitle(`🎁 SORTEIO/GIVEAWAY: ${prize}`)
            .setDescription(description || `**${prize}**`)
            .addFields(
                { name: '🏆 Ganhadores / Winners', value: `\`${winners}\``, inline: true },
                { name: '⏳ Termina em / Ends in', value: `<t:${Math.floor(endTime.getTime()/1000)}:R>`, inline: true },
                { name: '👥 Participantes / Entries', value: '`0`', inline: true }
            )
            .setColor('#F1C40F')
            .setFooter({ text: 'Rustvalley Manager • Good Luck!' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_join_giveaway')
                .setLabel('Participar / Join')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🎉'),
            
            // BOTÃO DE ENGRENAGEM (Admin Control)
            new ButtonBuilder()
                .setCustomId(`btn_admin_gw_control`)
                .setLabel('Admin')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('⚙️')
        );

        const msg = await interaction.channel.send({ embeds: [embed], components: [row] });

        // 4. Salva no Banco (AGORA COM DESCRIPTION)
        // O create vai funcionar porque você já rodou o 'npx prisma db push' com o campo novo
        const gw = await interaction.client.db.giveaway.create({
            data: {
                guildId: interaction.guild.id,
                channelId: interaction.channel.id,
                messageId: msg.id,
                prize,
                description: description, // <--- O PULO DO GATO (Salva para poder editar depois)
                winners,
                endTime,
                hostId: interaction.user.id
            }
        });
        
        // Pequeno update para colocar o ID no footer (bom para debug)
        const embedWithId = EmbedBuilder.from(embed).setFooter({ text: `ID: ${gw.id} • Rustvalley Manager` });
        await msg.edit({ embeds: [embedWithId] });

        await interaction.reply({ content: '✅ Sorteio publicado com sucesso!', ephemeral: true });
    }
};