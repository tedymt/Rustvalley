module.exports = {
    async execute(interaction) {
        const giveaway = await interaction.client.db.giveaway.findUnique({
            where: { messageId: interaction.message.id }
        });

        if (!giveaway || giveaway.ended) {
            return interaction.reply({ 
                content: '❌ **Este sorteio já acabou. / This giveaway has ended.**', 
                ephemeral: true 
            });
        }

        const userId = interaction.user.id;
        const isParticipating = giveaway.entries.includes(userId);
        let newEntries;
        let response;

        if (isParticipating) {
            newEntries = giveaway.entries.filter(id => id !== userId);
            response = '📤 **Você saiu do sorteio. / You left the giveaway.**';
        } else {
            newEntries = [...giveaway.entries, userId];
            response = '✅ **Você está participando! Boa sorte. / You are in! Good luck.**';
        }

        await interaction.client.db.giveaway.update({
            where: { id: giveaway.id },
            data: { entries: newEntries }
        });

        // Atualiza o contador na embed original
        const embed = interaction.message.embeds[0];
        const newEmbed = {
            ...embed.data,
            fields: embed.fields.map(f => {
                if (f.name.includes('Participantes')) return { ...f, value: `\`${newEntries.length}\`` };
                return f;
            })
        };

        await interaction.update({ embeds: [newEmbed] });
        await interaction.followUp({ content: response, ephemeral: true });
    }
};