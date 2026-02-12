const { EmbedBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        // ID vem como btn_gw_cancel_ID
        const gwId = parseInt(interaction.customId.split('_').pop());

        const gw = await interaction.client.db.giveaway.findUnique({ where: { id: gwId } });

        if (!gw) {
            return interaction.reply({ content: '❌ Sorteio não encontrado no banco de dados.', ephemeral: true });
        }

        if (gw.ended) {
            return interaction.reply({ content: '⚠️ Este sorteio já está marcado como encerrado/cancelado.', ephemeral: true });
        }

        // 1. Marca como encerrado no banco PRIMEIRO
        await interaction.client.db.giveaway.update({
            where: { id: gwId },
            data: { ended: true }
        });

        // 2. Tenta atualizar a mensagem visualmente
        try {
            const channel = await interaction.guild.channels.fetch(gw.channelId);
            if (!channel) throw new Error('Canal não encontrado');

            const message = await channel.messages.fetch(gw.messageId);
            if (!message) throw new Error('Mensagem não encontrada');

            const oldEmbed = message.embeds[0];
            const newEmbed = EmbedBuilder.from(oldEmbed)
                .setTitle('🚫 SORTEIO CANCELADO / CANCELLED')
                .setDescription(`~~${oldEmbed.description}~~`) // Risca o texto
                .setColor('#000000') // Preto
                .setFooter({ text: 'Cancelado pelo Admin' });

            // Remove o botão de participar para ninguém mais clicar
            await message.edit({ embeds: [newEmbed], components: [] });
            
            await interaction.reply({ content: '✅ Sorteio cancelado com sucesso!', ephemeral: true });

        } catch (error) {
            console.error('[GW CANCEL] Mensagem não encontrada:', error.message);
            // Feedback importante: Avise que no banco deu certo, mesmo que a mensagem sumiu
            await interaction.reply({ 
                content: '✅ Sorteio cancelado no Banco de Dados! (A mensagem original não foi encontrada ou já foi deletada).', 
                ephemeral: true 
            });
        }
    }
};