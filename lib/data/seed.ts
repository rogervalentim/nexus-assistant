// ============================================================
// Nexo Assist — Seed Data (Employees, Tickets, Knowledge Base)
// ============================================================
import type { Employee, Ticket, KBArticle } from "../types";

export const EMPLOYEES: Employee[] = [
  {
    id: "emp-000",
    name: "Ana Silva",
    email: "ana.silva@nexo.com.br",
    department: "Design UI/UX",
    role: "Designer UI/UX · ramal 4120",
    isAnalyst: false,
  },
  {
    id: "emp-001",
    name: "Ana Souza",
    email: "ana.souza@nexo.com.br",
    department: "Financeiro",
    role: "Analista Financeira",
    isAnalyst: false,
  },
  {
    id: "emp-002",
    name: "Carlos Monteiro",
    email: "carlos.monteiro@nexo.com.br",
    department: "Vendas",
    role: "Executivo de Vendas · ramal 3210",
    isAnalyst: false,
  },
  {
    id: "emp-003",
    name: "Beatriz Torres",
    email: "beatriz.torres@nexo.com.br",
    department: "Financeiro",
    role: "Coordenadora Financeira · ramal 1150",
    isAnalyst: false,
  },
  {
    id: "emp-004",
    name: "Diego Ramos",
    email: "diego.ramos@nexo.com.br",
    department: "Engenharia",
    role: "Engenheiro de Software · ramal 5540",
    isAnalyst: false,
  },
  {
    id: "emp-005",
    name: "Bruno Melo",
    email: "bruno.melo@nexo.com.br",
    department: "Comercial",
    role: "Gerente Comercial",
    isAnalyst: false,
  },
  {
    id: "emp-006",
    name: "Carla Dias",
    email: "carla.dias@nexo.com.br",
    department: "RH",
    role: "Coordenadora de RH",
    isAnalyst: false,
  },
  // Analysts (service desk)
  {
    id: "ana-001",
    name: "Ricardo Andrade",
    email: "ricardo.andrade@nexo.com.br",
    department: "Service Desk",
    role: "Analista N1",
    isAnalyst: true,
  },
  {
    id: "ana-002",
    name: "Carlos Mendes",
    email: "carlos.mendes@nexo.com.br",
    department: "Service Desk",
    role: "Analista N2",
    isAnalyst: true,
  },
  {
    id: "ana-003",
    name: "Mariana Figueiredo",
    email: "mariana.figueiredo@nexo.com.br",
    department: "Service Desk",
    role: "Analista N2",
    isAnalyst: true,
  },
];

export const SEED_TICKETS: Ticket[] = [
  {
    id: "INC-2024-001",
    title: "Notebook lento após atualização",
    description:
      "Após a última atualização do Windows, o notebook demora para iniciar e trava constantemente ao abrir aplicações corporativas.",
    status: "open",
    priority: "high",
    type: "incident",
    category: "hardware",
    userEmail: "ana.silva@nexo.com.br",
    assignedTo: "Transferido para você · ramal 4120",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "INC-2024-002",
    title: "Acesso à pasta Financeiro",
    description:
      "SharePoint · Permissão de leitura e edição na pasta compartilhada da diretoria financeira.",
    status: "in_progress",
    priority: "medium",
    type: "incident",
    category: "access",
    userEmail: "ana.silva@nexo.com.br",
    assignedTo: "Ricardo Andrade",
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "REQ-2024-003",
    title: "Segundo monitor para home office",
    description:
      "REQ-2024-003 · Aprovado · Monitor homologado Dell 27 polegadas para setup ergonômico.",
    status: "resolved",
    priority: "low",
    type: "request",
    category: "hardware",
    userEmail: "ana.silva@nexo.com.br",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "REQ-2024-002",
    title: "Configuração de impressora no celular",
    description: "REQ-2024-002 · Resolvido em 08 out",
    status: "closed",
    priority: "low",
    type: "request",
    category: "printer",
    userEmail: "ana.silva@nexo.com.br",
    createdAt: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "INC-2024-004",
    title: "Troca de teclado de rede",
    description: "INC-2024-004 · Resolvido em 01 out",
    status: "closed",
    priority: "low",
    type: "incident",
    category: "hardware",
    userEmail: "ana.silva@nexo.com.br",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "TKT-0001",
    title: "VPN não conecta após atualização do Windows",
    description:
      "Após a atualização do Windows 11 22H2, o cliente VPN Cisco AnyConnect apresenta erro 'Unable to establish VPN connection'. Já tentei reiniciar o serviço e reinstalar o cliente.",
    status: "open",
    priority: "high",
    type: "incident",
    category: "vpn",
    userEmail: "ana.souza@nexo.com.br",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "TKT-0002",
    title: "Solicitação de acesso ao sistema ERP",
    description:
      "Preciso de acesso de leitura ao módulo de relatórios do ERP SAP para elaboração do relatório trimestral.",
    status: "in_progress",
    priority: "medium",
    type: "request",
    category: "access",
    userEmail: "ana.souza@nexo.com.br",
    assignedTo: "Ricardo Andrade",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "TKT-0003",
    title: "Notebook travando frequentemente",
    description:
      "Meu notebook Dell Latitude está travando a cada 30-40 minutos. Preciso forçar reinicialização.",
    status: "open",
    priority: "high",
    type: "incident",
    category: "hardware",
    userEmail: "bruno.melo@nexo.com.br",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "TKT-0004",
    title: "E-mail do Outlook não sincroniza",
    description:
      "O Outlook 365 não está sincronizando os e-mails desde ontem às 14h. Consigo acessar pelo Webmail normalmente.",
    status: "resolved",
    priority: "medium",
    type: "incident",
    category: "email",
    userEmail: "carla.dias@nexo.com.br",
    resolution: "Cache do Outlook limpo e perfil recriado. Sincronização restaurada.",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "TKT-0005",
    title: "Impressora HP do setor não imprime",
    description:
      "A impressora HP LaserJet do andar 3 está offline. Nenhum computador do setor consegue imprimir.",
    status: "open",
    priority: "medium",
    type: "incident",
    category: "printer",
    userEmail: "diego.lima@nexo.com.br",
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "TKT-0006",
    title: "Solicitação de software Adobe Creative Cloud",
    description: "Preciso do Adobe Photoshop e Illustrator para as novas campanhas de marketing.",
    status: "waiting_user",
    priority: "low",
    type: "request",
    category: "software",
    userEmail: "elena.castro@nexo.com.br",
    assignedTo: "Mariana Figueiredo",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const SEED_SESSIONS: any[] = [
  {
    id: "sess-ana-silva",
    userEmail: "ana.silva@nexo.com.br",
    userName: "Ana Silva",
    status: "waiting_analyst",
    messageCount: 7,
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    escalationReason: "Usuário solicitou suporte N2 para o chamado INC-2024-001 (notebook lento e prazo vencido).",
    messages: [
      {
        id: "msg-1",
        role: "user",
        content: "Qual o status do meu chamado?",
        createdAt: "2026-10-31T14:40:00.000Z",
      },
      {
        id: "msg-2",
        role: "assistant",
        content: "Você tem 3 chamados abertos. Sobre qual deles você gostaria de falar?",
        createdAt: "2026-10-31T14:40:30.000Z",
      },
      {
        id: "msg-3",
        role: "user",
        content: "INC-2024-001 - Meu caso é urgente, preciso de retorno",
        createdAt: "2026-10-31T14:41:00.000Z",
      },
      {
        id: "msg-4",
        role: "assistant",
        content: "Este chamado já está com a fila de suporte N2 sob responsabilidade de Carlos Mendes. Gostaria de falar com o atendente responsável?",
        createdAt: "2026-10-31T14:41:40.000Z",
      },
      {
        id: "msg-5",
        role: "user",
        content: "Sim, por favor. É sobre o notebook.",
        createdAt: "2026-10-31T14:42:10.000Z",
      },
      {
        id: "msg-6",
        role: "user",
        content: "O chamado está com o prazo vencido.",
        createdAt: "2026-10-31T14:42:30.000Z",
      },
      {
        id: "msg-7",
        role: "assistant",
        content: "Transferindo para o suporte N2. Um analista vai falar com você em instantes.",
        createdAt: "2026-10-31T14:43:00.000Z",
      },
    ],
  },
  {
    id: "sess-carlos-monteiro",
    userEmail: "carlos.monteiro@nexo.com.br",
    userName: "Carlos Monteiro",
    status: "with_analyst",
    analystId: "ana-002",
    messageCount: 4,
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    updatedAt: "2026-10-31T14:32:00.000Z",
    escalationReason: "Solicitação de licença CRM e configuração de SSO.",
    messages: [
      {
        id: "cm-1",
        role: "user",
        content: "Preciso de ajuda urgente para acessar o painel de vendas no CRM.",
        createdAt: "2026-10-31T14:25:00.000Z",
      },
      {
        id: "cm-2",
        role: "assistant",
        content: "Transferindo para analista do Service Desk.",
        createdAt: "2026-10-31T14:26:00.000Z",
      },
      {
        id: "cm-3",
        role: "assistant",
        content: "Olá Carlos! Carlos Mendes do suporte aqui. Estou redefinindo sua permissão no AD para sincronizar com o Salesforce.",
        createdAt: "2026-10-31T14:32:00.000Z",
      },
    ],
  },
  {
    id: "sess-beatriz-torres",
    userEmail: "beatriz.torres@nexo.com.br",
    userName: "Beatriz Torres",
    status: "waiting_analyst",
    messageCount: 3,
    createdAt: new Date(Date.now() - 180 * 60 * 1000).toISOString(),
    updatedAt: "2026-10-31T12:15:00.000Z",
    escalationReason: "Erro ao gerar arquivo SPED no SAP.",
    messages: [
      {
        id: "bt-1",
        role: "user",
        content: "Relatório fiscal não gerava o arquivo SPED.",
        createdAt: "2026-10-31T12:10:00.000Z",
      },
      {
        id: "bt-2",
        role: "assistant",
        content: "Transferindo para o analista responsável pelo ERP.",
        createdAt: "2026-10-31T12:15:00.000Z",
      },
    ],
  },
  {
    id: "sess-diego-ramos",
    userEmail: "diego.ramos@nexo.com.br",
    userName: "Diego Ramos",
    status: "waiting_analyst",
    messageCount: 3,
    createdAt: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    updatedAt: "2026-10-31T11:05:00.000Z",
    escalationReason: "Liberação de porta de banco de dados e proxy reverso.",
    messages: [
      {
        id: "dr-1",
        role: "user",
        content: "Preciso de liberação urgente de porta no firewall para deploy em homologação.",
        createdAt: "2026-10-31T11:00:00.000Z",
      },
      {
        id: "dr-2",
        role: "assistant",
        content: "Transferindo para a fila de atendimento da equipe de infraestrutura.",
        createdAt: "2026-10-31T11:05:00.000Z",
      },
    ],
  },
  {
    id: "sess-carla-dias",
    userEmail: "carla.dias@nexo.com.br",
    userName: "Carla Dias",
    status: "closed",
    messageCount: 4,
    createdAt: new Date(Date.now() - 300 * 60 * 1000).toISOString(),
    updatedAt: "2026-10-31T10:20:00.000Z",
    messages: [
      {
        id: "cd-1",
        role: "user",
        content: "Acesso à folha de pagamento na intranet.",
        createdAt: "2026-10-31T10:10:00.000Z",
      },
      {
        id: "cd-2",
        role: "assistant",
        content: "Permissão concedida e validada com sucesso.",
        createdAt: "2026-10-31T10:20:00.000Z",
      },
    ],
  },
  {
    id: "sess-paulo-souza",
    userEmail: "paulo.souza@nexo.com.br",
    userName: "Paulo Souza",
    status: "closed",
    messageCount: 2,
    createdAt: new Date(Date.now() - 360 * 60 * 1000).toISOString(),
    updatedAt: "2026-10-31T09:45:00.000Z",
    messages: [
      {
        id: "ps-1",
        role: "user",
        content: "Solicitação de teclado USB.",
        createdAt: "2026-10-31T09:40:00.000Z",
      },
      {
        id: "ps-2",
        role: "assistant",
        content: "Equipamento retirado no almoxarifado de TI.",
        createdAt: "2026-10-31T09:45:00.000Z",
      },
    ],
  },
  {
    id: "sess-fernanda-rocha",
    userEmail: "fernanda.rocha@nexo.com.br",
    userName: "Fernanda Rocha",
    status: "closed",
    messageCount: 3,
    createdAt: new Date(Date.now() - 1440 * 60 * 1000).toISOString(),
    updatedAt: "2026-10-30T17:30:00.000Z",
    messages: [
      {
        id: "fr-1",
        role: "user",
        content: "Dúvida sobre licença Canva Pro corporativa.",
        createdAt: "2026-10-30T17:00:00.000Z",
      },
      {
        id: "fr-2",
        role: "assistant",
        content: "Convite de equipe reenviado por e-mail.",
        createdAt: "2026-10-30T17:30:00.000Z",
      },
    ],
  },
];

export const KNOWLEDGE_BASE: KBArticle[] = [
  {
    id: "kb-001",
    title: "Como conectar à VPN Cisco AnyConnect",
    category: "vpn",
    tags: ["vpn", "cisco", "anyconnect", "acesso remoto"],
    content: `
# Configurar e Conectar à VPN Nexo

## Instalação
1. Acesse o portal interno: https://vpn.nexo.com.br
2. Faça login com suas credenciais corporativas
3. Baixe e instale o Cisco AnyConnect

## Conexão
1. Abra o Cisco AnyConnect
2. Digite o endereço: vpn.nexo.com.br
3. Use seu e-mail e senha corporativos

## Erros Comuns
- **"Unable to establish VPN"**: Reinicie o serviço "Cisco AnyConnect VPN Agent" no Windows Services
- **Após update Windows**: Desinstale o AnyConnect, reinicie o PC e reinstale versão 4.10+
- **Erro de certificado**: Acesse o portal VPN pelo navegador primeiro para aceitar o certificado

## Suporte
Se o problema persistir após estes passos, abra um chamado com categoria VPN e prioridade Alta.
    `.trim(),
  },
  {
    id: "kb-002",
    title: "Problemas com e-mail no Outlook",
    category: "email",
    tags: ["outlook", "email", "sincronização", "365"],
    content: `
# Resolver Problemas de Sincronização no Outlook

## Soluções Rápidas
1. **Verifique a conexão**: Veja se há internet e se o ícone do Outlook não mostra "Desconectado"
2. **Forçar sincronização**: Vá em Enviar/Receber > Enviar/Receber Todas as Pastas (F9)
3. **Limpar cache**: Feche o Outlook, delete o arquivo .ost em %localappdata%\\Microsoft\\Outlook

## Reconstruir Perfil
1. Painel de Controle > Mail > Mostrar Perfis
2. Adicione novo perfil com suas credenciais
3. Defina como padrão e abra o Outlook

## Webmail
Acesse https://mail.nexo.com.br como alternativa temporária.

## Quando Abrir Chamado
Se após 30 minutos não sincronizar, abra chamado com categoria E-mail e prioridade Média.
    `.trim(),
  },
  {
    id: "kb-003",
    title: "Solicitação de acesso a sistemas",
    category: "access",
    tags: ["acesso", "permissão", "sistema", "erp", "ad"],
    content: `
# Solicitar Acesso a Sistemas

## Pré-requisitos
- Aprovação do gestor imediato (obrigatório)
- Justificativa de negócio documentada

## Como Solicitar
1. Abra um chamado do tipo "Solicitação" e categoria "Acesso"
2. Informe: nome do sistema, nível de acesso necessário, justificativa
3. Anexe o e-mail de aprovação do gestor

## Prazo de Atendimento
- Sistemas internos (AD, e-mail): até 2 dias úteis
- ERP/SAP: até 5 dias úteis (requer aprovação extra do TI e negócio)
- Sistemas de terceiros: variável conforme contrato

## Revisão de Acessos
Acessos são revisados trimestralmente. Acessos não utilizados em 90 dias são revogados automaticamente.
    `.trim(),
  },
  {
    id: "kb-004",
    title: "Configurar impressora de rede",
    category: "printer",
    tags: ["impressora", "rede", "configurar", "instalar"],
    content: `
# Instalar Impressora de Rede Nexo

## Impressoras Disponíveis por Andar
- Andar 1: HP LaserJet Pro M404 (\\\\print-srv\\HP-A1)
- Andar 2: HP Color LaserJet M479 (\\\\print-srv\\HP-A2-COLOR)
- Andar 3: HP LaserJet Pro M404 (\\\\print-srv\\HP-A3)
- Andar 4: Xerox VersaLink B405 (\\\\print-srv\\XEROX-A4)

## Instalação
1. Abra o Explorador de Arquivos
2. Digite \\\\print-srv na barra de endereço
3. Clique duas vezes na impressora do seu andar
4. Aguarde a instalação automática do driver

## Impressora Offline
Se aparecer como offline: verifique se está ligada e tente reimprimir.
Se persistir, chame o suporte ou abra chamado com categoria Impressora.
    `.trim(),
  },
  {
    id: "kb-005",
    title: "Computador lento ou travando",
    category: "hardware",
    tags: ["lento", "travando", "performance", "computador", "notebook"],
    content: `
# Solucionar Problemas de Performance

## Verificações Iniciais
1. **Reinicie o computador** (não apenas hibernate/suspender)
2. **Verifique o uso de recursos**: Ctrl+Shift+Esc > guia Desempenho
3. **Disco cheio?**: Mantenha ao menos 15% de espaço livre

## Ações Imediatas
- Feche programas não utilizados
- Execute limpeza de disco: Win+R > cleanmgr
- Verifique vírus: Abra o Windows Defender e execute verificação rápida

## Causas Comuns
- Muitos programas na inicialização: Task Manager > Inicialização > Desative os desnecessários
- Atualizações em segundo plano: Aguarde ou pause as atualizações do Windows
- Memória RAM insuficiente: Se o problema for recorrente, abra chamado para upgrade

## Quando Escalonar
Travamentos com tela azul (BSOD), problemas de hardware físico ou falhas repetidas precisam de atendimento presencial.
    `.trim(),
  },
  {
    id: "kb-006",
    title: "Rede e internet sem conexão",
    category: "network",
    tags: ["rede", "internet", "conexão", "wi-fi", "cabo"],
    content: `
# Resolver Problemas de Rede

## Passos Básicos
1. Verifique o cabo de rede ou conexão Wi-Fi
2. Reinicie o adaptador de rede: ipconfig /release e ipconfig /renew (como administrador)
3. Limpe o DNS: ipconfig /flushdns
4. Teste com: ping 8.8.8.8

## Wi-Fi
- Esqueça a rede e reconecte
- Rede corporativa: NEXO-CORP (use suas credenciais de domínio)
- Rede de visitantes: NEXO-GUEST (senha disponível na recepção)

## Sem Internet mas Rede OK
Pode ser bloqueio do proxy. Configure o proxy: Configurações > Rede > Proxy.
Servidor: proxy.nexo.com.br, Porta: 8080

## Quando Abrir Chamado
Problemas persistentes de rede devem ser abertos como incidente com prioridade Alta se afetarem o trabalho.
    `.trim(),
  },
  {
    id: "kb-007",
    title: "Como abrir e acompanhar chamados",
    category: "general",
    tags: ["chamado", "ticket", "suporte", "atendimento"],
    content: `
# Sistema de Chamados - Nexo Service Desk

## Tipos de Chamados
- **Incidente**: Algo parou de funcionar (sistema, equipamento, acesso)
- **Solicitação**: Pedido de novo recurso, acesso ou serviço
- **Problema**: Incidente recorrente que precisa de investigação de causa raiz
- **Mudança**: Alteração planejada em sistema ou infraestrutura

## Prioridades
- **Crítica**: Impacto total no trabalho, sem alternativa (SLA: 2h)
- **Alta**: Impacto significativo com alternativa limitada (SLA: 4h)
- **Média**: Impacto parcial, há alternativas (SLA: 8h)
- **Baixa**: Impacto mínimo ou solicitações de melhoria (SLA: 48h)

## Horário de Atendimento
- Suporte N1 (Chat/Telefone): Segunda a Sexta, 07h às 20h
- Plantão N2 (Crítico): 24/7 via telefone 0800-NEXO-TI

## Acompanhar Chamados
Acesse o Nexo Assist ou o portal de chamados para ver o status em tempo real.
    `.trim(),
  },
];
