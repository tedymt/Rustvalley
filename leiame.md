1. Introdução Executiva

O Koda Manager não é apenas um bot de moderação; é uma Plataforma de Gestão de Comunidades de Alta Performance, desenvolvida especificamente para servidores de jogos (com especialização em Rust) e comunidades internacionais.

Diferente de bots genéricos, o Koda opera sob uma arquitetura de Persistência de Dados Total e Inteligência Bilíngue, garantindo que a experiência seja fluida tanto para usuários brasileiros quanto para estrangeiros, sem necessidade de configurações duplicadas complexas.

2. O Diferencial: Inteligência Híbrida (PT-BR / EN-US) 🌎

O núcleo do Koda Manager foi construído para ser Nativamente Global.



Detecção Contextual: O sistema não apenas traduz botões. Ele entende o fluxo. Se um módulo é iniciado em um canal configurado como internacional, toda a interface (botões, modais, respostas) se adapta instantaneamente para o Inglês.

Gatilhos Inteligentes (Auto-Response):

O sistema de Respostas Automáticas possui uma camada de detecção agnóstica.

Exemplo Prático: Se o Admin configura um gatilho para a palavra "loja" o bot ja salva automaticamente o gatilho e a repsosta em EN tambem, assim se o usuario mandar "store" no chat o bot o repsonde em EN pois tem este gatilho configurado mesmo que seja so em PT.

Interfaces Espelhadas: Módulos como o Team Finder (LFG) e Sugestões geram interfaces duplas (PT/EN) simultaneamente, permitindo que comunidades mistas convivam no mesmo ecossistema sem barreiras linguísticas.

3. Módulo RUST SENTINEL (O Coração do Sistema) ☢️

O Koda possui um monitoramento de servidores Rust , operando com redundância de APIs.



3.1. Monitoramento em Tempo Real "Anti-Flood"

Ciclo de Verificação: 60 segundos.

Lógica de Estado: O bot utiliza uma memória de estado comparativa. Ele jamais spama o canal de logs. Ele só envia notificações se houver uma alteração real de estado (De Online para Offline e vice-versa).

API Fallback (Redundância): O sistema consulta primeiramente via protocolo GameDig. Se houver falha ou bloqueio, ele alterna automaticamente para a API Global da Steam. Isso elimina os "falsos positivos" de servidor offline.

3.2. Ecossistema de Wipe Automatizado

Auto-Announce: O bot detecta a data configurada para o Wipe. Quando o momento chega, ele dispara automaticamente um anúncio visual (Embed) com o IP de conexão e instruções.

Smart Countdown: Uma mensagem fixa que se atualiza sozinha, mostrando a contagem regressiva: "Wipe em 2 dias, 4 horas e 30 minutos".

3.3. Team Finder (LFG) Vitrine

Banner Configurável: O administrador tem total controle visual, podendo definir um banner personalizado que aparece no topo da vitrine de busca de grupos.

Separação de Idiomas: O sistema organiza automaticamente postagens de jogadores BR e Gringos em canais distintos para manter a organização.

4. Gestão e Engajamento

📢 Agendador de Anúncios (Persistência Total)



Fluxo Blindado: O administrador pode escrever o texto, definir a imagem, alternar o ping @everyone e mudar de abas sem perder o que escreveu.

Agendamento Cronológico: Permite agendar disparos para datas futuras com precisão de minutos.

Recorrência: O anúncio pode ser configurado para se repetir automaticamente a cada X dias (ex: Anúncio de VIP a cada 3 dias).

🎫 Sistema de Tickets Avançado

Transcripts em HTML: Ao fechar um ticket, o bot gera um arquivo HTML completo, visualmente idêntico ao Discord (com avatares, imagens e emojis), garantindo auditoria perfeita.

Painel de Controle: Botões para a Staff assumir o ticket, adicionar membros, renomear ou deletar com um clique.

🎉 Sorteios (Giveaways)

Sistema autônomo que gerencia o tempo, sorteia o vencedor de forma justa e permite "Reroll" (resortear) caso o ganhador não esteja presente.

🗳️ Votação de Mapas (Map Vote)

Sistema visual onde o admin cadastra as opções de mapas (com imagens) e o bot gera uma votação interativa. O resultado é calculado e exibido em tempo real.

5. Segurança e Moderação Automática 🛡️

O Koda atua como um guardião 24/7 do servidor.



Anti-Fake (Account Age): Expulsa automaticamente contas criadas há menos de X dias (configurável), prevenindo raids e contas descartáveis.

Filtros de Chat:

Anti-Link: Bloqueia links não autorizados.

Anti-MassMention: Previne que usuários marquem muitas pessoas ou cargos.

Anti-Toxic: Filtro de palavras proibidas.

Logs de Auditoria: Tudo o que o bot faz (do banimento à edição de um ticket) é registrado em um canal seguro.



Sistema de auto cargos completo.



Sistema de Boas vindas/Adeus completo.

6. Arquitetura Técnica (Backend)

Para garantir que tudo isso funcione sem "lags" ou quedas:



Database: PostgreSQL gerenciado via Prisma ORM. Dados relacionais robustos.

Event-Driven: O bot não "dorme". Ele reage a eventos (cliques, mensagens, entradas de membros) em milissegundos.

Centralized Handler: Todo clique em botão passa por um roteador central inteligente (interactionCreate.js), que valida a origem, o estado e redireciona para o módulo correto, impedindo o erro de "Interação Falhou".

Conclusão

O Koda Manager entrega uma solução "All-in-One". Ele substitui a necessidade de contratar 7 bots diferentes (um para Ticket, um para Rust, um para Sorteio, etc.). Ele centraliza a gestão com profissionalismo, estética refinada e inteligência de adaptação linguística para comunidades globais, todos os serviços fornecidos pelo bot possuem a adaptação para as duas linguas.