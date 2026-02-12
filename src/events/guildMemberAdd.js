const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        const { guild, client } = member;

        // ====================================================
        // 🛡️ MÓDULO DE SEGURANÇA (ANTI-FAKE)
        // ====================================================
        try {
            const config = await client.db.guild.findUnique({ where: { id: guild.id } });
            
            if (config && config.minAccountAge > 0) {
                // Calcula idade da conta em dias
                const created = member.user.createdTimestamp;
                const now = Date.now();
                const diffDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));

                if (diffDays < config.minAccountAge) {
                    // 🚨 CONTA MUITO NOVA! EXPULSAR!
                    
                    // Tenta avisar na DM antes de expulsar
                    await member.send({
                        content: `🛑 **Kicked from ${guild.name}**\n\n` +
                                 `🇧🇷 Sua conta é muito nova (${diffDays} dias). O mínimo é **${config.minAccountAge} dias**.\n` +
                                 `🇺🇸 Your account is too new (${diffDays} days). Minimum required is **${config.minAccountAge} days**.`
                    }).catch(() => {});

                    await member.kick(`Anti-Fake: Conta com ${diffDays} dias (Min: ${config.minAccountAge})`);

                    // Log de Segurança
                    if (config.securityLogChannel) {
                        const logChannel = guild.channels.cache.get(config.securityLogChannel);
                        if (logChannel) {
                            const embed = new EmbedBuilder()
                                .setTitle('🛡️ Anti-Fake: Membro Expulso')
                                .addFields(
                                    { name: '👤 Usuário', value: `${member.user.tag} (\`${member.id}\`)`, inline: true },
                                    { name: '👶 Idade da Conta', value: `${diffDays} dias`, inline: true },
                                    { name: '🛑 Limite Mínimo', value: `${config.minAccountAge} dias`, inline: true }
                                )
                                .setColor('#E74C3C')
                                .setThumbnail(member.user.displayAvatarURL());
                            logChannel.send({ embeds: [embed] });
                        }
                    }
                    return; // Para aqui, não manda boas-vindas se foi expulso
                }
            }

            // ====================================================
            // 👋 MÓDULO DE BOAS-VINDAS (Se não foi expulso)
            // ====================================================
            if (config && config.welcomeChannel) {
                const channel = guild.channels.cache.get(config.welcomeChannel);
                if (channel) {
                    const memberCount = guild.memberCount;
                    // Sufixo ordinal inglês
                    const getOrdinal = (n) => {
                        const s = ["th", "st", "nd", "rd"];
                        const v = n % 100;
                        return n + (s[(v - 20) % 10] || s[v] || s[0]);
                    };

                    const embed = new EmbedBuilder()
                        .setTitle(`👋 Bem-vindo(a) / Welcome, ${member.user.username}!`)
                        .setDescription(
                            `🇧🇷 **Olá <@${member.id}>!**\nSeja muito bem-vindo ao **${guild.name}**.\nVocê é o nosso **${memberCount}º** membro!\n\n` +
                            `🇺🇸 **Hello <@${member.id}>!**\nWelcome to **${guild.name}**.\nYou are our **${getOrdinal(memberCount)}** member!`
                        )
                        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
                        .setColor('#2ECC71')
                        .setImage(guild.bannerURL({ size: 1024 }) || null)
                        .setFooter({ text: `${guild.name}`, iconURL: guild.iconURL() })
                        .setTimestamp();

                    await channel.send({ content: `👋 <@${member.id}>`, embeds: [embed] });
                }
            }

        } catch (error) {
            console.error('[GUILD MEMBER ADD ERROR]', error);
        }
    },
};