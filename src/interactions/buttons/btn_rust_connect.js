const { EmbedBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        // Pega o ID único do servidor (ex: btn_rust_connect_15)
        const serverId = parseInt(interaction.customId.split('_').pop());

        try {
            // Busca os detalhes no banco para ter certeza do IP
            const server = await interaction.client.db.rustServer.findUnique({
                where: { id: serverId }
            });

            if (!server) {
                return interaction.reply({ 
                    content: '❌ **Erro:** Servidor não encontrado ou removido.\n**Error:** Server not found or removed.', 
                    ephemeral: true 
                });
            }

            const embed = new EmbedBuilder()
                .setTitle('🚀 Conexão Direta / Direct Connect')
                .setDescription(
                    `🇧🇷 **Como conectar:**\n1. Abra o jogo (F1 no menu).\n2. Copie e cole o comando abaixo.\n\n` +
                    `🇺🇸 **How to connect:**\n1. Open game console (F1).\n2. Copy and paste the command below.`
                )
                .addFields(
                    { name: '💻 Console Command', value: `\`\`\`client.connect ${server.connectUrl}\`\`\`` }
                )
                .setColor('#CE422B')
                .setFooter({ text: 'Koda Manager • Rust Sentinel' });

            // Resposta Ephemeral (Só quem clicou vê)
            await interaction.reply({ embeds: [embed], ephemeral: true });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Database Error.', ephemeral: true });
        }
    }
};