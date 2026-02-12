const { PermissionsBitField, MessageFlags } = require('discord.js');
module.exports = {
    async execute(interaction) {
        const userId = interaction.fields.getTextInputValue('user_id');
        try {
            await interaction.channel.permissionOverwrites.edit(userId, { 
                ViewChannel: true, 
                SendMessages: true 
            });
            await interaction.reply({ content: `👤 **<@${userId}> adicionado / added.**`, flags: MessageFlags.Ephemeral });
        } catch (e) {
            await interaction.reply({ content: '❌ Usuário inválido / Invalid User.', flags: MessageFlags.Ephemeral });
        }
    }
};