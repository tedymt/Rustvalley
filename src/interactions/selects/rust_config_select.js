const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const selected = interaction.values[0];

        // --- 1. CONFIGURAR DATA DO WIPE ---
        if (selected === 'set_wipe_date') {
            const modal = new ModalBuilder().setCustomId('modal_rust_date').setTitle('Data do Wipe / Wipe Date');
            const input = new TextInputBuilder()
                .setCustomId('wipe_date_input')
                .setLabel('Data/Hora (DD/MM/AAAA HH:MM)')
                .setPlaceholder('Ex: 25/12/2026 16:00')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(input));
            await interaction.showModal(modal);
        }

        // --- 2. CONFIGURAR IP/PORTA (Novo) ---
        if (selected === 'set_server_info') {
            const modal = new ModalBuilder().setCustomId('modal_rust_server').setTitle('Dados do Servidor / Server Data');
            const ipInput = new TextInputBuilder()
                .setCustomId('server_ip')
                .setLabel('IP do Servidor / Server IP')
                .setPlaceholder('Ex: 192.168.1.1')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);
            const portInput = new TextInputBuilder()
                .setCustomId('server_port')
                .setLabel('Porta / Port (Default: 28015)')
                .setValue('28015')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);
            
            modal.addComponents(
                new ActionRowBuilder().addComponents(ipInput),
                new ActionRowBuilder().addComponents(portInput)
            );
            await interaction.showModal(modal);
        }

        // --- 3. CONFIGURAR MENSAGEM ---
        if (selected === 'set_wipe_msg') {
            const modal = new ModalBuilder().setCustomId('modal_rust_msg').setTitle('Mensagem de Wipe / Wipe Msg');
            const input = new TextInputBuilder()
                .setCustomId('wipe_msg_input')
                .setLabel('Mensagem / Message')
                .setPlaceholder('{date} será substituído pela data.\n{time} pela hora.')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(input));
            await interaction.showModal(modal);
        }

        // --- 4. CONFIGURAR FUSO HORÁRIO ---
        if (selected === 'set_timezone') {
            const modal = new ModalBuilder().setCustomId('modal_rust_timezone').setTitle('Fuso Horário / Timezone');
            const input = new TextInputBuilder()
                .setCustomId('timezone_input')
                .setLabel('Timezone IANA')
                .setValue('America/Sao_Paulo')
                .setPlaceholder('Ex: Europe/London, UTC, America/New_York')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(input));
            await interaction.showModal(modal);
        }
    }
};