module.exports = {
    async execute(interaction) {
        const serverId = parseInt(interaction.customId.split('_').pop());
        const msg = interaction.fields.getTextInputValue('msg_content');

        await interaction.client.db.rustServer.update({
            where: { id: serverId },
            data: { customWipeMessage: msg }
        });

        await interaction.reply({ content: '✅ Mensagem personalizada salva!', ephemeral: true });
    }
};