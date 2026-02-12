const i18next = require('i18next');

const translations = {
    'pt-BR': {
        WELCOME_DASHBOARD: "Bem-vindo ao Painel Rustvalley Manager",
        SELECT_MODULE: "Selecione um módulo para configurar",
        RUST_CONFIG: "Configurações de Rust"
    },
    'en-US': {
        WELCOME_DASHBOARD: "Welcome to Rustvalley Manager Dashboard",
        SELECT_MODULE: "Select a module to configure",
        RUST_CONFIG: "Rust Settings"
    }
};

i18next.init({
    lng: 'pt-BR', // padrão
    fallbackLng: 'en-US',
    resources: {
        'pt-BR': { translation: translations['pt-BR'] },
        'en-US': { translation: translations['en-US'] }
    }
});

module.exports = i18next;