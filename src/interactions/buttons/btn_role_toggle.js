const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    async execute(interaction) {
        const roleId = interaction.customId.replace('btn_role_toggle_', '');
        const role = interaction.guild.roles.cache.get(roleId);
        const member = interaction.member;

        if (!role) {
            return interaction.reply({ 
                content: '❌ **Erro:** Este cargo não existe mais.\n**Error:** This role no longer exists.', 
                ephemeral: true 
            });
        }

        // 1. Executa a Ação (Adicionar ou Remover)
        let action = '';
        if (member.roles.cache.has(roleId)) {
            await member.roles.remove(roleId);
            action = 'removed';
        } else {
            await member.roles.add(roleId);
            action = 'added';
        }

        // 2. Atualização Visual Inteligente (Sem depender do Cache Lento)
        const oldRows = interaction.message.components;
        const newRows = [];

        for (const row of oldRows) {
            const newRow = new ActionRowBuilder();
            
            for (const component of row.components) {
                // Clona o botão atual para não perder estilo/emoji
                const newBtn = ButtonBuilder.from(component);

                // Verifica se ESTE é o botão que foi clicado
                if (component.customId === interaction.customId) {
                    // Lógica de Regex para extrair o número atual do Label
                    // Formato esperado: "Nome do Cargo (10)"
                    // O Regex pega tudo antes do " (" como grupo 1, e os números dentro de "()" como grupo 2
                    const labelMatch = component.label.match(/^(.*) \((\d+)\)$/);
                    
                    if (labelMatch) {
                        const name = labelMatch[1]; // Parte do texto (ex: "Gamer")
                        let count = parseInt(labelMatch[2]); // Parte do número (ex: 10)

                        // Aplica a matemática instantânea
                        if (action === 'added') count++;
                        else if (action === 'removed') count = Math.max(0, count - 1); // Evita negativos

                        newBtn.setLabel(`${name} (${count})`);
                        
                        // Muda a cor visualmente para dar feedback IMEDIATO
                        // Se adicionou vira VERDE, se removeu volta pra CINZA (ou a cor padrão do painel)
                        // Isso ajuda o usuário a saber quais cargos ele TEM ativados.
                        newBtn.setStyle(action === 'added' ? ButtonStyle.Success : ButtonStyle.Secondary);
                    } else {
                        // Fallback: Se o botão não tinha contador antes (ex: primeira vez sendo clicado ou formato antigo)
                        // Se não tinha "(X)", assume que era 0 e agora é 1
                        const count = action === 'added' ? 1 : 0;
                        newBtn.setLabel(`${component.label} (${count})`);
                        newBtn.setStyle(action === 'added' ? ButtonStyle.Success : ButtonStyle.Secondary);
                    }
                }
                // Se não for o botão clicado, mantém EXATAMENTE igual para não bugar
                
                newRow.addComponents(newBtn);
            }
            newRows.push(newRow);
        }

        // 3. Atualiza o Botão na hora
        await interaction.update({ components: newRows });

        // 4. Mensagem Ephemeral Bilingue de confirmação
        const msgPT = action === 'added' ? `✅ **${role.name}** adicionado!` : `🗑️ **${role.name}** removido!`;
        const msgEN = action === 'added' ? `✅ **${role.name}** added!` : `🗑️ **${role.name}** removed!`;
            
        await interaction.followUp({ content: `🇧🇷 ${msgPT}\n🇺🇸 ${msgEN}`, ephemeral: true });
    }
};