const { Events, PermissionsBitField, EmbedBuilder } = require('discord.js');

// Palavras comuns para detecção simples (mantido conforme solicitado)
const commonEnglishWords = ['what', 'when', 'where', 'how', 'server', 'wipe', 'map', 'kit', 'admin', 'help', 'please', 'thx', 'thanks', 'blueprints', 'bp'];

// Mapa para Anti-Spam (Armazena histórico recente de msgs dos usuários)
const spamMap = new Map();

// LISTA DE PALAVRAS TÓXICAS (PT/EN)
const BAD_WORDS = [
    // --- PORTUGUÊS ---
    /p[u@]t[ao]/i,              // puta, puto, p@ta
    /caralh[o]/i,               // caralho
    /b[u@]cet[a]/i,             // buceta
    /v[i1]ad[o]/i,              // viado, v1ado
    /arrombad[o]/i,             // arrombado
    /f[u@]d[e]/i,               // fuder, foda-se
    /c[u@]z[ao]o/i,             // cuzao
    /merd[a]/i,                 // merda
    /p[1l]ranh[a]/i,            // piranha
    /chupa.*pau/i,              // chupa pau
    /filh[oa].*puta/i,          // filho da puta
    /corn[o]/i,                 // corno

    // --- INGLÊS ---
    /f[u@*]ck/i,                // fuck, f*ck
    /sh[i1]t/i,                 // shit, sh1t
    /b[i1]tch/i,                // bitch
    /n[i1]gg[a]/i,              // nigga
    /n[i1]gg[e3]r/i,            // nigger
    /faggot/i,                  // faggot
    /retard/i,                  // retard
    /cunt/i,                    // cunt
    /d[i1]ck/i,                 // dick
    /asshole/i,                 // asshole
    /motherfucker/i             // motherfucker
];

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Ignora bots e DMs
        if (message.author.bot || !message.guild) return;

        const { client, guild, channel, content } = message;

        // ==========================================================
        // 1. SISTEMA DE RESPOSTAS AUTOMÁTICAS (AUTO-RESPONSE)
        // ==========================================================
        try {
            // Busca configuração da guilda (incluindo respostas)
            // OTIMIZAÇÃO: Buscamos tudo de uma vez aqui para usar na moderação também
            const guildConfig = await client.db.guild.findUnique({
                where: { id: guild.id },
                include: { autoResponses: true }
            });

            // Se não tiver config, para tudo
            if (!guildConfig) return;

            // -- LÓGICA DE RESPOSTA --
            // Verifica se está habilitado e se tem respostas
            if (guildConfig.autoResponseEnabled && guildConfig.autoResponses.length > 0) {
                
                let canRespond = true;

                // Verifica Filtro de Canais (se configurado)
                if (guildConfig.autoResponseChannels) {
                    const allowedIds = guildConfig.autoResponseChannels.split(',');
                    // Se a lista não estiver vazia e o canal atual não estiver nela, bloqueia
                    if (allowedIds.length > 0 && allowedIds[0] !== '' && !allowedIds.includes(channel.id)) {
                        canRespond = false;
                    }
                }

                if (canRespond) {
                    const lowerContent = content.toLowerCase();

                    // Busca Inteligente (PT ou EN)
                    const match = guildConfig.autoResponses.find(r => 
                        lowerContent.includes(r.trigger.toLowerCase()) || 
                        (r.triggerEN && lowerContent.includes(r.triggerEN.toLowerCase()))
                    );

                    if (match) {
                        // Detecta se o gatilho foi o em Inglês
                        const triggeredByEN = match.triggerEN && lowerContent.includes(match.triggerEN.toLowerCase());
                        const replyText = triggeredByEN ? match.responseEN : match.responsePT;

                        await message.reply({ 
                            content: replyText,
                            allowedMentions: { repliedUser: false } 
                        });
                        
                        // Se respondeu, geralmente não queremos punir por spam logo em seguida, 
                        // mas a execução segue para moderação caso o user tenha xingado na mesma mensagem.
                    }
                }
            }

            // ==========================================================
            // 2. SISTEMA DE AUTO-MODERAÇÃO (SECURITY)
            // ==========================================================
            
            // Admins ignoram filtros de moderação
            if (message.member.permissions.has(PermissionsBitField.Flags.Administrator) || 
                message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) return;

            let infractionType = null;
            let deleteReason = null;
            let muteDuration = 0;

            // --- A. ANTI-SPAM (FLOOD) ---
            // Regra: 6 mensagens em 5 segundos
            if (guildConfig.antiSpam) {
                const now = Date.now();
                const userData = spamMap.get(message.author.id) || [];
                
                // Filtra mensagens antigas (> 5 seg)
                const recentMessages = userData.filter(t => now - t < 5000);
                recentMessages.push(now);
                spamMap.set(message.author.id, recentMessages);

                if (recentMessages.length >= 6) { 
                    infractionType = 'SPAM';
                    deleteReason = '⚡ Flood detectado (6 msgs em <5s)';
                    muteDuration = 10 * 60 * 1000; // 10 min mute
                    spamMap.delete(message.author.id); // Reseta o contador
                }
            }

            // --- B. ANTI-MASS MENTION ---
            if (!infractionType && guildConfig.maxMentions > 0) {
                const mentionCount = message.mentions.users.size + message.mentions.roles.size;
                if (mentionCount > guildConfig.maxMentions) {
                    infractionType = 'MASS_MENTION';
                    deleteReason = `📢 Muitas menções (${mentionCount} > ${guildConfig.maxMentions})`;
                    muteDuration = 5 * 60 * 1000; // 5 min mute
                }
            }

            // --- C. ANTI-LINK ---
            if (!infractionType && guildConfig.antiLink) {
                const linkRegex = /(https?:\/\/[^\s]+)|(discord\.gg\/[^\s]+)|(discord\.com\/invite\/[^\s]+)/gi;
                if (linkRegex.test(content)) {
                    infractionType = 'LINK';
                    deleteReason = '🚫 Links proibidos';
                }
            }

            // --- D. ANTI-TOXIC (BILINGUE & ESCALÁVEL) ---
            if (!infractionType && guildConfig.antiToxic) {
                if (BAD_WORDS.some(regex => regex.test(content))) {
                    infractionType = 'TOXIC';
                    
                    // Lógica de Escalabilidade (Busca no Banco)
                    const now = new Date();
                    let userInfraction = await client.db.infraction.findUnique({
                        where: { guildId_userId: { guildId: guild.id, userId: message.author.id } }
                    });

                    if (!userInfraction) {
                        userInfraction = await client.db.infraction.create({
                            data: { guildId: guild.id, userId: message.author.id, level: 0 }
                        });
                    }

                    // Verifica se passou 1 hora desde a última infração (Reset)
                    const hoursSinceLast = (now - new Date(userInfraction.lastOccur)) / (1000 * 60 * 60);
                    let newLevel = userInfraction.level + 1;

                    if (hoursSinceLast >= 1) {
                        newLevel = 1; // Reseta para nível 1
                    }

                    // Atualiza infração no banco
                    await client.db.infraction.update({
                        where: { id: userInfraction.id },
                        data: { level: newLevel, lastOccur: now }
                    });

                    // Define a punição baseada no nível
                    if (newLevel === 1) {
                        deleteReason = `☣️ Toxicidade (Nível 1): Aviso Verbal`;
                        muteDuration = 0;
                    } else if (newLevel === 2) {
                        deleteReason = `☣️ Toxicidade (Nível 2): Mute 5 min`;
                        muteDuration = 5 * 60 * 1000;
                    } else if (newLevel === 3) {
                        deleteReason = `☣️ Toxicidade (Nível 3): Mute 30 min`;
                        muteDuration = 30 * 60 * 1000;
                    } else {
                        deleteReason = `☣️ Toxicidade (Nível ${newLevel}): Mute 1 hora`;
                        muteDuration = 60 * 60 * 1000;
                    }
                }
            }
// ==========================================
        // 5. ANTI-MÍDIA / ARQUIVOS
        // ==========================================
        if (!infractionType && guildConfig.antiMedia) {
            // Verifica se a mensagem possui anexos (imagens, arquivos, vídeos)
            if (message.attachments.size > 0) {
                infractionType = 'MEDIA';
                deleteReason = '🖼️ Envio de mídias/arquivos não permitido neste canal.';
                // Para mídia, geralmente apenas apagamos sem mutar, a menos que seja flood.
                muteDuration = 0; 
            }
        }
            // ==========================================
            // 3. APLICAÇÃO DA PUNIÇÃO
            // ==========================================
            if (infractionType) {
                // 1. Apaga a mensagem
                await message.delete().catch(() => {});

                let actionText = "Mensagem apagada";

                // 2. Aplica Mute (se houver duração)
                if (muteDuration > 0) {
                    await message.member.timeout(muteDuration, `Rustvalley Security: ${deleteReason}`).catch(() => {
                        actionText += " (Falha ao mutar - Verifique permissões)";
                    });
                    actionText += ` + Mute ${muteDuration / 60000}m`;
                }

                // 3. Avisa no Chat (Mensagem temporária)
                const msg = await channel.send({ 
                    content: `🛡️ ${message.author}, **${deleteReason}**! \n⚠️ Respeite as regras.` 
                });
                // Apaga o aviso depois de 6 segundos
                setTimeout(() => msg.delete().catch(() => {}), 6000);

                // 4. Gera Log de Segurança
                if (guildConfig.securityLogChannel) {
                    const logChannel = guild.channels.cache.get(guildConfig.securityLogChannel);
                    if (logChannel) {
                        const embed = new EmbedBuilder()
                            .setTitle(`🛡️ Security: ${infractionType}`)
                            .setColor('#E74C3C')
                            .addFields(
                                { name: '👤 Usuário', value: `${message.author.tag} (\`${message.author.id}\`)`, inline: true },
                                { name: '⚖️ Motivo', value: deleteReason, inline: true },
                                { name: '📝 Conteúdo Original', value: `\`\`\`${content.substring(0, 800)}\`\`\``, inline: false }
                            )
                            .setTimestamp();
                        logChannel.send({ embeds: [embed] }).catch(() => {});
                    }
                }
            }

        } catch (error) {
            console.error('Erro no messageCreate (AutoResponse/Security):', error);
        }
    },
};