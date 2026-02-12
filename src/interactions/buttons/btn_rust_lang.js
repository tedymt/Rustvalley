module.exports = {
    async execute(interaction) {
        // ID: btn_rust_lang_PT_15
        const parts = interaction.customId.split('_');
        const lang = parts[3]; // PT ou EN
        const serverId = parseInt(parts[4]);

        await interaction.client.db.rustServer.update({
            where: { id: serverId },
            data: { language: lang }
        });

        await interaction.update({ 
            content: `✅ **Configuração Salva!**\nO servidor enviará anúncios no canal configurado em **${lang}**.`, 
            embeds: [], 
            components: [] 
        });
    }
};