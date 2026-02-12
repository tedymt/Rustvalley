const { ActionRowBuilder, ChannelSelectMenuBuilder, ChannelType, MessageFlags } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const timeInput = interaction.fields.getTextInputValue('time');
        const interval = interaction.fields.getTextInputValue('interval') || '0';

        const row = new ActionRowBuilder().addComponents(
            new ChannelSelectMenuBuilder()
                .setCustomId('select_ann_final_channel')
                .setPlaceholder('Agora, escolha o canal para finalizar...')
                .setChannelTypes([ChannelType.GuildText])
        );

        // Passamos os dados via conteúdo da mensagem para o próximo passo ler
        const currentEmbed = interaction.message.embeds[0];
        const isEveryone = interaction.message.content.includes('everyone');

        await interaction.update({ 
            content: `⏰ **Quase lá!**\nAgendamento: 🕒 ${timeInput} | 🔁 ${interval}d\nPing: ${isEveryone ? '@everyone' : 'OFF'}\n\n👇 **Selecione o canal abaixo para ATIVAR:**`,
            components: [row],
            embeds: [currentEmbed]
        });
    }
};