const moduleWelcome = require('../modules/module_welcome.js');
const moduleSuggestions = require('../modules/module_suggestions.js');
const moduleSecurity = require('../modules/module_security.js');
const moduleRoles = require('../modules/module_roles.js');
const moduleAutoResponse = require('../modules/module_auto_response.js');
const moduleGiveaway = require('../modules/module_giveaway.js');
const moduleTickets = require('../modules/module_tickets.js'); // <--- IMPORTANTE
const moduleMapVote = require('../modules/module_mapvote.js');
const moduleAnn = require('../modules/module_announcements.js');
module.exports = {
    async execute(interaction) {
        const choice = interaction.values[0];

        switch (choice) {
            case 'module_welcome':
                await moduleWelcome.execute(interaction);
                break;
            case 'module_suggestions':
                await moduleSuggestions.execute(interaction);
                break;
            case 'module_security':
                await moduleSecurity.execute(interaction);
                break;
            case 'module_roles_btn':
                await moduleRoles.execute(interaction);
                break;
            case 'module_auto_response_btn':
                await moduleAutoResponse.execute(interaction);
                break;
            case 'module_giveaway':
                await moduleGiveaway.execute(interaction);
                break;
            case 'module_tickets': // <--- ROTA NOVA
                await moduleTickets.execute(interaction);
                break;
            case 'module_mapvote': // <--- 2. ADICIONAR O CASE AQUI
                await moduleMapVote.execute(interaction);
                break;
            case 'module_announcements':
                await moduleAnn.execute(interaction);
                break;
            default:
                await interaction.reply({ content: '❌ Módulo não encontrado.', ephemeral: true });
        }
    }
};