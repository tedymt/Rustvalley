const { ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const row = new ActionRowBuilder().addComponents(
            new ChannelSelectMenuBuilder()
                .setCustomId('setup_suggestion_channel_en') // ID Específico para EN
                .setPlaceholder('🇺🇸 Select the Suggestion Channel (EN-US)')
                .setChannelTypes(ChannelType.GuildText)
        );

        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'Select the channel below:', components: [row], ephemeral: true });
        } else {
            await interaction.reply({ content: 'Select the channel below:', components: [row], ephemeral: true });
        }
    }
};