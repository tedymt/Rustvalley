const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlags } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const action = interaction.values[0];

        // --- RENOMEAR ---
        if (action === 'rename_ticket') {
            const modal = new ModalBuilder().setCustomId('modal_rename_ticket').setTitle('Renomear / Rename');
            const input = new TextInputBuilder().setCustomId('new_name').setLabel('Novo Nome / New Name').setStyle(TextInputStyle.Short).setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(input));
            await interaction.showModal(modal);
        }

        // --- NOTIFICAR DM (COM LINK) ---
        if (action === 'notify_dm') {
            const ticketData = await interaction.client.db.ticket.findUnique({ where: { channelId: interaction.channel.id } });
            
            // Gera o link direto para o ticket
            const ticketLink = `https://discord.com/channels/${interaction.guild.id}/${interaction.channel.id}`;
            
            const target = await interaction.client.users.fetch(ticketData.authorId).catch(() => null);
            if (target) {
                await target.send({
                    content: `🔔 **Rustvalley Manager Notification**\n\n🇧🇷 Olá, aguardamos sua resposta no ticket.\n🇺🇸 Hello, we are waiting for your response.\n\n🔗 **Acesse aqui / Click here:** ${ticketLink}`
                }).catch(() => {
                    return interaction.reply({ content: '❌ DM Fechada / DM Closed.', flags: MessageFlags.Ephemeral });
                });
                
                if (!interaction.replied) {
                    await interaction.reply({ content: '✅ Notificação enviada com Link! / Notification sent with Link!', flags: MessageFlags.Ephemeral });
                }
            }
        }

        // --- ADICIONAR MEMBRO ---
        if (action === 'add_member') {
            const modal = new ModalBuilder().setCustomId('modal_add_member').setTitle('Adicionar / Add Member');
            const input = new TextInputBuilder().setCustomId('user_id').setLabel('ID do Usuário / User ID').setStyle(TextInputStyle.Short).setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(input));
            await interaction.showModal(modal);
        }

        // --- REMOVER MEMBRO ---
        if (action === 'remove_member') {
            const modal = new ModalBuilder().setCustomId('modal_remove_member').setTitle('Remover / Remove Member');
            const input = new TextInputBuilder().setCustomId('user_id').setLabel('ID do Usuário / User ID').setStyle(TextInputStyle.Short).setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(input));
            await interaction.showModal(modal);
        }
    }
};