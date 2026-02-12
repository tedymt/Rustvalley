const { PermissionsBitField, MessageFlags } = require('discord.js');
module.exports = {
    async execute(interaction) {
        const userId = interaction.fields.getTextInputValue('user_id');
        try {
            await interaction.channel.permissionOverwrites.delete(userId);
            await interaction.reply({ content: `🚫 **<@${userId}> removido / removed.**`, flags: MessageFlags.Ephemeral });
        } catch (e) {
            await interaction.reply({ content: '❌ Erro ao remover / Error removing.', flags: MessageFlags.Ephemeral });
        }
    }
};