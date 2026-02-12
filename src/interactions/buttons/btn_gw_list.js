const { EmbedBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const gwId = parseInt(interaction.customId.split('_').pop());
        const gw = await interaction.client.db.giveaway.findUnique({ where: { id: gwId } });

        if (gw.entries.length === 0) {
            return interaction.reply({ content: 'ℹ️ **Nenhum participante ainda. / No entries yet.**', ephemeral: true });
        }

        // Formata a lista (limitando para não quebrar a embed)
        // Se houver muitos, mostra os primeiros 50 e o total
        const list = gw.entries.slice(0, 50).map((id, index) => `\`#${index + 1}\` <@${id}>`).join('\n');
        const total = gw.entries.length;

        const embed = new EmbedBuilder()
            .setTitle('👥 Participantes / Entries')
            .setDescription(total > 50 ? `${list}\n\n*... e outros ${total - 50} participantes.*` : list)
            .addFields({ name: 'Total', value: `\`${total}\`` })
            .setColor('#3498DB');

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};