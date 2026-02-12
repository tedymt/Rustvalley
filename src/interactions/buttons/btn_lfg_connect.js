const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

// Armazena os cooldowns em memória: Chave = "UserID_TargetID", Valor = Timestamp de expiração
const cooldowns = new Map();

module.exports = {
    async execute(interaction) {
        // DETECÇÃO DE IDIOMA (Baseada no Título do Embed)
        // Se o título contiver "Procurando Time", é PT. Caso contrário (Looking for Team), é EN.
        const embedTitle = interaction.message.embeds[0]?.title || '';
        const isPT = embedTitle.includes('Procurando Time');

        // Textos Traduzidos
        const txtSelfConnect = isPT 
            ? '❌ Você não pode se conectar com você mesmo!' 
            : '❌ You cannot connect with yourself!';
        
        const txtCooldown = (min) => isPT 
            ? `⏳ **Calma lá!** Você já enviou um convite para este jogador recentemente. Aguarde **${min} minutos** para tentar de novo.`
            : `⏳ **Slow down!** You already sent a request to this player recently. Please wait **${min} minutes**.`;
        
        const txtDMSent = (targetId) => isPT
            ? `✅ **Sucesso!** Avisei <@${targetId}> na DM que você quer jogar.`
            : `✅ **Success!** I notified <@${targetId}> via DM that you want to play.`;
        
        const txtDMClosed = isPT
            ? '❌ **Ops!** A DM do usuário está fechada. Tente mencionar ele no chat.'
            : "❌ **Oops!** User's DMs are closed. Try pinging them in chat.";

        // --- LÓGICA PRINCIPAL ---

        const targetUserId = interaction.customId.split('_').pop();
        const interestedUser = interaction.user;

        // 1. Evita auto-clique
        if (targetUserId === interestedUser.id) {
            return interaction.reply({ content: txtSelfConnect, ephemeral: true });
        }

        // 2. SISTEMA DE COOLDOWN
        const cooldownKey = `${interestedUser.id}_${targetUserId}`;
        const cooldownTime = 20 * 60 * 1000; // 20 minutos

        if (cooldowns.has(cooldownKey)) {
            const expirationTime = cooldowns.get(cooldownKey);
            const now = Date.now();

            if (now < expirationTime) {
                const timeLeftMin = Math.ceil((expirationTime - now) / 1000 / 60);
                return interaction.reply({ content: txtCooldown(timeLeftMin), ephemeral: true });
            }
        }

        try {
            const targetUser = await interaction.client.users.fetch(targetUserId);
            const friendTag = interestedUser.discriminator === '0' ? interestedUser.username : interestedUser.tag;

            // Embed para a DM (Mantém bilingue ou adapta também? Geralmente DM é bom ser claro pra quem recebe)
            // Vou manter Bilingue na DM pra garantir que o RECEBEDOR entenda, independente da lingua do post
            // Mas o título adapta ao que o interessado viu.
            const dmEmbed = new EmbedBuilder()
                .setTitle(isPT ? '🤝 Novo Jogador Interessado!' : '🤝 New Teammate Request!')
                .setDescription(
                    isPT 
                    ? `O jogador **${interestedUser}** viu seu anúncio no **Team Finder** e quer jogar!`
                    : `The player **${interestedUser}** saw your LFG post and wants to play!`
                )
                .addFields(
                    { name: isPT ? '👤 Perfil' : '👤 Profile', value: `<@${interestedUser.id}>`, inline: true },
                    { name: '🆔 Discord ID', value: `\`${interestedUser.id}\``, inline: true },
                    { name: isPT ? '👋 Adicionar' : '👋 Add Friend', value: `\`${friendTag}\``, inline: false }
                )
                .setThumbnail(interestedUser.displayAvatarURL())
                .setColor('#E67E22')
                .setFooter({ text: 'Koda Manager • LFG System' })
                .setTimestamp();

            await targetUser.send({ embeds: [dmEmbed] });

            // 3. REGISTRA COOLDOWN
            cooldowns.set(cooldownKey, Date.now() + cooldownTime);
            setTimeout(() => cooldowns.delete(cooldownKey), cooldownTime);

            // Resposta para quem clicou (NO IDIOMA CORRETO)
            await interaction.reply({ content: txtDMSent(targetUserId), ephemeral: true });

        } catch (error) {
            console.error(error);
            await interaction.reply({ content: txtDMClosed, ephemeral: true });
        }
    }
};