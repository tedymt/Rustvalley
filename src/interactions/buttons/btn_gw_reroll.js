const { EmbedBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const gwId = parseInt(interaction.customId.split('_').pop());
        const gw = await interaction.client.db.giveaway.findUnique({ where: { id: gwId } });

        if (!gw.ended) return interaction.reply({ content: '❌ O sorteio ainda está rodando. Use "Sortear Agora" primeiro.', ephemeral: true });
        if (gw.entries.length === 0) return interaction.reply({ content: '❌ Sem participantes para re-sortear.', ephemeral: true });

        // Sorteia um novo vencedor aleatório
        const newWinnerId = gw.entries[Math.floor(Math.random() * gw.entries.length)];

        const embed = new EmbedBuilder()
            .setTitle('🔄 NOVO GANHADOR / NEW WINNER (Reroll)')
            .setDescription(`🇧🇷 O sorteio para **${gw.prize}** foi re-sorteado!\n🇺🇸 The giveaway for **${gw.prize}** has been rerolled!`)
            .addFields({ name: '🏆 Vencedor / Winner', value: `<@${newWinnerId}>` })
            .setColor('#3498DB')
            .setTimestamp();

        await interaction.channel.send({ content: `🎉 **Reroll:** <@${newWinnerId}>`, embeds: [embed] });
        await interaction.reply({ content: '✅ Novo ganhador sorteado!', ephemeral: true });
    }
};