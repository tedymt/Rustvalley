require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes, Events } = require('discord.js');
const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process'); // Módulo para rodar comandos do terminal
const fs = require('fs');
const path = require('path');
const giveawayMonitor = require('./src/jobs/giveaway_monitor.js');
// --- AUTO-SYNC DO BANCO DE DADOS ---

console.log('\n🔄 Verificando integridade do Banco de Dados...');
try {
    // Força a criação das tabelas antes do bot iniciar
    execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
    console.log('✅ Tabelas sincronizadas com sucesso!\n');
} catch (error) {
    console.error('❌ Erro crítico ao sincronizar tabelas:', error.message);
}
// -----------------------------------

const prisma = new PrismaClient();
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.db = prisma;
client.commands = new Collection();

/**
 * 🛠️ HANDLER DE COMANDOS
 */
const foldersPath = path.join(__dirname, 'src', 'commands');

if (fs.existsSync(foldersPath)) {
    const commandFolders = fs.readdirSync(foldersPath);
    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        if (fs.statSync(commandsPath).isDirectory()) {
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const command = require(path.join(commandsPath, file));
                if ('data' in command && 'execute' in command) {
                    client.commands.set(command.data.name, command);
                }
            }
        }
    }
} else {
    console.warn('⚠️ A pasta src/commands não foi encontrada!');
}

/**
 * 📡 HANDLER DE EVENTOS
 */
const eventsPath = path.join(__dirname, 'src', 'events');

if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const event = require(path.join(eventsPath, file));
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
}

/**
 * 🚀 DEPLOY DE COMANDOS
 */
client.once(Events.ClientReady, async () => {
    giveawayMonitor.execute(client);
    console.log(`\x1b[32m🚀 Nave Espacial Conectada: ${client.user.tag}\x1b[0m`);
    
    const commandsData = client.commands.map(c => c.data.toJSON());
    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    try {
        if (process.env.GUILD_ID) {
            await rest.put(
                Routes.applicationGuildCommands(client.user.id, process.env.GUILD_ID),
                { body: commandsData },
            );
            console.log(`✅ Comandos registrados na Guilda de Teste: ${process.env.GUILD_ID}`);
        } else {
            await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: commandsData },
            );
            console.log(`✅ Comandos registrados GLOBALMENTE.`);
        }
    } catch (error) {
        console.error('❌ Erro ao registrar comandos:', error);
    }
});

process.on('unhandledRejection', error => {
    console.error('❌ Erro não tratado:', error);
});

client.login(process.env.TOKEN);