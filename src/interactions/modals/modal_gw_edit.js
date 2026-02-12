const { EmbedBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const gwId = parseInt(interaction.customId.split('_').pop());
        const newPrize = interaction.fields.getTextInputValue('new_prize');
        const newDesc = interaction.fields.getTextInputValue('new_desc');

        if (!newPrize && !newDesc) {
            return interaction.reply({ content: '⚠️ Nada foi alterado.', ephemeral: true });
        }

        const gw = await interaction.client.db.giveaway.findUnique({ where: { id: gwId } });
        if (!gw) return interaction.reply({ content: '❌ Sorteio não encontrado.', ephemeral: true });

        // 1. Atualiza Banco
        const data = {};
        if (newPrize) data.prize = newPrize;
        if (newDesc) data.description = newDesc;

        await interaction.client.db.giveaway.update({
            where: { id: gwId },
            data: data
        });

        // 2. ATUALIZA A VITRINE NO CANAL (Visual Instantâneo)
        try {
            const channel = await interaction.guild.channels.fetch(gw.channelId);
            const message = await channel.messages.fetch(gw.messageId);
            
            const oldEmbed = message.embeds[0];
            const newEmbed = EmbedBuilder.from(oldEmbed);

            if (newPrize) newEmbed.setTitle(`🎉 Sorteio/Prize: ${newPrize}`);
            
            // Recria a descrição mantendo o timer original
            const currentDesc = newDesc || gw.description;
            // Presumindo que o timer está na última linha ou no banco. 
            // Vamos reconstruir usando o endTime do banco para garantir o timer certo.
            const timeString = `<t:${Math.floor(gw.endTime / 1000)}:R>`;
            
            newEmbed.setDescription(`**Prêmio/Prize:** ${newPrize || gw.prize}\n\n${currentDesc}\n\n**Término:** ${timeString}`);

            await message.edit({ embeds: [newEmbed] });
            await interaction.reply({ content: '✅ Sorteio atualizado na vitrine com sucesso!', ephemeral: true });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '✅ Dados salvos, mas não consegui editar a mensagem original (pode ter sido deletada).', ephemeral: true });
        }
    }
};