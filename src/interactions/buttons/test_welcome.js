const eventWelcome = require('../../events/guildMemberAdd.js');

module.exports = {
    async execute(interaction) {
        // Simula a entrada usando o próprio membro que clicou
        await eventWelcome.execute(interaction.member);
        
        await interaction.reply({ 
            content: '✅ **Teste enviado!** Verifique o canal configurado.', 
            ephemeral: true 
        });
    }
};