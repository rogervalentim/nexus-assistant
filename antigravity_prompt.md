# Prompt de Desenvolvimento para o Google Antigravity / IA Coders

Você é um Engenheiro de Software Sênior e Especialista em IA / LLM Engineering. Sua tarefa é implementar o projeto **Nexo Assist**, um agent de atendimento para o service desk de TI da empresa Nexo, seguindo estritamente as especificações do PRD e o SPEC técnico abaixo.

## Contexto do Desafio
A Nexo possui cerca de 2.000 funcionários. O Nexo Assist automatiza o atendimento via chat, permitindo tirar dúvidas na central de ajuda, consultar/criar/atualizar chamados e transferir conversas para analistas humanos quando necessário. O grande foco e diferencial do desafio é a **Transparência de Decisões** (exibir visibilidade clara das ações e do raciocínio do agente em cada resposta).

## Stack Tecnológica Obrigatória
- **Linguagem:** TypeScript (tipagem estrita).
- **Framework:** Next.js (App Router) + Tailwind CSS.
- **Agent Framework:** Mastra (ou LangGraph.js).
- **Persistência:** Camada de dados separada simulando o backend legado (com persistência sobrevivendo a reinicializações).

## Instruções de Implementação por Fases

1. **Estrutura Base e Dados Simulados:**
   - Crie a massa de dados inicial (funcionários, chamados legados e central de ajuda).
   - Configure a camada de persistência para chamados e conversas.

2. **Ferramentas (*Tools*) do Agente:**
   - Implemente as tools tipadas: busca na central de ajuda, consulta de chamados por e-mail, criação e atualização de chamados, e escalonamento para analista.

3. **Orquestração e Regras do Agente:**
   - Configure o agente com system prompt robusto aplicando as regras de service desk, isolamento de dados por funcionário e limite de 30 mensagens por sessão.

4. **Interface do Usuário (Next.js):**
   - **Tela 1:** Login com e-mail corporativo.
   - **Telas 2 e 3 (Chat do Funcionário):** Chat em tempo real, cards de chamados, rascunhos de confirmação e o **Painel de Transparência de Decisões** (mostrando as ações do agente e permitindo inspecionar o raciocínio detalhado).
   - **Telas 4 e 5 (Console do Analista):** Lista de conversas aguardando, histórico, botão para assumir atendimento (pausando o agente), devolver ou encerrar.

5. **Qualidade e Resiliência:**
   - Simule instabilidades pontuais no serviço de chamados para testar o tratamento de erros do agente.
   - Forneça um `README.md` completo com instruções de instalação, variáveis de ambiente (`.env.example`) e justificativas arquiteturais.

Por favor, comece estruturando os arquivos do projeto de forma limpa e modular.
