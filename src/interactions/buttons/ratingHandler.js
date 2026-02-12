const { EmbedBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        // O ID vem como rate_TICKETID_NOTA (Ex: rate_45_5)
        const parts = interaction.customId.split('_');
        const ticketId = parseInt(parts[1]);
        const rating = parseInt(parts[2]);

        try {
            // 1. Salva a nota no banco de dados
            await interaction.client.db.ticket.update({
                where: { id: ticketId },
                data: { rating: rating }
            });

            // 2. Cria a Embed de Agradecimento
            const thankYouEmbed = new EmbedBuilder()
                .setTitle('✅ Obrigado! / Thank you!')
                .setDescription(`🇧🇷 Sua avaliação de **${rating} estrelas** foi registrada.\n🇺🇸 Your **${rating}-star** rating has been recorded.`)
                .setColor('#2ECC71');

            // 3. LÓGICA DE PRESERVAÇÃO:
            // Pegamos a primeira embed da mensagem original (que contém o Protocolo, Duração, etc)
            // O Discord sempre retorna as embeds em um array. A [0] é a ficha, a [1] era o pedido de nota.
            const originalInfoEmbed = interaction.message.embeds[0];

            // Enviamos a original + a de agradecimento, removendo os botões
            await interaction.update({ 
                embeds: [originalInfoEmbed, thankYouEmbed], 
                components: [] // Remove os botões de estrela para travar a votação
            });

        } catch (error) {
            console.error('[RATING ERROR]', error);
            // Em caso de erro (ex: ticket deletado do banco), tenta avisar sem quebrar
            await interaction.reply({ content: '❌ Erro ao salvar avaliação / Error saving rating.', ephemeral: true });
        }
    }
};