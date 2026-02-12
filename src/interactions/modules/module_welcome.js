const { 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ChannelSelectMenuBuilder, 
    ChannelType,
    MessageFlags 
} = require('discord.js');

module.exports = {
    async execute(interaction) {
        const { guild, client } = interaction;

        // 1. Busca Configuração
        // Usamos upsert para garantir que o registro da guilda exista
        const config = await client.db.guild.upsert({
            where: { id: guild.id },
            update: {},
            create: { id: guild.id }
        });

        // 2. Monta o Embed de Status
        const embed = new EmbedBuilder()
            .setTitle('👋 Configuração de Boas-Vindas & Adeus')
            .setDescription('Defina onde o bot deve anunciar a entrada e saída de membros.')
            .addFields(
                { 
                    name: '📥 Canal de Boas-Vindas', 
                    value: config.welcomeChannel ? `<#${config.welcomeChannel}>` : '❌ Não configurado', 
                    inline: true 
                },
                { 
                    name: '📤 Canal de Saída', 
                    value: config.byeChannel ? `<#${config.byeChannel}>` : '❌ Não configurado', 
                    inline: true 
                }
            )
            .setColor('#2ECC71')
            .setFooter({ text: 'As mensagens são enviadas automaticamente em PT-BR e EN-US.' });

        // 3. Menus de Seleção
        const rowWelcome = new ActionRowBuilder().addComponents(
            new ChannelSelectMenuBuilder()
                .setCustomId('setup_welcome_channel')
                .setPlaceholder('Selecione o canal de Entrada...')
                .setChannelTypes(ChannelType.GuildText)
        );

        const rowBye = new ActionRowBuilder().addComponents(
            new ChannelSelectMenuBuilder()
                .setCustomId('setup_bye_channel')
                .setPlaceholder('Selecione o canal de Saída...')
                .setChannelTypes(ChannelType.GuildText)
        );

        // 4. Botões de Controle
        const rowButtons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('test_welcome') // Botão para testar sem precisar chamar gente
                .setLabel('Testar Mensagem')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('🧪'),
            new ButtonBuilder()
                .setCustomId('back_to_community') // Volta para o menu Comunidade
                .setLabel('Voltar')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('⬅️')
        );

        // 5. Envia
        if (interaction.isMessageComponent()) {
            await interaction.update({ embeds: [embed], components: [rowWelcome, rowBye, rowButtons] });
        } else {
            await interaction.reply({ embeds: [embed], components: [rowWelcome, rowBye, rowButtons], flags: MessageFlags.Ephemeral });
        }
    }
};