const moduleAutoResponse = require('../modules/module_auto_response.js');
const translate = require('@iamtraction/google-translate'); // A biblioteca mágica

module.exports = {
    async execute(interaction) {
        // 1. Avisa que está pensando (Tradução pode levar 1-2 segundos)
        await interaction.deferUpdate(); 

        const triggerPT = interaction.fields.getTextInputValue('trigger').toLowerCase();
        const responsePT = interaction.fields.getTextInputValue('response_pt');

        try {
            // 2. TRADUÇÃO AUTOMÁTICA (A Mágica) 🪄
            // Traduz o Gatilho (PT -> EN)
            const resTrigger = await translate(triggerPT, { from: 'pt', to: 'en' });
            const triggerEN = resTrigger.text.toLowerCase();

            // Traduz a Resposta (PT -> EN)
            const resResponse = await translate(responsePT, { from: 'pt', to: 'en' });
            const responseEN = resResponse.text;

            // 3. Verifica Duplicidade (Check duplo)
            const existing = await interaction.client.db.autoResponse.findFirst({
                where: { 
                    guildId: interaction.guild.id,
                    OR: [
                        { trigger: triggerPT },
                        { triggerEN: triggerEN }
                    ]
                }
            });

            if (existing) {
                return interaction.followUp({ content: `❌ Já existe um gatilho para **"${triggerPT}"** (ou sua tradução **"${triggerEN}"**)!`, ephemeral: true });
            }

            // 4. Salva tudo no Banco
            await interaction.client.db.autoResponse.create({
                data: {
                    guildId: interaction.guild.id,
                    trigger: triggerPT,
                    triggerEN: triggerEN,
                    responsePT: responsePT,
                    responseEN: responseEN
                }
            });

            // 5. Sucesso com Relatório
            await interaction.followUp({ 
                content: `✅ **Resposta Criada com Inteligência!**\n🇧🇷 PT: \`${triggerPT}\`\n🇺🇸 EN: \`${triggerEN}\` (Traduzido)`, 
                ephemeral: true 
            });

            // Recarrega o Painel
            await moduleAutoResponse.execute(interaction);

        } catch (error) {
            console.error(error);
            return interaction.followUp({ content: '❌ Erro ao traduzir. Verifique sua conexão ou tente novamente.', ephemeral: true });
        }
    }
};