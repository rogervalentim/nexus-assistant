# Nexo Assist

> Assistente virtual inteligente para o service desk de TI da empresa Nexo.

## 🎯 Visão Geral

O **Nexo Assist** automatiza o atendimento via chat para os ~2.000 funcionários da Nexo, permitindo:

- 💬 **Chat conversacional** com agente de IA em tempo real
- 🔍 **Consulta à base de conhecimento** de TI
- 📋 **Gerenciamento de chamados** (consultar, criar, atualizar)
- 🔬 **Transparência de Decisões** — visibilidade completa das ações e raciocínio do agente
- 👤 **Console do Analista** — gestão de conversas escalonadas para suporte humano

## 🚀 Instalação e Execução

### Pré-requisitos

- Node.js 18+ (recomendado: 20+)
- Uma chave de API da OpenAI (ou API compatível)

### Passo a Passo

```bash
# 1. Clone e acesse o projeto
cd nexo-assistant

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local e adicione sua OPENAI_API_KEY

# 4. Inicie o servidor de desenvolvimento
npm run dev

# 5. Acesse em http://localhost:3000
```

### Contas de Teste

| E-mail | Perfil |
|--------|--------|
| `ana.souza@nexo.com.br` | Funcionária (Financeiro) — tem chamados abertos |
| `bruno.melo@nexo.com.br` | Funcionário (Comercial) |
| `carla.dias@nexo.com.br` | Funcionária (RH) |
| `diego.lima@nexo.com.br` | Funcionário (TI) |
| `elena.castro@nexo.com.br` | Funcionária (Marketing) |
| `ricardo.andrade@nexo.com.br` | **Analista N1** (acesso ao Console) |
| `mariana.figueiredo@nexo.com.br` | **Analista N2** (acesso ao Console) |

> **Senha:** qualquer texto não-vazio é aceito (modo de teste).

## 📁 Estrutura do Projeto

```
nexo-assistant/
├── app/                    # Next.js App Router
│   ├── login/              # Tela 1: Login
│   ├── chat/               # Telas 2+3: Chat do Funcionário
│   ├── analyst/            # Telas 4+5: Console do Analista
│   └── api/
│       ├── auth/           # POST /api/auth
│       ├── chat/           # POST /api/chat (SSE streaming)
│       ├── tickets/        # CRUD de chamados
│       └── sessions/       # CRUD de sessões/conversas
│
├── lib/                    # Lógica de servidor
│   ├── types.ts            # Tipos TypeScript compartilhados
│   ├── data/
│   │   ├── seed.ts         # Dados iniciais (funcionários, chamados, KB)
│   │   └── store.ts        # Persistência desacoplada em memória (globalThis)
│   ├── agent/
│   │   ├── tools.ts        # Ferramentas do agente (tipadas com Zod)
│   │   ├── prompt.ts       # System prompt com regras de negócio
│   │   └── simulator.ts    # Agente autônomo simulador (fallback resiliente)
│   └── ticket-service.ts   # Serviço de chamados (com injeção de falhas)
│
├── components/             # Componentes React (Client Components)
│   ├── login/
│   ├── chat/
│   │   ├── ChatPageClient.tsx    # Chat principal com streaming e "Nova Conversa"
│   │   ├── TransparencyPanel.tsx # ⭐ Painel de Transparência
│   │   ├── ConfirmDraft.tsx      # Confirmação interativa de chamados
│   │   └── TicketCard.tsx        # Cards de chamados
│   └── analyst/
│       └── AnalystPageClient.tsx # Console do analista
```

## ✨ Funcionalidades Principais

### 🔬 Painel de Transparência de Decisões (Diferencial)

Cada resposta do agente exibe:
- **Cards de ação** acima da mensagem mostrando quais ferramentas foram acionadas em tempo real
- **Tempo de execução** de cada ferramenta
- **Botão "Inspecionar"** para abrir painel lateral com:
  - Entrada e saída de cada ferramenta
  - Status (sucesso/falha)
  - Mensagens de erro (quando há falha simulada)

### 🛡️ Regras de Segurança e Negócio

- **Isolamento de dados**: Cada funcionário só acessa seus próprios chamados
- **Detecção de duplicatas**: O agente verifica chamados similares antes de criar novos
- **Rascunhos de confirmação**: Toda criação/atualização passa por confirmação do usuário
- **Limite de sessão**: 30 mensagens por sessão com aviso aos 25
- **Classificação inteligente**: Tipo (incidente/solicitação/problema/mudança) e prioridade (baixa/média/alta/crítica)

### 🔁 Resiliência e Tratamento de Erros

O `ticket-service.ts` injeta instabilidades simuladas aleatórias (~10% das chamadas):
- Erros de indisponibilidade temporária
- Latência extra (simulando timeout)

O agente trata esses erros graciosamente e informa o usuário.

### 👤 Console do Analista

- Lista de conversas com filtros por status
- Auto-refresh a cada 10 segundos
- Visualização do histórico completo da conversa
- Chamados do funcionário na barra lateral
- Ações: **Assumir** (pausa o agente), **Devolver** (reativa o agente), **Encerrar**

## 🏗️ Decisões Arquiteturais

### Por que Vercel AI SDK em vez de Mastra?

O SPEC permite Mastra **ou** LangGraph.js, mas o Vercel AI SDK (`ai`) foi escolhido porque:

1. **Integração nativa com Next.js** — produzido pela Vercel, funciona nativamente com App Router e streaming
2. **Streaming de primeiro nível** — `streamText()` com SSE funciona out-of-the-box
3. **Tool calling tipado** — integração com Zod para validação de parâmetros das ferramentas
4. **Zero setup adicional** — Mastra requer configuração de infraestrutura separada
5. **`onChunk` hook** — permite capturar cada tool call/result para o Painel de Transparência em tempo real

O Mastra seria a escolha ideal para multi-agent workflows complexos; para um único agente com ferramentas, o AI SDK é mais simples e igualmente poderoso.

### Por que Armazenamento em Memória Desacoplado (sem `fs`)?

1. **Zero dependência de sistema de arquivos (`fs`)** — compatível nativamente com Turbopack, Edge runtimes, client components, Vercel e containers com filesystem read-only.
2. **Resiliente e livre de concorrência** — elimina bloqueios de arquivo do Windows (`EBUSY`/`EPERM`) e erros de parsing JSON corrompido em requisições simultâneas.
3. **Persistência durante o ciclo de vida via `globalThis`** — sobrevive ao Fast Refresh do Next.js sem perder sessões ou chamados criados durante os testes.
4. **Desacoplamento limpo** — todas as operações de dados continuam expostas por funções padronizadas (`getAllTickets`, `createTicket`, `updateSession`, etc.), permitindo plugar SQLite/Prisma ou PostgreSQL para produção com zero alteração nas rotas ou componentes.

### Padrão de Streaming (SSE)

O endpoint `/api/chat` usa `ReadableStream` com Server-Sent Events (SSE), emitindo chunks tipados:
- `type: "session"` — ID da sessão e contagem
- `type: "text"` — delta de texto do LLM
- `type: "step"` — ferramenta executada (com status running/done)
- `type: "done"` — finalização com todos os steps
- `type: "error"` — erro tratado

## 🔧 Variáveis de Ambiente

| Variável | Obrigatória | Padrão | Descrição |
|----------|-------------|--------|-----------|
| `OPENAI_API_KEY` | ✅ | — | Chave da API OpenAI |
| `OPENAI_MODEL` | ❌ | `gpt-4o-mini` | Modelo a usar |
| `OPENAI_BASE_URL` | ❌ | — | URL base customizada (Azure, etc.) |

## 📝 Scripts

```bash
npm run dev      # Desenvolvimento com Turbopack
npm run build    # Build de produção
npm run start    # Servidor de produção
npm run lint     # Verificação de lint
```
