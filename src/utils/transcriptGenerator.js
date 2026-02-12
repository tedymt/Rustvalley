const discordTranscripts = require('discord-html-transcripts');
const { AttachmentBuilder } = require('discord.js');

async function generateTranscript(channel, guild) {
    try {
        // 1. Gera o HTML base usando a biblioteca
        const rawAttachment = await discordTranscripts.createTranscript(channel, {
            limit: -1, // Salva todas as mensagens
            fileName: `ticket-${channel.name}.html`,
            poweredBy: false, 
            saveImages: true,
            footerText: `Exportado por Rustvalley Manager • ${guild.name}`,
            headerText: `Ticket: ${channel.name}`, 
            headerColor: '#2B2D31' 
        });

        // 2. PROCESSAMENTO PREMIUM (Injeção de HTML/CSS Personalizado)
        let html = rawAttachment.attachment.toString();

        // Dados para o cabeçalho (BLINDAGEM: Verifica se iconURL é função)
        const guildIcon = (guild.iconURL && typeof guild.iconURL === 'function') 
            ? guild.iconURL({ extension: 'png', size: 128 }) 
            : 'https://cdn.discordapp.com/embed/avatars/0.png';
            
        const guildName = guild.name || 'Servidor';
        const ticketName = channel.name;
        const exportDate = new Date().toLocaleString('pt-BR');

        // CSS Personalizado
        const customStyles = `
            <style>
                discord-header { display: none !important; } 
                .Rustvalley-premium-header {
                    background-color: #2B2D31;
                    border-bottom: 4px solid #5865F2;
                    padding: 25px;
                    display: flex;
                    align-items: center;
                    font-family: 'gg sans', 'Segoe UI', Tahoma, Verdana, sans-serif;
                    margin-bottom: 20px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                }
                .Rustvalley-guild-icon {
                    width: 80px; height: 80px; border-radius: 50%;
                    border: 3px solid #5865F2; margin-right: 20px; object-fit: cover;
                }
                .Rustvalley-info { flex-grow: 1; }
                .Rustvalley-guild-name { color: #FFFFFF; font-size: 24px; font-weight: 800; margin: 0; }
                .Rustvalley-ticket-name { color: #B9BBBE; font-size: 16px; margin-top: 5px; }
                .Rustvalley-meta { text-align: right; color: #72767D; font-size: 12px; }
                .Rustvalley-badge { background: #5865F2; color: white; padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; }
            </style>
        `;

        // HTML do Cabeçalho
        const customHeaderHTML = `
            <div class="Rustvalley-premium-header">
                <img src="${guildIcon}" class="Rustvalley-guild-icon" alt="Icon">
                <div class="Rustvalley-info">
                    <h1 class="Rustvalley-guild-name">${guildName}</h1>
                    <div class="Rustvalley-ticket-name">📂 Ticket: <b>${ticketName}</b></div>
                </div>
                <div class="Rustvalley-meta">
                    <span class="Rustvalley-badge">TRANSCRIPT OFICIAL</span><br><br>
                    Gerado em: ${exportDate}
                </div>
            </div>
        `;

        // Injeta o código
        html = html.replace('</head>', `${customStyles}</head>`);
        html = html.replace('<body>', `<body>${customHeaderHTML}`);

        // Reconstrói o arquivo
        return new AttachmentBuilder(Buffer.from(html), { 
            name: `transcript-${channel.name}.html` 
        });

    } catch (error) {
        console.error('[Transcript] Erro ao gerar versão premium:', error);
        return null;
    }
}

module.exports = { generateTranscript };