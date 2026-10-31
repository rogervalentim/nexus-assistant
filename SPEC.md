# Especificação Técnica (SPEC) - Nexo Assist

## 1. Visão Geral do Projeto
O **Nexo Assist** é um assistente virtual inteligente baseado em agentes para o service desk de TI da empresa Nexo (~2.000 funcionários). O objetivo é automatizar a triagem de chamados, resolver dúvidas comuns de forma autônoma utilizando uma central de ajuda, classificar prioridades corretamente, evitar duplicidades e transferir casos complexos para o console do analista humano com todo o contexto necessário.

---

## 2. Requisitos Funcionais

### A. Módulo de Autenticação (Tela 1)
* Login simples utilizando e-mail corporativo (`@nexo.com.br`) e qualquer senha de teste, validando contra a massa de dados de funcionários.

### B. Chat do Funcionário (Telas 2 e 3)
* Interface conversacional em tempo real.
* **Transparência de Decisões (Diferencial Crítico):** Acima de cada resposta do agente, exibir um bloco ou card indicando as ações tomadas em tempo real (ex: *"consultou seus chamados"*, *"classificou a prioridade"*).
* **Painel de Detalhes:** Capacidade de expandir para inspecionar o raciocínio do agente, grau de confiança, ações executadas e ferramentas acionadas.
* Recursos interativos: Cards de chamados abertos, rascunhos para confirmação antes de criar/atualizar chamados, perguntas com opções rápidas e limite estrito de **30 mensagens por sessão**.

### C. O Agente (Cérebro)
* Desenvolvido com **Mastra** (preferência) ou LangGraph.js.
* Segue regras de negócio rigorosas de service desk (Anexo A do PRD): isolamento estrito de dados (um funcionário nunca acessa chamados de outro), detecção de duplicidade, classificação correta de tipo, categoria e prioridade.
* Ferramentas (*Tools*) disponíveis para o agente:
  1. `searchHelpCenter(query)`: Consulta a base de conhecimento.
  2. `getUserTickets(userEmail)`: Lista chamados do usuário logado.
  3. `createTicket(payload)`: Abre um novo chamado validando os dados com o usuário.
  4. `updateTicket(ticketId, info)`: Atualiza chamado existente.
  5. `escalateToAnalyst(reason)`: Transfere o atendimento para o suporte humano.

### D. Serviço de Chamados Simulado
* Backend/Módulo independente do agente.
* Gerencia os dados de exemplo (Anexo B do PRD): funcionários, chamados e base de conhecimento.
* Permite consultar, criar, atualizar e transferir chamados.
* **Resiliência:** Simulação ocasional de instabilidade (latência ou falha temporária) para testar o tratamento de erros do agente.
* **Persistência:** Conversas, chamados e estados de atendimento devem sobreviver a um reinício da aplicação (armazenamento persistente leve, ex: SQLite/Prisma ou JSON estruturado em disco).

### E. Console do Analista (Telas 4 e 5)
* Tela dedicada para suporte N1/N2.
* Lista de conversas aguardando atendimento com filtros e status.
* Histórico completo da conversa e visualização dos chamados do funcionário.
* Ações: **Assumir atendimento** (pausando o agente automaticamente), **devolver ao agente** ou **encerrar**.

---

## 3. Requisitos Técnicos
* **Linguagem:** TypeScript com tipagem estrita (`strict: true`).
* **Framework:** Next.js (App Router) + Tailwind CSS.
* **Orquestração de Agente:** Mastra ou LangGraph.js.
* **Modelo LLM:** Configurável via variáveis de ambiente (`.env.example`), com justificativa no `README`.
* **Execução Local:** Inicialização rápida com comandos padronizados documentados no `README`.
