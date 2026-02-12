const { MessageFlags } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const { client, guild } = interaction;
        const title = interaction.fields.getTextInputValue('ticket_title');
        const description = interaction.fields.getTextInputValue('ticket_desc');
        const banner = interaction.fields.getTextInputValue('ticket_banner');
        const color = interaction.fields.getTextInputValue('ticket_color');

        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        const finalColor = hexRegex.test(color) ? color : '#5865F2';

        await client.db.ticketConfig.upsert({
            where: { guildId: guild.id },
            update: { title, description, banner, color: finalColor },
            create: { guildId: guild.id, title, description, banner, color: finalColor }
        });

        await interaction.reply({ 
            content: '✅ **Aparência salva!**', 
            flags: MessageFlags.Ephemeral 
        });
    }
};