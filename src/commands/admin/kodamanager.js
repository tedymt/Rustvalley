const { 
    SlashCommandBuilder, 
    EmbedBuilder, 
    ActionRowBuilder, 
    StringSelectMenuBuilder, 
    PermissionFlagsBits,
    MessageFlags // Importante para corrigir o aviso
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kodamanager')
        .setDescription('Painel Central do Koda Manager / Central Dashboard')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const lang = interaction.locale === 'pt-BR' ? 'pt-BR' : 'en-US';
        
        try {
            // Tenta criar/atualizar o registro da guilda no banco
            await interaction.client.db.guild.upsert({
                where: { id: interaction.guild.id },
                update: {},
                create: { id: interaction.guild.id, language: lang }
            });
        } catch (error) {
            console.error('[DB ERROR]', error);
            // Se der erro, tenta avisar (mas não trava o bot)
            return interaction.reply({ 
                content: '❌ **Erro de Banco de Dados:** As tabelas ainda não foram criadas. Reinicie o bot na DisCloud para rodar o `db push`.',
                flags: MessageFlags.Ephemeral
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`🛰️ Koda Manager | ${lang === 'pt-BR' ? 'Painel de Controle' : 'Control Panel'}`)
            .setDescription(lang === 'pt-BR' 
                ? 'Bem-vindo à cabine de comando. Selecione um módulo abaixo para configurar as funções do servidor.' 
                : 'Welcome to the cockpit. Select a module below to configure server functions.')
            .setColor('#2b2d31')
            .setFooter({ text: 'Koda Studios - Indestructible System' });

        const menu = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('select_module')
                    .setPlaceholder(lang === 'pt-BR' ? 'Escolha um módulo...' : 'Choose a module...')
                    .addOptions([
                        {
                            label: lang === 'pt-BR' ? 'Módulo Rust' : 'Rust Module',
                            description: lang === 'pt-BR' ? 'Configurar Wipes e Contadores' : 'Setup Wipes and Counters',
                            value: 'module_rust',
                            emoji: '☢️',
                        },
                        {
                            label: lang === 'pt-BR' ? 'Segurança' : 'Security',
                            description: lang === 'pt-BR' ? 'Anti-Link, Anti-Smurf e Logs' : 'Anti-Link, Anti-Smurf and Logs',
                            value: 'module_security',
                            emoji: '🛡️',
                        },
                        {
                            label: lang === 'pt-BR' ? 'Comunidade' : 'Community',
                            description: lang === 'pt-BR' ? 'Sugestões, Boas-vindas e Tickets' : 'Suggestions, Welcome and Tickets',
                            value: 'module_community',
                            emoji: '🎫',
                        },
                    ]),
            );

        // CORREÇÃO: Usando flags em vez de ephemeral: true
        await interaction.reply({ 
            embeds: [embed], 
            components: [menu], 
            flags: MessageFlags.Ephemeral 
        });
    },
};