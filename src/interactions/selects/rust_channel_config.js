const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const choice = interaction.values[0];
        let title = '';
        let description = '';
        let nextCustomId = '';

        // Define a informação baseada na escolha
        if (choice === 'set_log_channel') {
            nextCustomId = 'select_rust_server_logs'; // Próximo passo para logs
            title = '🚨 Configurar Logs de Sentinela';
            description = 'Esta função monitora o status dos seus servidores em tempo real.\n\n' +
                          '**Como funciona:**\n' +
                          'O bot enviará um aviso imediato sempre que um servidor ficar **Offline** ou voltar **Online**.\n\n' +
                          'Clique no botão abaixo para escolher para qual servidor deseja configurar.';
        } else if (choice === 'set_announce_channel') {
            nextCustomId = 'select_rust_server_announce'; // Próximo passo para anúncios
            title = '📢 Configurar Auto-Announce (Wipe)';
            description = 'Esta função automatiza os anúncios de Wipe do seu servidor.\n\n' +
                          '**Como funciona:**\n' +
                          'O bot detecta o Wipe baseado no horário agendado e envia uma mensagem customizada no canal escolhido.\n\n' +
                          'Clique no botão abaixo para escolher o servidor e o canal do anúncio.';
        } else {
            return interaction.reply({ content: '❌ Opção inválida.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle(title)
            .setDescription(description)
            .setColor('#CE422B')
            .setThumbnail(interaction.guild.iconURL());

        // Row com o botão de Próximo e Voltar
        const rowButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('module_rust_btn')
                .setLabel('Voltar')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('⬅️'),
            new ButtonBuilder()
                .setCustomId(nextCustomId) // Este ID chama o seletor de servidor
                .setLabel('Próximo Passo')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('➡️')
        );

        await interaction.update({ 
            embeds: [embed], 
            components: [rowButtons],
            content: null // Limpa qualquer texto residual
        });
    }
};