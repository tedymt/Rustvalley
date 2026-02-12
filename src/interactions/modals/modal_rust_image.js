const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { EmbedBuilder } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const parts = interaction.customId.split('_');
        const serverId = parseInt(parts[parts.length - 1]);
        const imageUrl = interaction.fields.getTextInputValue('image_url');

        // Validação simples
        if (!imageUrl.startsWith('http')) {
            return interaction.reply({ content: '❌ Link inválido. Use um link direto (http/https).', ephemeral: true });
        }

        // Salva no banco
        await prisma.rustServer.update({
            where: { id: serverId },
            data: { imageUrl: imageUrl }
        });

        const embed = new EmbedBuilder()
            .setTitle('✅ Banner Atualizado')
            .setDescription(`A imagem de Wipe foi salva com sucesso!\n\n**Preview:**`)
            .setImage(imageUrl)
            .setColor('#2ECC71');

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};