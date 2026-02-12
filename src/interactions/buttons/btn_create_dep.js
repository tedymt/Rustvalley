const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, MessageFlags } = require('discord.js');

module.exports = {
    async execute(interaction) {
        // Verifica limite de segurança
        const count = await interaction.client.db.department.count({ 
            where: { guildId: interaction.guild.id } 
        });

        if (count >= 5) {
            return interaction.reply({ 
                content: '❌ **Limite de departamentos atingido (5/5).** Exclua um para criar outro.', 
                flags: MessageFlags.Ephemeral 
            });
        }

        const modal = new ModalBuilder()
            .setCustomId('modal_create_dep')
            .setTitle('Novo Departamento / New Dept');

        const nameInput = new TextInputBuilder()
            .setCustomId('dep_name')
            .setLabel("Nome (Ex: Financeiro)")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const emojiInput = new TextInputBuilder()
            .setCustomId('dep_emoji')
            .setLabel("Emoji (Ex: 💰)")
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('🎫')
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(nameInput),
            new ActionRowBuilder().addComponents(emojiInput)
        );

        await interaction.showModal(modal);
    }
};