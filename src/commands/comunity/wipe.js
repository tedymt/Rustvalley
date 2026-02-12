const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { GameDig } = require('gamedig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wipe')
        .setDescription('📅 Check wipe schedule and server status.'),
        
    async execute(interaction) {
        // 1. Oculta a resposta (Ephemeral) e avisa que está processando
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const { client, guild } = interaction;

        // 2. Busca servidores do banco
        const servers = await client.db.rustServer.findMany({
            where: { guildId: guild.id },
            orderBy: { id: 'asc' }
        });

        if (servers.length === 0) {
            return interaction.editReply({ 
                content: '❌ **Nenhum servidor configurado.** / **No servers configured.**' 
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('☢️ Cronograma & Status (Wipe Schedule)')
            .setDescription('🇧🇷 Confira abaixo o status e a data do próximo Wipe.\n🇺🇸 Check below for server status and next wipe date.')
            .setColor('#CE422B')
            .setFooter({ text: 'Rustvalley Manager • Realtime Data' })
            .setTimestamp();

        // 3. Loop Inteligente: Processa cada servidor
        for (const server of servers) {
            let statusIcon = '🔴';
            let playerInfo = 'Offline / Error';
            let wipeInfo = '';

            // --- A. Tenta buscar informações reais do servidor (Players) ---
            try {
                const state = await GameDig.query({
                    type: 'rust',
                    host: server.serverIP,
                    port: parseInt(server.serverPort),
                    maxAttempts: 2,
                    socketTimeout: 3000,
                    givenPortOnly: true
                });

                statusIcon = '🟢';
                // Se estiver cheio, muda o ícone
                if (state.players.length >= state.maxplayers) statusIcon = '🔥';
                
                playerInfo = `**${state.players.length}/${state.maxplayers}** Online`;
                
                // Adiciona info de fila se disponível (alguns servers mostram)
                if (state.raw && state.raw.queue > 0) {
                    playerInfo += ` (Queue: ${state.raw.queue})`;
                }

            } catch (error) {
                statusIcon = '🔴';
                playerInfo = 'Offline / Unreachable';
            }

            // --- B. Formata a Data do Wipe ---
            if (server.nextWipe) {
                // Timestamp Dinâmico do Discord
                const unix = Math.floor(server.nextWipe.getTime() / 1000);
                wipeInfo = `⏳ **<t:${unix}:R>**\n📅 <t:${unix}:f>`; 
            } else {
                // Mensagem amigável se não tiver data
                wipeInfo = '🗓️ *🇧🇷 A definir / 🇺🇸 To be announced (TBA)*';
            }

            // --- C. Adiciona o Campo ao Embed ---
            embed.addFields({
                name: `${statusIcon} ${server.name}`,
                value: `🔌 \`client.connect ${server.serverIP}:${server.serverPort}\`\n👥 Players: ${playerInfo}\n${wipeInfo}`,
                inline: false // Um por linha para ficar organizado
            });
        }

        // 4. Envia o resultado final
        await interaction.editReply({ embeds: [embed] });
    }
};