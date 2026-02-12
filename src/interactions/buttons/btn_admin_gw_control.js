const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags, PermissionsBitField } = require('discord.js');

module.exports = {
    async execute(interaction) {
        // 🛡️ SEGURANÇA: Somente Admin ou Staff pode abrir
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ 
                content: '❌ **Apenas administradores podem acessar esta engrenagem.**\nOnly admins can access this gear.', 
                flags: MessageFlags.Ephemeral 
            });
        }

        const msgId = interaction.message.id;
        const giveaway = await interaction.client.db.giveaway.findUnique({ where: { messageId: msgId } });

        if (!giveaway) return interaction.reply({ content: '❌ Sorteio não encontrado no banco.', ephemeral: true });

        const embed = new EmbedBuilder()
            .setTitle('⚙️ Configuração do Sorteio / Giveaway Settings')
            .setDescription(`**Prêmio:** ${giveaway.prize}\n**Ganhadores:** ${giveaway.winners}\n**Participantes:** ${giveaway.entries.length}`)
            .setColor('#2F3136');

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`btn_gw_force_${giveaway.id}`).setLabel('Sortear Agora (Force)').setStyle(ButtonStyle.Danger).setEmoji('🎲'),
            new ButtonBuilder().setCustomId(`btn_gw_reroll_${giveaway.id}`).setLabel('Reroll (Novo Ganhador)').setStyle(ButtonStyle.Primary).setEmoji('🔄'),
            new ButtonBuilder()
    .setCustomId(`btn_gw_list_${giveaway.id}`)
    .setLabel('Ver Participantes')
    .setStyle(ButtonStyle.Secondary)
    .setEmoji('👥'),
            new ButtonBuilder().setCustomId(`btn_gw_cancel_${giveaway.id}`).setLabel('Cancelar (Cancel)').setStyle(ButtonStyle.Secondary).setEmoji('🗑️')
        );

        const rowEdit = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`btn_gw_edit_${giveaway.id}`).setLabel('Editar Info').setStyle(ButtonStyle.Secondary).setEmoji('📝')
        );

        await interaction.reply({ embeds: [embed], components: [row, rowEdit], flags: MessageFlags.Ephemeral });
    }
};