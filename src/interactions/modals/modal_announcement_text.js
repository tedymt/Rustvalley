module.exports = {
    async execute(interaction) {
        const title = interaction.fields.getTextInputValue('ann_title');
        const content = interaction.fields.getTextInputValue('ann_content');

        // Salvamos temporariamente num objeto ou passamos de volta pro execute
        const moduleAnn = require('../modules/module_announcements.js');
        await moduleAnn.execute(interaction, {
            title: title,
            content: content,
            mention: false,
            channel: null
        });
    }
};