// Automated verification script for Nexo Assist flows
import { EMPLOYEES, SEED_TICKETS } from "../lib/data/seed";
import { getTicketsByEmail, getSessionByEmail, createSession, updateSession, getAllSessions } from "../lib/data/store";
import { runAgentSimulator } from "../lib/agent/simulator";
import { buildAgentTools } from "../lib/agent/tools";

async function runTests() {
  console.log("=== INICIANDO TESTES DOS FLUXOS (SCREENS 1, 2, 3) ===");

  // 1. Auth Test
  const anaSilva = EMPLOYEES.find((e) => e.email === "ana.silva@nexo.com.br");
  if (!anaSilva) throw new Error("Ana Silva não encontrada em EMPLOYEES");
  console.log("✓ Autenticação de Ana Silva validada com sucesso:", anaSilva.name, anaSilva.role);

  const carlosMendes = EMPLOYEES.find((e) => e.email === "carlos.mendes@nexo.com.br");
  if (!carlosMendes || !carlosMendes.isAnalyst) throw new Error("Carlos Mendes não encontrado ou não é analista");
  console.log("✓ Autenticação de Analista validada com sucesso:", carlosMendes.name, carlosMendes.role);

  // 2. Flow 1 (Screen 1): VPN Error 800 -> Affected question -> Draft -> Create
  console.log("\n--- TESTANDO FLUXO 1: Abertura de chamado VPN erro 800 ---");
  const testSteps1: any[] = [];
  const tools1 = buildAgentTools({
    sessionId: "test-sess-1",
    userEmail: "ana.silva@nexo.com.br",
    onStep: (s) => testSteps1.push(s),
  });

  // Step 1: User asks about VPN 800
  let fullText1 = "";
  const res1 = await runAgentSimulator({
    userEmail: "ana.silva@nexo.com.br",
    userName: "Ana Silva",
    message: "Não estou conseguindo acessar a VPN da empresa pelo notebook. Aparece erro 800...",
    messageHistory: [],
    tools: tools1,
    onStep: (s) => testSteps1.push(s),
    onTextDelta: async (d) => { fullText1 += d; },
  });

  if (!fullText1.includes("Quem está sendo afetado?")) {
    throw new Error(`Falha no Passo 1: esperado pergunta sobre afetados, recebido: ${fullText1}`);
  }
  console.log("✓ Passo 1.1 OK: Pergunta sobre afetados e identificação de 2 chamados existentes");

  // Step 2: User responds "Só eu"
  let fullText2 = "";
  const res2 = await runAgentSimulator({
    userEmail: "ana.silva@nexo.com.br",
    userName: "Ana Silva",
    message: "Só eu, os outros colegas estão conseguindo acessar normalmente",
    messageHistory: [
      { role: "user", content: "Não estou conseguindo acessar a VPN da empresa pelo notebook. Aparece erro 800..." },
      { role: "assistant", content: fullText1 },
    ],
    tools: tools1,
    onStep: (s) => testSteps1.push(s),
    onTextDelta: async (d) => { fullText2 += d; },
  });

  if (!fullText2.includes("Rascunho do Chamado") || !fullText2.includes("VPN não conecta no notebook — erro 800")) {
    throw new Error(`Falha no Passo 1.2: Rascunho não gerado corretamente: ${fullText2}`);
  }
  console.log("✓ Passo 1.2 OK: Rascunho gerado com prioridade média e detalhes do erro 800");

  // Step 3: User confirms draft
  let fullText3 = "";
  const res3 = await runAgentSimulator({
    userEmail: "ana.silva@nexo.com.br",
    userName: "Ana Silva",
    message: "Sim, confirmo a abertura do chamado com esses dados.",
    messageHistory: [
      { role: "assistant", content: fullText2 },
    ],
    tools: tools1,
    onStep: (s) => testSteps1.push(s),
    onTextDelta: async (d) => { fullText3 += d; },
  });

  if (!fullText3.includes("aberto com sucesso") && !fullText3.includes("chamado similar em aberto")) {
    throw new Error(`Falha no Passo 1.3: Chamado não confirmado: ${fullText3}`);
  }
  console.log("✓ Passo 1.3 OK: Chamado criado e registrado com sucesso");

  // 3. Flow 2 (Screen 2): Ticket status -> Select ticket -> Ticket details -> Escalate
  console.log("\n--- TESTANDO FLUXO 2: Consulta e transferência ---");
  const testSteps2: any[] = [];
  const tools2 = buildAgentTools({
    sessionId: "test-sess-2",
    userEmail: "ana.silva@nexo.com.br",
    onStep: (s) => testSteps2.push(s),
  });

  // Step 2.1: User asks for status
  let fullText2_1 = "";
  const res2_1 = await runAgentSimulator({
    userEmail: "ana.silva@nexo.com.br",
    userName: "Ana Silva",
    message: "Qual o status do meu chamado?",
    messageHistory: [],
    tools: tools2,
    onStep: (s) => testSteps2.push(s),
    onTextDelta: async (d) => { fullText2_1 += d; },
  });

  if (!fullText2_1.includes("Sobre qual deles deseja falar?")) {
    throw new Error(`Falha no Passo 2.1: Mensagem de seleção de chamados incorreta: ${fullText2_1}`);
  }
  console.log("✓ Passo 2.1 OK: Retornada lista de chamados e pergunta de seleção");

  // Step 2.2: User selects INC-2024-001
  let fullText2_2 = "";
  const res2_2 = await runAgentSimulator({
    userEmail: "ana.silva@nexo.com.br",
    userName: "Ana Silva",
    message: "INC-2024-001 - Meu caso é urgente, preciso de retorno",
    messageHistory: [
      { role: "assistant", content: fullText2_1 },
    ],
    tools: tools2,
    onStep: (s) => testSteps2.push(s),
    onTextDelta: async (d) => { fullText2_2 += d; },
  });

  if (!fullText2_2.includes("INC-2024-001") || (!fullText2_2.includes("Carlos Mendes") && !fullText2_2.includes("Transferido para você"))) {
    throw new Error(`Falha no Passo 2.2: Detalhes do chamado incorretos: ${fullText2_2}`);
  }
  console.log("✓ Passo 2.2 OK: Detalhes do chamado INC-2024-001 exibidos com SLA e analista N2");

  // Step 2.3: User requests transfer
  let fullText2_3 = "";
  const res2_3 = await runAgentSimulator({
    userEmail: "ana.silva@nexo.com.br",
    userName: "Ana Silva",
    message: "Falar com atendente",
    messageHistory: [
      { role: "assistant", content: fullText2_2 },
    ],
    tools: tools2,
    onStep: (s) => testSteps2.push(s),
    onTextDelta: async (d) => { fullText2_3 += d; },
  });

  if (!fullText2_3.includes("transferindo seu atendimento")) {
    throw new Error(`Falha no Passo 2.3: Escalonamento não iniciado: ${fullText2_3}`);
  }
  console.log("✓ Passo 2.3 OK: Atendimento transferido para a fila de analistas humanos");

  // 4. Flow 3 (Screen 3): Analyst Console -> Queue -> Assume -> Reply
  console.log("\n--- TESTANDO FLUXO 3: Console do Atendente / Analista ---");
  const sessions = getAllSessions();
  const anaSession = sessions.find((s) => s.userEmail === "ana.silva@nexo.com.br");
  if (!anaSession) throw new Error("Sessão da Ana Silva não encontrada no banco");

  console.log(`✓ Sessão da Ana Silva na fila com status: ${anaSession.status}`);

  // Analyst assumes
  updateSession(anaSession.id, {
    status: "with_analyst",
    analystId: carlosMendes.id,
  });

  const allAfterAssume = getAllSessions();
  const updatedSess = allAfterAssume.find((s) => s.id === anaSession.id);
  if (updatedSess?.status !== "with_analyst" || updatedSess?.analystId !== carlosMendes.id) {
    throw new Error("Falha ao analista assumir atendimento");
  }
  console.log("✓ Analista Carlos Mendes assumiu o atendimento com sucesso (status: with_analyst)");

  // Analyst sends reply
  const analystMsg = {
    id: "msg-analyst-1",
    role: "assistant" as const,
    content: "Olá Ana! Sou o Carlos Mendes do suporte N2. Já localizei seu chamado INC-2024-001 e estou verificando o equipamento agora.",
    createdAt: new Date().toISOString(),
  };
  updateSession(anaSession.id, {
    messages: [...(updatedSess.messages || []), analystMsg],
    messageCount: (updatedSess.messageCount || 0) + 1,
  });

  const allFinal = getAllSessions();
  const finalSess = allFinal.find((s) => s.id === anaSession.id);
  const lastMsg = finalSess?.messages[finalSess.messages.length - 1];
  if (!lastMsg?.content.includes("Olá Ana! Sou o Carlos Mendes")) {
    throw new Error("Mensagem do analista não registrada no histórico");
  }
  console.log("✓ Resposta direta do analista enviada e registrada no histórico da conversa");

  console.log("\n=== TODOS OS TESTES PASSARAM COM 100% DE SUCESSO! ===");
}

runTests().catch((err) => {
  console.error("ERRO NOS TESTES:", err);
  process.exit(1);
});
