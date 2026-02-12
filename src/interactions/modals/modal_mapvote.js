const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const urlA = interaction.fields.getTextInputValue('map_a_url');
        const urlB = interaction.fields.getTextInputValue('map_b_url');
        const urlC = interaction.fields.getTextInputValue('map_c_url');
        const namesInput = interaction.fields.getTextInputValue('map_names');

        // Validação de Links
        if (!urlA.startsWith('http') || !urlB.startsWith('http')) {
            return interaction.reply({ content: '❌ URLs inválidas. Use links diretos de imagem.', ephemeral: true });
        }
        // Se C foi preenchido, valida ele também
        if (urlC && !urlC.startsWith('http')) {
            return interaction.reply({ content: '❌ URL do Mapa C inválida.', ephemeral: true });
        }

        // Processa os nomes (separa por vírgula)
        const names = namesInput.split(',').map(n => n.trim());
        const nameA = names[0] || 'Mapa A';
        const nameB = names[1] || 'Mapa B';
        const nameC = names[2] || 'Mapa C';

        // --- MONTAGEM DA VITRINE ---
        
        // 1. Cabeçalho
        const embedHeader = new EmbedBuilder()
            .setTitle('🗳️ Votação de Mapa / Map Vote')
            .setDescription('**Escolham o próximo mapa! / Choose the next map!**')
            .setColor('#FFFFFF');

        // 2. Mapas
        // Usamos cores diferentes para diferenciar bem
        const embedA = new EmbedBuilder().setTitle(`🇦 ${nameA}`).setImage(urlA).setColor('#3498DB'); // Azul
        const embedB = new EmbedBuilder().setTitle(`🇧 ${nameB}`).setImage(urlB).setColor('#E74C3C'); // Vermelho
        
        const embeds = [embedHeader, embedA, embedB];
        
        // Adiciona C se existir
        if (urlC) {
            const embedC = new EmbedBuilder().setTitle(`🇨 ${nameC}`).setImage(urlC).setColor('#2ECC71'); // Verde
            embeds.push(embedC);
        }

        // Envia a mensagem (pode demorar um pouquinho para carregar as imagens)
        const message = await interaction.channel.send({ embeds: embeds });

        // --- SALVA NO BANCO ---
        const poll = await interaction.client.db.mapPoll.create({
            data: {
                guildId: interaction.guild.id,
                channelId: interaction.channel.id,
                messageId: message.id,
                mapA_Name: nameA, mapA_Url: urlA,
                mapB_Name: nameB, mapB_Url: urlB,
                mapC_Name: urlC ? nameC : null,
                mapC_Url: urlC ? urlC : null
            }
        });

        // --- BOTÕES DE VOTO (COM EMOJIS VÁLIDOS) ---
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId(`btn_mapvote_A_${poll.id}`).setLabel(`Vote ${nameA} (0)`).setStyle(ButtonStyle.Primary).setEmoji('🇦'),
            new ButtonBuilder().setCustomId(`btn_mapvote_B_${poll.id}`).setLabel(`Vote ${nameB} (0)`).setStyle(ButtonStyle.Danger).setEmoji('🇧')
        );

        // Adiciona o botão C apenas se a imagem C foi fornecida
        if (urlC) {
            row.addComponents(
                new ButtonBuilder().setCustomId(`btn_mapvote_C_${poll.id}`).setLabel(`Vote ${nameC} (0)`).setStyle(ButtonStyle.Success).setEmoji('🇨')
            );
        }

        await message.edit({ components: [row] });
        await interaction.reply({ content: '✅ Votação criada com sucesso!', ephemeral: true });
    } 
};
