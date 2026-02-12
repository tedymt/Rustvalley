const { GameDig } = require('gamedig');
const axios = require('axios'); 
const { EmbedBuilder } = require('discord.js');

// VARIÁVEL GLOBAL PARA IMPEDIR MÚLTIPLOS LOOPS (A SOLUÇÃO DO SPAM)
if (!global.rustMonitorInterval) global.rustMonitorInterval = null;

module.exports = {
    name: 'rust_monitor',
    async execute(client) {
        // Se já existe um monitor rodando, mata ele antes de começar o novo
        if (global.rustMonitorInterval) {
            clearInterval(global.rustMonitorInterval);
            console.log('🔄 Monitor Rust reiniciado (Loop antigo limpo).');
        }

        console.log('🔄 Monitor de Rust (V12 - Anti-Flood) iniciado...');
        
        // Executa imediatamente ao ligar
        await updateRustStatus(client);

        // Monitoramento a cada 60 segundos (Salvo na variável global)
        global.rustMonitorInterval = setInterval(async () => {
            await updateRustStatus(client);
        }, 60 * 1000);
    }
};

async function updateRustStatus(client) {
    const servers = await client.db.rustServer.findMany();

    for (const server of servers) {
        const guild = await client.guilds.fetch(server.guildId).catch(() => null);
        if (!guild) continue;

        const connectUrl = `${server.serverIP}:${server.serverPort}`;

        // 1. VERIFICAÇÃO DE WIPE
        await checkAndAnnounceWipe(client, guild, server, connectUrl);

        // 2. CRONÔMETRO DE WIPE
        await updateWipeEmbedCountdown(client, guild, server);

        // 3. CONSULTA DE STATUS (GameDig)
        let state = null;
        try {
            state = await GameDig.query({
                type: 'rust',
                host: server.serverIP,
                port: parseInt(server.serverPort),
                maxAttempts: 2,
                socketTimeout: 3000
            }).catch(() => null);
        } catch (e) {}

        // --- FALLBACK STEAM API ---
        if (!state) {
            const isSteamOnline = await checkSteamAPI(server.serverIP, server.serverPort);
            if (isSteamOnline) {
                state = {
                    players: [], 
                    maxplayers: '???',
                    map: 'Online (Steam)',
                    ping: '??'
                };
            }
        }

        const guildConfig = await client.db.guild.findUnique({ where: { id: guild.id } });
        
        // Determina o estado atual (true = online, false = offline)
        const isCurrentlyOnline = !!state;

        // --- LÓGICA ANTI-FLOOD (SÓ AVISA SE O STATUS MUDOU) ---
        if (isCurrentlyOnline !== server.isOnline) {
            
            // Se caiu (Estava ON, agora OFF)
            if (!isCurrentlyOnline) {
                if (guildConfig && guildConfig.rustLogChannel) {
                    const channel = guild.channels.cache.get(guildConfig.rustLogChannel);
                    if (channel) channel.send(`🚨 **OFFLINE:** O servidor **${server.name}** parou de responder.`);
                }
                
                // Atualiza Vitrine para modo Offline
                if (server.statusMessageId && server.statusChannelId) {
                    await updateEmbedOffline(guild, server, connectUrl);
                }

                // Atualiza Contador de Players para "Offline"
                await updatePlayerCounter(guild, server, null);
            }
            
            // Se voltou (Estava OFF, agora ON)
            else {
                if (guildConfig && guildConfig.rustLogChannel) {
                     const channel = guild.channels.cache.get(guildConfig.rustLogChannel);
                     if (channel) channel.send(`✅ **ONLINE:** O servidor **${server.name}** voltou!`);
                }
            }

            // ATUALIZA O BANCO COM O NOVO STATUS PARA NÃO AVISAR DE NOVO
            await client.db.rustServer.update({ 
                where: { id: server.id }, 
                data: { isOnline: isCurrentlyOnline } 
            });
        }

        // Se estiver ONLINE, continua atualizando contadores e vitrine normalmente
        if (isCurrentlyOnline) {
            await updatePlayerCounter(guild, server, state);

            // 5. ATUALIZA A VITRINE (Status Embed)
            if (server.statusMessageId && server.statusChannelId) {
                try {
                    const channel = await guild.channels.fetch(server.statusChannelId);
                    const msg = await channel.messages.fetch(server.statusMessageId);
                    
                    const players = state.players ? `${state.players.length}/${state.maxplayers}` : 'On (Steam)';
                    const map = state.map || 'Unknown';
                    const ping = state.ping || '??';
                    
                    let nextWipeText = '📅 Pendente';
                    if (server.nextWipe) {
                        const unixTime = Math.floor(new Date(server.nextWipe).getTime() / 1000);
                        nextWipeText = `<t:${unixTime}:R>`;
                    }

                    const announceChannelText = server.announceChannelId ? `<#${server.announceChannelId}>` : '❌ Off';

                    const embed = new EmbedBuilder()
                        .setTitle(`☢️ ${server.name}`)
                        .setDescription(`\`\`\`fix\nconnect ${connectUrl}\`\`\`\n[🚀 **CLIQUE PARA ENTRAR**](steam://connect/${connectUrl})`)
                        .addFields(
                            { name: '👥 Players', value: `**${players}**`, inline: true },
                            { name: '📶 Ping', value: `\`${ping}ms\``, inline: true },
                            { name: '🗺️ Mapa', value: `\`${map}\``, inline: true },
                            { name: '📢 Wipe Alert', value: announceChannelText, inline: true },
                            { name: '⏳ Wipe', value: nextWipeText, inline: true }
                        )
                        .setColor('#2ECC71')
                        .setThumbnail(guild.iconURL({ dynamic: true }) || null)
                        .setImage(server.imageUrl || 'https://i.imgur.com/4i4Z5vD.png')
                        .setFooter({ text: `Atualizado: ${new Date().toLocaleTimeString()}` });

                    await msg.edit({ embeds: [embed] });

                } catch (err) {}
            }
        }
    }
}

// ====================================================
// FUNÇÕES AUXILIARES (SEU CÓDIGO ORIGINAL ABAIXO)
// ====================================================

async function checkSteamAPI(ip, port) {
    const key = process.env.STEAM_API_KEY; 
    if (!key) return false; 

    try {
        const filter = `\\addr\\${ip}:${port}`;
        const url = `https://api.steampowered.com/IGameServersService/GetServerList/v1/?key=${key}&filter=${filter}`;
        
        const response = await axios.get(url, { timeout: 3000 });
        
        if (response.data && response.data.response && response.data.response.servers && response.data.response.servers.length > 0) {
            return true;
        }
        return false;
    } catch (error) {
        return false;
    }
}

async function updatePlayerCounter(guild, server, state) {
    if (!server.playerCountChannel) return;

    try {
        const channel = await guild.channels.fetch(server.playerCountChannel).catch(() => null);
        if (!channel) return;

        let newName = "";
        
        if (state) {
            // Se state.players não existir (Steam Fallback), usa '?'
            const count = state.players ? state.players.length : '?';
            newName = `🟢 ${server.name}: ${count}/${state.maxplayers}`;
        } else {
            newName = `🔴 ${server.name}: Offline`;
        }

        if (newName.length > 100) newName = newName.substring(0, 100);

        if (channel.name !== newName) {
            await channel.setName(newName).catch(err => {
                if (err.code !== 50035) {} // Ignora rate limit
            });
        }
    } catch (e) {}
}

async function checkAndAnnounceWipe(client, guild, server, connectUrl) {
    if (!server.nextWipe) return;

    const now = new Date();
    const wipeDate = new Date(server.nextWipe);

    if (wipeDate <= now) {
        
        const clearWipeDate = async () => {
            try {
                await client.db.rustServer.update({ 
                    where: { id: server.id }, 
                    data: { nextWipe: null } 
                });
            } catch (err) {
                if (err.code !== 'P2025') console.error(`[WIPE DB ERRO] Falha ao limpar data: ${err.message}`);
            }
        };

        if (!server.announceChannelId) {
            await clearWipeDate();
            return;
        }

        try {
            const channel = await guild.channels.fetch(server.announceChannelId).catch(() => null);
            if (!channel) {
                await clearWipeDate();
                return;
            }

            const isPT = server.language === 'PT';
            
            let description = isPT
                ? `🔥 **O SERVIDOR WIPOU!**\nO mapa está limpo. Corra para garantir o melhor spot!\n\n📡 **IP:** \`client.connect ${connectUrl}\``
                : `🔥 **SERVER JUST WIPED!**\nMap is fresh. Run to secure the best spot!\n\n📡 **IP:** \`client.connect ${connectUrl}\``;

            if (server.customWipeMessage) {
                description = server.customWipeMessage.replace('{connect}', `\`client.connect ${connectUrl}\``);
            }

            const embed = new EmbedBuilder()
                .setTitle(isPT ? `☢️ WIPE CONFIRMADO: ${server.name}` : `☢️ WIPE CONFIRMED: ${server.name}`)
                .setDescription(description)
                .setColor('#FF0000')
                .setThumbnail(guild.iconURL({ dynamic: true }) || null)
                .setImage(server.imageUrl || 'https://i.imgur.com/XJ8M8qO.png')
                .setTimestamp()
                .setFooter({ text: guild.name, iconURL: guild.iconURL() });

            await channel.send({ content: '@everyone', embeds: [embed] });

            await clearWipeDate();

        } catch (error) {
            console.error(`[WIPE FALHA]`, error);
        }
    }
}

async function updateWipeEmbedCountdown(client, guild, server) {
    if (!server.wipeCountChannel) return;

    try {
        const channel = await guild.channels.fetch(server.wipeCountChannel).catch(() => null);
        if (!channel || !channel.isTextBased()) return;

        const isPT = server.language === 'PT';
        let embed;

        if (!server.nextWipe) {
            embed = new EmbedBuilder()
                .setTitle(isPT ? '⏳ Aguardando Configuração' : '⏳ Waiting Configuration')
                .setDescription(isPT ? 'A data do próximo Wipe ainda não foi definida.' : 'Next Wipe date has not been set yet.')
                .setColor('#2B2D31')
                .setThumbnail(guild.iconURL({ dynamic: true }) || null)
                .setFooter({ text: 'Koda Manager' });
        } 
        else {
            const now = new Date();
            const wipeDate = new Date(server.nextWipe);
            const diff = wipeDate - now;
            
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            
            const color = diff <= 0 ? '#FF0000' : '#3498DB';
            const timeLeft = diff <= 0 ? (isPT ? 'AGORA!' : 'NOW!') : `${days}d ${hours}h ${minutes}m`;

            embed = new EmbedBuilder()
                .setTitle(isPT ? `⏳ Cronômetro: ${server.name}` : `⏳ Timer: ${server.name}`)
                .setDescription(`# ⏱️ ${timeLeft}`)
                .addFields({ name: isPT ? '📅 Data' : '📅 Date', value: `<t:${Math.floor(wipeDate.getTime()/1000)}:f>`, inline: true })
                .setColor(color)
                .setThumbnail(guild.iconURL({ dynamic: true }) || null)
                .setFooter({ text: isPT ? 'Atualiza a cada 60s' : 'Updates every 60s' })
                .setTimestamp();
        }

        const messages = await channel.messages.fetch({ limit: 5 });
        const lastMsg = messages.find(m => m.author.id === client.user.id);

        if (lastMsg) {
            await lastMsg.edit({ embeds: [embed] });
        } else {
            await channel.send({ embeds: [embed] });
        }

    } catch (e) {}
}

async function updateEmbedOffline(guild, server, connectUrl) {
    try {
        const channel = await guild.channels.fetch(server.statusChannelId);
        const msg = await channel.messages.fetch(server.statusMessageId);
        
        const announceChannelText = server.announceChannelId ? `<#${server.announceChannelId}>` : '❌ Off';
        
        const embed = EmbedBuilder.from(msg.embeds[0])
            .setColor('#000000') // Preto quando offline
            .setDescription('🔴 **OFFLINE**\nO servidor não está respondendo.')
            .setFields(
                { name: '🌍 IP', value: connectUrl, inline: false },
                { name: '📢 Wipe Alert', value: announceChannelText, inline: false }
            )
            .setThumbnail(guild.iconURL({ dynamic: true }));

        await msg.edit({ embeds: [embed] });
    } catch (e) {}
}