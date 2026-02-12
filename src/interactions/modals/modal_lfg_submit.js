const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    async execute(interaction) {
        // Detecta idioma baseado no ID do modal (PT ou EN)
        const isPT = interaction.customId.endsWith('PT');
        const { guild, client, user } = interaction;

        const hours = interaction.fields.getTextInputValue('lfg_hours');
        const age = interaction.fields.getTextInputValue('lfg_age');
        const role = interaction.fields.getTextInputValue('lfg_role');
        const desc = interaction.fields.getTextInputValue('lfg_desc');

        // Busca configuração
        const config = await client.db.guild.findUnique({ where: { id: guild.id } });
        const targetChannelId = isPT ? config.rustLfgChannelPT : config.rustLfgChannelEN;

        if (!targetChannelId) {
            return interaction.reply({ 
                content: isPT ? '❌ Canal LFG não configurado.' : '❌ LFG Channel not set.', 
                ephemeral: true 
            });
        }

        const channel = guild.channels.cache.get(targetChannelId);
        if (!channel) return interaction.reply({ content: '❌ Channel Error.', ephemeral: true });

        // --- TRADUÇÃO DOS CAMPOS ---
        const labelTitle = isPT ? '🔍 Procurando Time' : '🔍 Looking for Team';
        const labelHours = isPT ? '🕒 Horas' : '🕒 Hours';
        const labelAge = isPT ? '👤 Idade' : '👤 Age';
        const labelRole = isPT ? '🔫 Função' : '🔫 Role';
        const labelDesc = isPT ? '📝 Sobre' : '📝 About';
        
        // Monta o Card
        const embed = new EmbedBuilder()
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
            .setTitle(labelTitle)
            .setDescription(`**${labelDesc}:**\n\`\`\`${desc}\`\`\``)
            .addFields(
                { name: labelHours, value: hours, inline: true },
                { name: labelAge, value: age, inline: true },
                { name: labelRole, value: role, inline: true }
            )
            .setColor(isPT ? '#2ECC71' : '#3498DB')
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setFooter({ text: `Koda LFG • User ID: ${user.id}` }) // ID visível apenas para debug visual
            .setTimestamp();

        // --- BOTÃO DE CONEXÃO ---
        // O ID do dono do post vai "escondido" no customId do botão
        const btnRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`btn_lfg_connect_${user.id}`) // Passamos o ID do dono aqui
                .setLabel(isPT ? '📩 Chamar para Jogar' : '📩 Send DM / Connect')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🎮')
        );

        await channel.send({ content: `<@${user.id}>`, embeds: [embed], components: [btnRow] });

        await interaction.reply({ 
            content: isPT ? '✅ **Anúncio postado!** Fique atento à sua DM.' : '✅ **Posted!** Check your DMs.', 
            ephemeral: true 
        });
    }
};