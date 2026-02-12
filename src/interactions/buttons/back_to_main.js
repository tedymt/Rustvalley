const command = require('../../commands/admin/Rustvalleymanager.js');

module.exports = {
    async execute(interaction) {
        // Reutiliza a lógica do comando principal, mas forçando um update
        // Precisamos adaptar levemente o execute do Rustvalleymanager ou replicar a lógica aqui:
        
        // Simplesmente chamamos o comando principal, mas tratamos como update
        // Nota: O comando original usa reply, aqui faremos update manual para ficar fluido.
        
        const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
        const lang = interaction.locale === 'pt-BR' ? 'pt-BR' : 'en-US';

        const embed = new EmbedBuilder()
            .setTitle(`🛰️ Rustvalley Manager | Painel de Controle`)
            .setDescription('Bem-vindo à cabine de comando. Selecione um módulo abaixo.')
            .setColor('#2b2d31')
            .setFooter({ text: 'Rustvalley Studios - Indestructible System' });

        const menu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select_module')
                .setPlaceholder('Escolha um módulo...')
                .addOptions([
                    { label: 'Módulo Rust', value: 'module_rust', emoji: '☢️' },
                    { label: 'Segurança', value: 'module_security', emoji: '🛡️' },
                    { label: 'Comunidade', value: 'module_community', emoji: '🎫' },
                ]),
        );

        await interaction.update({ embeds: [embed], components: [menu] });
    }
};