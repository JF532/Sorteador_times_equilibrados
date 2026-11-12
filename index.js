const array_genes = []; // Array com todos os genes criados
let populacao = []; // Array para colocar todos os indivíduos
const tamPopulacao = 10;
let totalJogadores;
let jogadoresPorTime;
let nTimes;

const DB_STORAGE_KEY = "baba_jogadores_db_v2";
const SESSION_STORAGE_KEY = "timesFutsal";
const RESULT_STORAGE_KEY = "timesGerados";
const PARTIDAS_STORAGE_KEY = "baba_partidas_v1";
const EVENTOS_STORAGE_KEY = "baba_eventos_v1";
const EVENTO_ATUAL_STORAGE_KEY = "baba_evento_atual_v1";
const FOTOS_STORAGE_KEY = "baba_fotos_v1";
const ESTATISTICAS_RESET_STORAGE_KEY = "baba_estatisticas_reset_v1";
const ADMIN_SESSAO_STORAGE_KEY = "baba_admin_sessao_v1";
const ADMIN_USUARIO = "admin";
const ADMIN_SENHA = "eniacadmin";
const LIMIAR_MEDIA_POR_ESTRELA = 3.0;
const MIN_EVENTOS_PROGRESSAO = 3;

// Supabase: cole aqui a URL e a anon public key do seu projeto.
// Enquanto estiverem vazias, o app funciona apenas no modo local.
const SUPABASE_URL = "https://gbjpgdzmgrxwwyeabfxv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_wS5xqcbSi_ZdNK5KWukmrw_EU5INbR_";
const SUPABASE_TABELA = "baba_estado";
const SUPABASE_ROW_ID = "principal";
const SUPABASE_BUCKET_FOTOS = "fotos-jogadores";
const SUPABASE_ATIVO = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
const SUPABASE_SDK_DISPONIVEL =
  typeof window !== "undefined" &&
  Boolean(window.supabase) &&
  typeof window.supabase.createClient === "function";

let supabaseClient = null;
if (SUPABASE_ATIVO && SUPABASE_SDK_DISPONIVEL) {
  try {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (err) {
    console.error("Configuração do Supabase inválida:", err);
    supabaseClient = null;
  }
}

let nuvemDisponivel = Boolean(supabaseClient);
let nuvemParecePausada = false;
let realtimeChannel = null;
let salvandoRemoto = false;
let timeoutSalvarRemoto = null;
let ultimoSalvamentoLocal = 0;
let ultimaTentativaSync = 0;
let eventoAtual = null;
let modoEvento = false;

const LISTA_EXEMPLO_BABA = `*Lista Baba _HOJE 20:30_*
*VÃO DE UNIFORME*

*LOCAL: GINÁSIO POLIESPORTIVO*

1. JF
2. Felipe
3. Mauro
4. Calebe
5. Davi
6. Nielson
7. Quirino
8. Duann
9. Rian
10. Gabriel
 11. João Gabriel
 12. Brendo
 13. Kaiky
 14. Higor
15.
16.

*Goleiros*
1. Thiago
2. Francisco
   3.
   4.`;

// Elementos principais do Sorteador
const configSection = document.getElementById("config-section");
const jogadoresSection = document.getElementById("jogadores-section");
const resultadoSection = document.getElementById("resultado-section");
const inputTotalJogadores = document.getElementById("total-jogadores");
const inputJogadoresPorTime = document.getElementById("jogadores-por-time");
const btnProximo = document.getElementById("btn-proximo");
const btnSortear = document.getElementById("btn-sortear");
const btnNovo = document.getElementById("btn-novo");
const btnResortear = document.getElementById("btn-resortear");
const btnCopiarWhatsapp = document.getElementById("btn-copiar-whatsapp");
const listaJogadores = document.getElementById("lista-jogadores");
const infoTimes = document.getElementById("info-times");
const timesContainer = document.getElementById("times-container");
const btn1Sortear = document.getElementById("btn-novo-jogadores");
const listaTextarea = document.getElementById("lista-textarea");
const detectedCount = document.getElementById("detected-count");
const detectedKnown = document.getElementById("detected-known");
const stepIndicator = document.getElementById("step-indicator");
const memoryMatchBadge = document.getElementById("memory-match-badge");
const btnColarExemplo = document.getElementById("btn-colar-exemplo");
const btnLimparLista = document.getElementById("btn-limpar-lista");
const btnPreencherNovos = document.getElementById("btn-preencher-novos");

// Elementos do Banco de Jogadores
const navSavedCount = document.getElementById("nav-saved-count");
const dbSearchInput = document.getElementById("db-search");
const formAddJogador = document.getElementById("form-add-jogador");
const dbAddNome = document.getElementById("db-add-nome");
const dbAddEstrelas = document.getElementById("db-add-estrelas");
const dbGrid = document.getElementById("db-grid");
const dbEmptyState = document.getElementById("db-empty-state");
const btnExportarDb = document.getElementById("btn-exportar-db");
const inputImportarDb = document.getElementById("input-importar-db");
const btnLimparDb = document.getElementById("btn-limpar-db");
const toastEl = document.getElementById("toast");

// Elementos do painel oculto e das partidas
const iconeSecreto = document.getElementById("icone-secreto");
const navBancoLink = document.getElementById("nav-banco-link");
const navStatusBadge = document.getElementById("nav-status-badge");
const bancoSection = document.getElementById("banco-anchor");
const partidasSection = document.getElementById("partidas-section");
const formPartida = document.getElementById("form-partida");
const partidaDataLabel = document.getElementById("partida-data-label");
const partidaTimeA = document.getElementById("partida-time-a");
const partidaTimeB = document.getElementById("partida-time-b");
const partidaAvisoTimes = document.getElementById("partida-aviso-times");
const partidaAvisoEvento = document.getElementById("partida-aviso-evento");
const partidaStats = document.getElementById("partida-stats");
const btnToggleHistorico = document.getElementById("btn-toggle-historico");
const btnAbrirPartida = document.getElementById("btn-abrir-partida");
const btnCancelarPartida = document.getElementById("btn-cancelar-partida");
const partidaPlacarPreview = document.getElementById("partida-placar-preview");
const btnSalvarPartida = document.getElementById("btn-salvar-partida");
const partidasLista = document.getElementById("partidas-lista");
const partidasEmptyState = document.getElementById("partidas-empty-state");
const btnLimparPartidas = document.getElementById("btn-limpar-partidas");
const btnFinalizarEvento = document.getElementById("btn-finalizar-evento");
const btnRestaurarBase = document.getElementById("btn-restaurar-base");
const navSyncStatus = document.getElementById("nav-sync-status");
const eventoHeader = document.getElementById("evento-header");
const eventoNome = document.getElementById("evento-nome");
const eventoMeta = document.getElementById("evento-meta");
const eventoTimeLista = document.getElementById("evento-times");
const btnCopiarEvento = document.getElementById("btn-copiar-evento");
const btnCopiarLinkEvento = document.getElementById("btn-copiar-link-evento");
const btnSairEvento = document.getElementById("btn-sair-evento");
const btnExportarImagem = document.getElementById("btn-exportar-imagem");
const resultadoActionsEl = document.querySelector(".resultado-actions");

// Login mock e ranking geral
const btnAdminAcesso = document.getElementById("btn-admin-acesso");
const loginModal = document.getElementById("login-modal");
const formLogin = document.getElementById("form-login");
const loginUsuario = document.getElementById("login-usuario");
const loginSenha = document.getElementById("login-senha");
const loginErro = document.getElementById("login-erro");
const btnLoginCancelar = document.getElementById("btn-login-cancelar");
const finalizarHint = document.getElementById("finalizar-hint");
const btnRankingGols = document.getElementById("btn-ranking-gols");
const btnRankingAssistencias = document.getElementById("btn-ranking-assistencias");
const rankingGeralLista = document.getElementById("ranking-geral-lista");
const rankingGeralEmpty = document.getElementById("ranking-geral-empty");

let nomesParseados = [];
let toastTimeout = null;
let cliquesIcone = 0;
let cliquesCopiarTimes = 0;
let modoEdicaoTimes = false;
let copiaEdicaoTimes = null;
let jogadorEdicaoSelecionado = null;
let timesDisponiveis = [];
let mostrarTodosJogos = false;
let eventoEncerradoAvisado = null;
let rankingGeralCategoria = "gols";
let rankingGeralLimite = 10;
const gruposJogosAbertos = new Set();

// ==========================================
// PERSISTÊNCIA: CACHE LOCAL + NUVEM (SUPABASE)
// ==========================================

const estadoCache = {
  versao: 1,
  jogadores: {},
  eventos: [],
  jogos: [],
  estatisticasResetEm: 0,
};

function gerarId() {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

function normalizarChaveNome(nome) {
  return String(nome || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function normalizarJogador(jogador, nomeFallback = "") {
  if (!jogador || typeof jogador !== "object") return null;
  const nome = String(jogador.nome || nomeFallback || "").trim();
  if (!nome) return null;
  const estrelas = Math.max(0, Math.min(5, Number(jogador.estrelas) || 0));
  const baseRaw = jogador.estrelasBase !== undefined ? Number(jogador.estrelasBase) : estrelas;
  return {
    nome,
    estrelas,
    estrelasBase: Math.max(0, Math.min(5, Number.isFinite(baseRaw) ? baseRaw : estrelas)),
    fotoVersao: Number(jogador.fotoVersao) || 0,
    atualizadoEm: Number(jogador.atualizadoEm) || 0,
  };
}

function nomesDoElenco(elenco) {
  if (!Array.isArray(elenco)) return [];
  return elenco
    .map((jogador) => (typeof jogador === "string" ? jogador : jogador?.nome))
    .map((nome) => String(nome || "").trim())
    .filter(Boolean);
}

function normalizarEstatisticasJogo(estatisticas) {
  if (!Array.isArray(estatisticas)) return [];
  const mapa = new Map();

  for (const item of estatisticas) {
    const jogador = String(item?.jogador || "").trim();
    if (!jogador) continue;

    const chave = normalizarChaveNome(jogador);
    const gols = Math.min(99, Math.max(0, Math.floor(Number(item?.gols) || 0)));
    const assistencias = Math.min(
      99,
      Math.max(0, Math.floor(Number(item?.assistencias) || 0))
    );

    if (!chave || (!gols && !assistencias)) continue;

    const atual = mapa.get(chave) || { jogador, gols: 0, assistencias: 0 };
    atual.gols += gols;
    atual.assistencias += assistencias;
    mapa.set(chave, atual);
  }

  return [...mapa.values()];
}

function normalizarJogo(jogo) {
  if (!jogo || typeof jogo !== "object") return null;
  const timeA = jogo.timeA && typeof jogo.timeA === "object"
    ? { numero: Number(jogo.timeA.numero) || 0, jogadores: nomesDoElenco(jogo.timeA.jogadores) }
    : null;
  const timeB = jogo.timeB && typeof jogo.timeB === "object"
    ? { numero: Number(jogo.timeB.numero) || 0, jogadores: nomesDoElenco(jogo.timeB.jogadores) }
    : null;
  if (!timeA || !timeB || timeA.jogadores.length === 0 || timeB.jogadores.length === 0) {
    return null;
  }
  return {
    id: String(jogo.id || gerarId()),
    eventoId: jogo.eventoId ? String(jogo.eventoId) : null,
    data: jogo.data || dataHojeISO(),
    timeA,
    timeB,
    eventos: Array.isArray(jogo.eventos)
      ? jogo.eventos
          .map((evento) => ({
            autor: String(evento?.autor || "").trim(),
            assistencia: evento?.assistencia ? String(evento.assistencia).trim() : null,
          }))
          .filter((evento) => evento.autor)
      : [],
    estatisticas: normalizarEstatisticasJogo(jogo.estatisticas),
    criadoEm: Number(jogo.criadoEm) || 0,
    atualizadoEm: Number(jogo.atualizadoEm) || Number(jogo.criadoEm) || 0,
  };
}

function normalizarEvento(evento) {
  if (!evento || typeof evento !== "object" || !evento.id) return null;
  const times = Array.isArray(evento.times)
    ? evento.times
        .map((time) => {
          const numero = Number(time?.numero) || 0;
          const jogadores = Array.isArray(time?.jogadores)
            ? time.jogadores
                .map((jogador) => normalizarJogador(jogador))
                .filter(Boolean)
            : [];
          return { numero, jogadores };
        })
        .filter((time) => time.numero > 0 && time.jogadores.length > 0)
    : [];
  if (times.length === 0) return null;
  return {
    id: String(evento.id),
    nome: String(evento.nome || `Baba ${formatarData(evento.data || dataHojeISO())}`).trim(),
    criadoEm: Number(evento.criadoEm) || 0,
    atualizadoEm: Number(evento.atualizadoEm) || Number(evento.criadoEm) || 0,
    finalizadoEm: Number(evento.finalizadoEm) || 0,
    data: evento.data || dataHojeISO(),
    times,
  };
}

function estatisticasDaPartida(partida) {
  if (!partida) return [];

  const mapa = new Map();
  const adicionar = (jogador, gols, assistencias) => {
    const nome = String(jogador || "").trim();
    const chave = normalizarChaveNome(nome);
    if (!chave) return;

    const atual = mapa.get(chave) || { jogador: nome, gols: 0, assistencias: 0 };
    atual.gols += Math.max(0, Number(gols) || 0);
    atual.assistencias += Math.max(0, Number(assistencias) || 0);
    mapa.set(chave, atual);
  };

  if (Array.isArray(partida.estatisticas) && partida.estatisticas.length > 0) {
    partida.estatisticas.forEach((item) => {
      adicionar(item?.jogador, item?.gols, item?.assistencias);
    });
    return [...mapa.values()];
  }

  (partida.eventos || []).forEach((evento) => {
    adicionar(evento?.autor, 1, 0);
    if (evento?.assistencia) adicionar(evento.assistencia, 0, 1);
  });

  return [...mapa.values()];
}

function estatisticasDoEvento(eventoId) {
  const mapa = new Map();

  for (const partida of jogosDoEvento(eventoId)) {
    for (const item of estatisticasDaPartida(partida)) {
      const chave = normalizarChaveNome(item.jogador);
      if (!chave) continue;
      const atual = mapa.get(chave) || { jogador: item.jogador, gols: 0, assistencias: 0 };
      atual.gols += item.gols;
      atual.assistencias += item.assistencias;
      mapa.set(chave, atual);
    }
  }

  return mapa;
}

function topDaCategoria(estatisticas, campo, limite = 3) {
  return [...estatisticas.values()]
    .filter((item) => Number(item[campo]) > 0)
    .sort(
      (a, b) =>
        Number(b[campo]) - Number(a[campo]) ||
        estrelasDoJogador(a.jogador) - estrelasDoJogador(b.jogador) ||
        String(a.jogador).localeCompare(String(b.jogador), "pt-BR")
    )
    .slice(0, limite);
}

function eventoEhHoje(evento) {
  return Boolean(evento && evento.data === dataHojeISO());
}

function eventoFinalizado(evento) {
  return Boolean(evento && Number(evento.finalizadoEm) > 0);
}

function partidaEditavel(partida) {
  if (!partida) return false;
  if (partida.eventoId) {
    const evento = estadoCache.eventos.find((item) => item.id === partida.eventoId);
    if (evento && eventoFinalizado(evento)) return false;
    return evento ? eventoEhHoje(evento) : partida.data === dataHojeISO();
  }
  return partida.data === dataHojeISO();
}

function verificarViradaDeDia() {
  if (!eventoAtual || eventoEhHoje(eventoAtual)) {
    eventoEncerradoAvisado = null;
    return;
  }

  if (eventoEncerradoAvisado === eventoAtual.id) return;
  eventoEncerradoAvisado = eventoAtual.id;

  fecharFormularioPartida();
  renderizarEventoHeader();
  renderizarPartidas();
  popularSelectTimes();
  mostrarToast("O dia virou: este evento agora é somente leitura.");
}

function mesmoElenco(a, b) {
  const nomesA = (a || []).map(normalizarChaveNome).filter(Boolean).sort();
  const nomesB = (b || []).map(normalizarChaveNome).filter(Boolean).sort();
  return (
    nomesA.length > 0 &&
    nomesA.length === nomesB.length &&
    nomesA.every((nome, indice) => nome === nomesB[indice])
  );
}

function jogosQueCombinamComEvento(evento, jogo) {
  if (!evento || !jogo || evento.data !== jogo.data) return null;
  const elencos = (evento.times || []).map((time) =>
    (time.jogadores || []).map((jogador) => jogador.nome)
  );
  const indiceA = elencos.findIndex((elenco) =>
    mesmoElenco(elenco, jogo.timeA?.jogadores || [])
  );
  const indiceB = elencos.findIndex((elenco) =>
    mesmoElenco(elenco, jogo.timeB?.jogadores || [])
  );
  if (indiceA < 0 || indiceB < 0 || indiceA === indiceB) return null;
  return evento;
}

function vincularJogosSemEvento(estado) {
  if (!estado || !Array.isArray(estado.eventos) || !Array.isArray(estado.jogos)) {
    return false;
  }

  let alterou = false;
  estado.jogos.forEach((jogo) => {
    const eventoAtual = jogo.eventoId
      ? estado.eventos.find((evento) => evento.id === jogo.eventoId)
      : null;
    if (eventoAtual) return;

    const candidatos = estado.eventos.filter((evento) =>
      jogosQueCombinamComEvento(evento, jogo)
    );
    if (candidatos.length !== 1) return;

    jogo.eventoId = candidatos[0].id;
    jogo.atualizadoEm = Date.now();
    alterou = true;
  });

  return alterou;
}

function normalizarEstado(dados) {
  const estado = { versao: 1, jogadores: {}, eventos: [], jogos: [], estatisticasResetEm: 0 };
  if (!dados || typeof dados !== "object") return estado;

  estado.versao = Number(dados.versao) || 1;
  estado.estatisticasResetEm = Number(dados.estatisticasResetEm) || 0;

  if (dados.jogadores && typeof dados.jogadores === "object") {
    for (const chave in dados.jogadores) {
      const jogador = normalizarJogador(dados.jogadores[chave], chave);
      if (jogador) estado.jogadores[normalizarChaveNome(jogador.nome) || chave] = jogador;
    }
  }

  if (Array.isArray(dados.eventos)) {
    estado.eventos = dados.eventos.map(normalizarEvento).filter(Boolean);
  }

  if (Array.isArray(dados.jogos)) {
    estado.jogos = dados.jogos.map(normalizarJogo).filter(Boolean);
  }

  return estado;
}

function carregarBancoLocal() {
  try {
    const raw = localStorage.getItem(DB_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return normalizarEstado({ jogadores: parsed }).jogadores;
  } catch (err) {
    console.error("Erro ao ler banco de jogadores local:", err);
    return {};
  }
}

function carregarPartidasLocal() {
  try {
    const raw = localStorage.getItem(PARTIDAS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizarJogo).filter(Boolean) : [];
  } catch (err) {
    console.error("Erro ao ler partidas locais:", err);
    return [];
  }
}

function carregarEventosLocal() {
  try {
    const raw = localStorage.getItem(EVENTOS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizarEvento).filter(Boolean) : [];
  } catch (err) {
    console.error("Erro ao ler eventos locais:", err);
    return [];
  }
}

function carregarEstatisticasResetLocal() {
  try {
    return Number(localStorage.getItem(ESTATISTICAS_RESET_STORAGE_KEY)) || 0;
  } catch (err) {
    console.error("Erro ao ler corte de estatísticas local:", err);
    return 0;
  }
}

function persistirEstadoLocal() {
  try {
    localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(estadoCache.jogadores));
    localStorage.setItem(PARTIDAS_STORAGE_KEY, JSON.stringify(estadoCache.jogos));
    localStorage.setItem(EVENTOS_STORAGE_KEY, JSON.stringify(estadoCache.eventos));
    localStorage.setItem(
      ESTATISTICAS_RESET_STORAGE_KEY,
      String(estadoCache.estatisticasResetEm || 0)
    );
  } catch (err) {
    console.error("Erro ao salvar dados locais:", err);
  }
}

function serializarEstado() {
  return {
    versao: 1,
    jogadores: estadoCache.jogadores,
    eventos: estadoCache.eventos,
    jogos: estadoCache.jogos,
    estatisticasResetEm: estadoCache.estatisticasResetEm || 0,
  };
}

function aplicarEstadoNoCache(estado) {
  estadoCache.versao = estado.versao || 1;
  estadoCache.jogadores = estado.jogadores;
  estadoCache.eventos = estado.eventos;
  estadoCache.jogos = estado.jogos;
  estadoCache.estatisticasResetEm = Number(estado.estatisticasResetEm) || 0;
  const migrou = vincularJogosSemEvento(estadoCache);
  persistirEstadoLocal();
  if (migrou) agendarSalvamentoRemoto();
}

function estadoVazio(estado) {
  if (!estado) return true;
  return (
    Object.keys(estado.jogadores || {}).length === 0 &&
    (estado.eventos || []).length === 0 &&
    (estado.jogos || []).length === 0
  );
}

function mesclarEstados(local, remoto) {
  const jogadores = { ...remoto.jogadores };

  for (const chave in local.jogadores) {
    const localJogador = local.jogadores[chave];
    const remotoJogador = jogadores[chave];
    if (
      !remotoJogador ||
      Number(localJogador.atualizadoEm || 0) >= Number(remotoJogador.atualizadoEm || 0)
    ) {
      jogadores[chave] = localJogador;
    }
  }

  const eventosPorId = new Map(remoto.eventos.map((evento) => [evento.id, evento]));
  for (const evento of local.eventos) {
    const existente = eventosPorId.get(evento.id);
    if (
      !existente ||
      Number(evento.atualizadoEm || 0) >= Number(existente.atualizadoEm || 0)
    ) {
      eventosPorId.set(evento.id, evento);
    }
  }

  const jogosPorId = new Map(remoto.jogos.map((jogo) => [jogo.id, jogo]));
  for (const jogo of local.jogos) {
    const existente = jogosPorId.get(jogo.id);
    if (!existente || Number(jogo.atualizadoEm || 0) >= Number(existente.atualizadoEm || 0)) {
      jogosPorId.set(jogo.id, jogo);
    }
  }

  return normalizarEstado({
    versao: 1,
    jogadores,
    eventos: [...eventosPorId.values()],
    jogos: [...jogosPorId.values()],
    estatisticasResetEm: Math.max(
      Number(local.estatisticasResetEm) || 0,
      Number(remoto.estatisticasResetEm) || 0
    ),
  });
}

function carregarBancoJogadores() {
  return estadoCache.jogadores;
}

function salvarBancoJogadores(db) {
  estadoCache.jogadores = db;
  persistirEstadoLocal();
  atualizarContadoresMemoria();
  agendarSalvamentoRemoto();
}

function carregarPartidas() {
  return estadoCache.jogos;
}

function salvarPartidas(partidas) {
  estadoCache.jogos = partidas;
  persistirEstadoLocal();
  agendarSalvamentoRemoto();
}

function carregarEventos() {
  return estadoCache.eventos;
}

function salvarEventos(eventos) {
  estadoCache.eventos = eventos;
  persistirEstadoLocal();
  agendarSalvamentoRemoto();
}

function buscarJogadorNoBanco(nome) {
  const chave = normalizarChaveNome(nome);
  if (!chave) return null;
  const db = carregarBancoJogadores();
  return db[chave] || null;
}

function salvarJogadorNoBanco(nome, estrelas, opcoes = {}) {
  const { definirBase = true } = opcoes;
  const nomeLimpo = String(nome || "").trim();
  const chave = normalizarChaveNome(nomeLimpo);
  if (!chave) return;

  const nota = Math.max(0, Math.min(5, Number(estrelas)));
  if (Number.isNaN(nota)) return;

  const db = carregarBancoJogadores();
  const existente = db[chave];
  const baseExistente =
    existente && existente.estrelasBase !== undefined
      ? Number(existente.estrelasBase)
      : nota;
  const base = definirBase || !existente ? nota : baseExistente;

  db[chave] = {
    nome: nomeLimpo,
    estrelas: nota,
    estrelasBase: Math.max(0, Math.min(5, base)),
    fotoVersao: Number(existente?.fotoVersao) || 0,
    atualizadoEm: Date.now(),
  };
  salvarBancoJogadores(db);
  renderizarBancoJogadores(dbSearchInput?.value || "");
}

function garantirJogadorSalvo(nome, estrelas) {
  const nomeLimpo = String(nome || "").trim();
  const chave = normalizarChaveNome(nomeLimpo);
  if (!chave) return;

  const db = carregarBancoJogadores();
  if (db[chave]) return;

  const nota = Math.max(0, Math.min(5, Number(estrelas)));
  if (Number.isNaN(nota)) return;

  db[chave] = {
    nome: nomeLimpo,
    estrelas: nota,
    estrelasBase: nota,
    atualizadoEm: Date.now(),
  };
  salvarBancoJogadores(db);
}

function removerJogadorDoBanco(chave) {
  const db = carregarBancoJogadores();
  if (db[chave]) {
    delete db[chave];
    salvarBancoJogadores(db);
    removerFotoDoJogador(chave);
    renderizarBancoJogadores(dbSearchInput?.value || "");
    atualizarStatusListaDetectada();
  }
}

// ==========================================
// FOTOS DOS JOGADORES (STORAGE + FALLBACK LOCAL)
// ==========================================

function carregarFotosLocais() {
  try {
    const raw = localStorage.getItem(FOTOS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (err) {
    console.error("Erro ao ler fotos locais:", err);
    return {};
  }
}

function salvarFotosLocais(fotos) {
  try {
    localStorage.setItem(FOTOS_STORAGE_KEY, JSON.stringify(fotos));
  } catch (err) {
    console.error("Erro ao salvar fotos locais:", err);
    mostrarToast("Não foi possível guardar a foto neste navegador.");
  }
}

function fotoUrlDoJogador(nome) {
  const chave = normalizarChaveNome(nome);
  if (!chave) return null;

  const fotos = carregarFotosLocais();
  if (fotos[chave]?.foto) return fotos[chave].foto;

  const jogador = estadoCache.jogadores[chave];
  if (jogador?.fotoVersao && SUPABASE_ATIVO) {
    return `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET_FOTOS}/fotos/${encodeURIComponent(chave)}.jpg?v=${jogador.fotoVersao}`;
  }
  return null;
}

function preencherInicialFoto(elemento, nome) {
  elemento.textContent = "";
  const inicial = document.createElement("span");
  inicial.className = "foto-jogador-inicial";
  inicial.textContent = String(nome || "?").trim().charAt(0).toUpperCase() || "?";
  elemento.appendChild(inicial);
}

function criarFotoJogador(nome, tamanho = "") {
  const foto = document.createElement("span");
  foto.className = `foto-jogador ${tamanho}`.trim();
  const url = fotoUrlDoJogador(nome);

  if (url) {
    const img = document.createElement("img");
    img.src = url;
    img.alt = "";
    img.loading = "lazy";
    img.addEventListener("error", () => preencherInicialFoto(foto, nome));
    foto.appendChild(img);
  } else {
    preencherInicialFoto(foto, nome);
  }
  return foto;
}

function comprimirFotoParaDataUrl(arquivo, ladoMaximo = 256) {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onerror = () => reject(new Error("Não foi possível ler o arquivo de imagem."));
    leitor.onload = () => {
      const imagem = new Image();
      imagem.onerror = () => reject(new Error("Arquivo de imagem inválido."));
      imagem.onload = () => {
        try {
          const escala = Math.min(1, ladoMaximo / Math.max(imagem.width, imagem.height));
          const largura = Math.max(1, Math.round(imagem.width * escala));
          const altura = Math.max(1, Math.round(imagem.height * escala));
          const canvas = document.createElement("canvas");
          canvas.width = largura;
          canvas.height = altura;
          const contexto = canvas.getContext("2d");
          if (!contexto) throw new Error("Canvas indisponível neste navegador.");
          contexto.drawImage(imagem, 0, 0, largura, altura);
          resolve(canvas.toDataURL("image/jpeg", 0.72));
        } catch (err) {
          reject(err);
        }
      };
      imagem.src = String(leitor.result || "");
    };
    leitor.readAsDataURL(arquivo);
  });
}

async function subirFotoParaNuvem(chave, dataUrl) {
  const blob = await (await fetch(dataUrl)).blob();
  const { error } = await supabaseClient.storage
    .from(SUPABASE_BUCKET_FOTOS)
    .upload(`fotos/${chave}.jpg`, blob, { upsert: true, contentType: "image/jpeg" });
  if (error) throw error;
}

function reRenderizarTimesDoResultado() {
  if (modoEdicaoTimes || modoEvento || resultadoSection.classList.contains("hidden")) return;
  try {
    const raw = localStorage.getItem(RESULT_STORAGE_KEY);
    if (!raw) return;
    renderizarTimes(JSON.parse(raw));
  } catch (err) {
    console.error("Erro ao re-renderizar os times:", err);
  }
}

async function sincronizarFotosPendentes() {
  if (!supabaseClient) return;

  const fotos = carregarFotosLocais();
  const pendentes = Object.keys(fotos).filter((chave) => fotos[chave]?.pendente);
  if (pendentes.length === 0) return;

  let alterou = false;
  for (const chave of pendentes) {
    if (!estadoCache.jogadores[chave]) {
      delete fotos[chave];
      alterou = true;
      continue;
    }
    try {
      await subirFotoParaNuvem(chave, fotos[chave].foto);
      estadoCache.jogadores[chave].fotoVersao = Date.now();
      estadoCache.jogadores[chave].atualizadoEm = Date.now();
      delete fotos[chave];
      alterou = true;
    } catch (err) {
      console.error(`Foto de "${chave}" continua pendente:`, err);
    }
  }

  salvarFotosLocais(fotos);
  if (alterou) {
    persistirEstadoLocal();
    agendarSalvamentoRemoto();
    renderizarBancoJogadores(dbSearchInput?.value || "");
    renderizarEventoHeader();
    reRenderizarTimesDoResultado();
    mostrarToast("Foto(s) enviada(s) para a nuvem.");
  }
}

async function processarFotoSelecionada(chave, arquivo) {
  if (!arquivo) return;

  let dataUrl;
  try {
    dataUrl = await comprimirFotoParaDataUrl(arquivo);
  } catch (err) {
    console.error("Erro ao comprimir a foto:", err);
    mostrarToast("Arquivo de imagem inválido.");
    return;
  }

  if (supabaseClient) {
    try {
      await subirFotoParaNuvem(chave, dataUrl);
      const jogador = estadoCache.jogadores[chave];
      if (jogador) {
        jogador.fotoVersao = Date.now();
        jogador.atualizadoEm = Date.now();
        persistirEstadoLocal();
        agendarSalvamentoRemoto();
      }
      renderizarBancoJogadores(dbSearchInput?.value || "");
      renderizarEventoHeader();
      reRenderizarTimesDoResultado();
      mostrarToast("Foto salva na nuvem!");
      return;
    } catch (err) {
      console.error("Falha ao enviar a foto para a nuvem, salvando localmente:", err);
    }
  }

  const fotos = carregarFotosLocais();
  fotos[chave] = { foto: dataUrl, pendente: true };
  salvarFotosLocais(fotos);
  renderizarBancoJogadores(dbSearchInput?.value || "");
  renderizarEventoHeader();
  reRenderizarTimesDoResultado();
  mostrarToast("Foto salva localmente. Envia para a nuvem quando a conexão voltar.");
}

function removerFotoDoJogador(chave) {
  const fotos = carregarFotosLocais();
  if (fotos[chave]) {
    delete fotos[chave];
    salvarFotosLocais(fotos);
  }
  if (supabaseClient && estadoCache.jogadores[chave]?.fotoVersao) {
    supabaseClient.storage
      .from(SUPABASE_BUCKET_FOTOS)
      .remove([`fotos/${chave}.jpg`])
      .catch((err) => console.error("Falha ao remover a foto da nuvem:", err));
  }
}

function atualizarContadoresMemoria() {
  const db = carregarBancoJogadores();
  const total = Object.keys(db).length;
  if (navSavedCount) navSavedCount.textContent = total;
}

function atualizarStatusSincronizacao() {
  if (!navSyncStatus) return;
  navSyncStatus.classList.remove("sync-status-online", "sync-status-offline", "sync-status-local");

  if (!SUPABASE_ATIVO) {
    navSyncStatus.textContent = "MODO LOCAL";
    navSyncStatus.title = "Configure a URL e a anon key do Supabase no index.js para sincronizar.";
    navSyncStatus.classList.add("sync-status-local");
  } else if (nuvemDisponivel) {
    navSyncStatus.textContent = "NUVEM";
    navSyncStatus.title = "Dados sincronizados com o Supabase.";
    navSyncStatus.classList.add("sync-status-online");
  } else if (nuvemParecePausada) {
    navSyncStatus.textContent = "NUVEM PAUSADA";
    navSyncStatus.title =
      "O projeto na nuvem está pausado ou inacessível. Restaure pelo painel do Supabase; os dados locais continuam seguros.";
    navSyncStatus.classList.add("sync-status-offline");
  } else {
    navSyncStatus.textContent = "OFFLINE";
    navSyncStatus.title = "Sem conexão com a nuvem. Os dados ficam neste aparelho.";
    navSyncStatus.classList.add("sync-status-offline");
  }
}

async function carregarEstadoRemoto() {
  if (!supabaseClient) return null;
  const { data, error } = await supabaseClient
    .from(SUPABASE_TABELA)
    .select("dados")
    .eq("id", SUPABASE_ROW_ID)
    .maybeSingle();
  if (error) throw error;
  return data?.dados ? normalizarEstado(data.dados) : null;
}

async function salvarEstadoRemoto() {
  if (timeoutSalvarRemoto) {
    clearTimeout(timeoutSalvarRemoto);
    timeoutSalvarRemoto = null;
  }
  persistirEstadoLocal();

  if (!supabaseClient) {
    nuvemDisponivel = false;
    atualizarStatusSincronizacao();
    return false;
  }

  salvandoRemoto = true;
  try {
    const { error } = await supabaseClient.from(SUPABASE_TABELA).upsert(
      {
        id: SUPABASE_ROW_ID,
        dados: serializarEstado(),
        atualizado_em: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
    if (error) throw error;
    ultimoSalvamentoLocal = Date.now();
    nuvemDisponivel = true;
    atualizarStatusSincronizacao();
    return true;
  } catch (err) {
    nuvemDisponivel = false;
    atualizarStatusSincronizacao();
    console.error("Erro ao salvar na nuvem:", err);
    mostrarToast("Sem conexão com a nuvem. Dados salvos neste aparelho.");
    return false;
  } finally {
    salvandoRemoto = false;
  }
}

function agendarSalvamentoRemoto() {
  if (!supabaseClient) {
    atualizarStatusSincronizacao();
    return;
  }
  if (timeoutSalvarRemoto) clearTimeout(timeoutSalvarRemoto);
  timeoutSalvarRemoto = setTimeout(() => {
    timeoutSalvarRemoto = null;
    salvarEstadoRemoto();
  }, 350);
}

async function conexaoInternetOk() {
  if (typeof navigator !== "undefined" && navigator.onLine === false) return false;
  try {
    await fetch("https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/package.json", {
      method: "HEAD",
      mode: "no-cors",
      cache: "no-store",
    });
    return true;
  } catch {
    return false;
  }
}

function tentarSincronizarSeOffline() {
  if (!supabaseClient || nuvemDisponivel) return;
  const agora = Date.now();
  if (agora - ultimaTentativaSync < 30000) return;
  ultimaTentativaSync = agora;
  sincronizarEstadoComNuvem({ silencioso: true });
}

async function sincronizarEstadoComNuvem(opcoes = {}) {
  const { silencioso = false } = opcoes;
  const estavaIndisponivel = !nuvemDisponivel;

  if (!supabaseClient) {
    nuvemDisponivel = false;
    atualizarStatusSincronizacao();
    return;
  }

  try {
    const remoto = await carregarEstadoRemoto();
    const local = normalizarEstado(serializarEstado());

    if (!remoto || estadoVazio(remoto)) {
      if (!estadoVazio(local)) {
        aplicarEstadoNoCache(local);
        await salvarEstadoRemoto();
        if (!silencioso) mostrarToast("Dados locais sincronizados com a nuvem.");
      } else {
        await salvarEstadoRemoto();
      }
    } else if (estadoVazio(local)) {
      aplicarEstadoNoCache(remoto);
    } else {
      const mesclado = mesclarEstados(local, remoto);
      aplicarEstadoNoCache(mesclado);
      await salvarEstadoRemoto();
    }

    nuvemDisponivel = true;
    nuvemParecePausada = false;
    await sincronizarFotosPendentes();
    if (silencioso && estavaIndisponivel) {
      mostrarToast("Conexão com a nuvem restaurada.");
    }
  } catch (err) {
    nuvemDisponivel = false;
    nuvemParecePausada = await conexaoInternetOk();
    console.error("Erro ao sincronizar com a nuvem:", err);
    if (!silencioso) {
      mostrarToast(
        nuvemParecePausada
          ? "A nuvem está pausada ou inacessível. Usando dados locais."
          : "Não foi possível acessar a nuvem. Usando dados locais."
      );
    }
  } finally {
    atualizarStatusSincronizacao();
  }
}

function aplicarEstadoRemoto(dados) {
  if (salvandoRemoto || timeoutSalvarRemoto) return;
  if (Date.now() - ultimoSalvamentoLocal < 1500) return;
  const remoto = normalizarEstado(dados);
  aplicarEstadoNoCache(remoto);

  if (eventoAtual) {
    const atualizado = estadoCache.eventos.find((evento) => evento.id === eventoAtual.id);
    if (atualizado) eventoAtual = atualizado;
  }

  renderizarBancoJogadores(dbSearchInput?.value || "");
  atualizarContadoresMemoria();
  renderizarPartidas();
  renderizarEventoHeader();
  popularSelectTimes();
  reRenderizarTimesDoResultado();
  atualizarStatusListaDetectada();
  mostrarToast("Dados atualizados de outro aparelho.");
}

function assinarRealtime() {
  if (!supabaseClient || realtimeChannel) return;
  realtimeChannel = supabaseClient
    .channel("baba-estado-realtime")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: SUPABASE_TABELA,
        filter: `id=eq.${SUPABASE_ROW_ID}`,
      },
      (payload) => {
        if (payload?.new?.dados) aplicarEstadoRemoto(payload.new.dados);
      }
    )
    .subscribe();
}

estadoCache.jogadores = carregarBancoLocal();
estadoCache.eventos = carregarEventosLocal();
estadoCache.jogos = carregarPartidasLocal();
estadoCache.estatisticasResetEm = carregarEstatisticasResetLocal();

if (vincularJogosSemEvento(estadoCache)) {
  persistirEstadoLocal();
}

function mostrarToast(mensagem) {
  if (!toastEl) return;
  toastEl.textContent = mensagem;
  toastEl.classList.remove("hidden");
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toastEl.classList.add("hidden");
  }, 2800);
}

// ==========================================
// LOGIN MOCK DO ADMINISTRADOR
// ==========================================

function adminLogado() {
  try {
    const raw = localStorage.getItem(ADMIN_SESSAO_STORAGE_KEY);
    if (!raw) return false;
    const sessao = JSON.parse(raw);
    return Boolean(sessao && sessao.usuario === ADMIN_USUARIO);
  } catch (err) {
    return false;
  }
}

function atualizarUIAdmin() {
  const logado = adminLogado();
  if (btnAdminAcesso) {
    btnAdminAcesso.textContent = logado ? "SAIR" : "ENTRAR";
    btnAdminAcesso.title = logado
      ? "Sair da conta de administrador"
      : "Entrar como administrador";
  }
}

function abrirLogin() {
  if (!loginModal) return;
  if (loginErro) {
    loginErro.textContent = "";
    loginErro.classList.add("hidden");
  }
  if (loginUsuario) loginUsuario.value = "";
  if (loginSenha) loginSenha.value = "";
  loginModal.classList.remove("hidden");
  loginUsuario?.focus();
}

function fecharLogin() {
  loginModal?.classList.add("hidden");
}

function entrarAdmin(usuario, senha) {
  const usuarioValido = String(usuario || "").trim().toLowerCase() === ADMIN_USUARIO;
  const senhaValida = String(senha || "") === ADMIN_SENHA;
  if (!usuarioValido || !senhaValida) return false;

  try {
    localStorage.setItem(
      ADMIN_SESSAO_STORAGE_KEY,
      JSON.stringify({ usuario: ADMIN_USUARIO, em: Date.now() })
    );
  } catch (err) {
    console.error("Erro ao salvar sessão do administrador:", err);
  }
  return true;
}

function sairAdmin() {
  try {
    localStorage.removeItem(ADMIN_SESSAO_STORAGE_KEY);
  } catch (err) {
    console.error("Erro ao encerrar sessão do administrador:", err);
  }
}

btnAdminAcesso?.addEventListener("click", () => {
  if (adminLogado()) {
    sairAdmin();
    atualizarUIAdmin();
    renderizarPartidas();
    mostrarToast("Sessão de administrador encerrada.");
    return;
  }
  abrirLogin();
});

btnLoginCancelar?.addEventListener("click", fecharLogin);

loginModal?.addEventListener("click", (e) => {
  if (e.target === loginModal) fecharLogin();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && loginModal && !loginModal.classList.contains("hidden")) {
    fecharLogin();
  }
});

formLogin?.addEventListener("submit", (e) => {
  e.preventDefault();
  if (entrarAdmin(loginUsuario?.value, loginSenha?.value)) {
    fecharLogin();
    atualizarUIAdmin();
    renderizarPartidas();
    mostrarToast("Administrador conectado.");
    return;
  }
  if (loginErro) {
    loginErro.textContent = "Usuário ou senha inválidos.";
    loginErro.classList.remove("hidden");
  }
  mostrarToast("Usuário ou senha inválidos.");
});

// ==========================================
// PAINEL OCULTO (10 CLIQUES NO ÍCONE)
// ==========================================

iconeSecreto?.addEventListener("click", () => {
  cliquesIcone++;
  if (cliquesIcone < 10) return;

  cliquesIcone = 0;
  const estaOculto = bancoSection.classList.contains("hidden");
  bancoSection.classList.toggle("hidden", !estaOculto);
  navBancoLink?.classList.toggle("hidden", !estaOculto);
  navStatusBadge?.classList.toggle("hidden", !estaOculto);

  if (estaOculto) {
    renderizarBancoJogadores(dbSearchInput?.value || "");
    mostrarToast("Área administrativa liberada.");
  } else {
    mostrarToast("Área administrativa ocultada.");
  }
});

// ==========================================
// PARTIDAS E PROGRESSÃO DE ESTRELAS
// ==========================================

function carregarUltimoResultado() {
  try {
    const raw = localStorage.getItem(RESULT_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return [];

    const numeros = Object.keys(parsed)
      .map((chave) => {
        const match = chave.match(/^time(\d+)$/);
        return match ? Number(match[1]) : null;
      })
      .filter((numero) => numero !== null)
      .sort((a, b) => a - b);

    return numeros
      .map((numero) => ({
        numero,
        jogadores: (parsed[`time${numero}`] || [])
          .map((jogador) => String(jogador?.nome || "").trim())
          .filter(Boolean),
      }))
      .filter((time) => time.jogadores.length > 0);
  } catch (err) {
    console.error("Erro ao ler último resultado:", err);
    return [];
  }
}

function dataHojeISO() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function formatarData(dataISO) {
  if (!dataISO) return "SEM DATA";
  const partes = String(dataISO).split("-");
  if (partes.length !== 3) return dataISO;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function chaveEventoDaPartida(partida) {
  if (partida?.eventoId) return `evento:${partida.eventoId}`;
  return `data:${partida?.data || "sem-data"}`;
}

function calcularEstatisticasJogador(nome, partidas) {
  const alvo = normalizarChaveNome(nome);
  const corte = Number(estadoCache.estatisticasResetEm) || 0;
  let jogos = 0;
  let gols = 0;
  let assistencias = 0;
  const eventos = new Set();

  for (const partida of partidas) {
    if (Number(partida.criadoEm || 0) < corte) continue;
    const elenco = [
      ...(partida.timeA?.jogadores || []),
      ...(partida.timeB?.jogadores || []),
    ];
    const participou = elenco.some((jogador) => normalizarChaveNome(jogador) === alvo);
    if (!participou) continue;

    jogos++;
    eventos.add(chaveEventoDaPartida(partida));
    for (const estatistica of estatisticasDaPartida(partida)) {
      if (normalizarChaveNome(estatistica.jogador) !== alvo) continue;
      gols += estatistica.gols;
      assistencias += estatistica.assistencias;
    }
  }

  const totalEventos = eventos.size;
  const media = totalEventos > 0 ? (gols + assistencias) / totalEventos : 0;
  return { jogos, eventos: totalEventos, gols, assistencias, media };
}

function recalcularEstrelasPorPartidas() {
  const partidas = carregarPartidas();
  if (partidas.length === 0) return 0;

  const db = carregarBancoJogadores();
  let alterados = 0;

  for (const chave in db) {
    const jogador = db[chave];
    const stats = calcularEstatisticasJogador(jogador.nome, partidas);
    if (stats.eventos < MIN_EVENTOS_PROGRESSAO) continue;

    const base = Number.isFinite(Number(jogador.estrelasBase))
      ? Number(jogador.estrelasBase)
      : Number(jogador.estrelas) || 0;
    const bonus = Math.floor(stats.media / LIMIAR_MEDIA_POR_ESTRELA);
    const novasEstrelas = Math.min(5, base + bonus);

    if (novasEstrelas > Number(jogador.estrelas || 0)) {
      db[chave].estrelas = novasEstrelas;
      db[chave].atualizadoEm = Date.now();
      alterados++;
    }
  }

  if (alterados > 0) {
    salvarBancoJogadores(db);
    renderizarBancoJogadores(dbSearchInput?.value || "");
  } else {
    atualizarContadoresMemoria();
  }

  return alterados;
}

function jogadoresDoTimeSelecionado(numero) {
  const time = timesDisponiveis.find((item) => item.numero === Number(numero));
  return time ? time.jogadores : [];
}

function jogadoresPartidaAtual() {
  return [
    ...jogadoresDoTimeSelecionado(partidaTimeA?.value),
    ...jogadoresDoTimeSelecionado(partidaTimeB?.value),
  ];
}

function estrelasDoJogador(nome) {
  const jogador = buscarJogadorNoBanco(nome);
  return jogador ? Number(jogador.estrelas) || 0 : 0;
}

function atualizarTotalDoBloco(bloco) {
  if (!bloco) return;
  const total = [...bloco.querySelectorAll(".partida-stat-gols")].reduce(
    (soma, input) => soma + Math.max(0, Math.floor(Number(input.value) || 0)),
    0
  );
  const alvo = bloco.querySelector(".partida-stats-time-total");
  if (alvo) alvo.textContent = `${total} GOL${total === 1 ? "" : "S"}`;
}

function atualizarPreviewPlacar() {
  if (!partidaPlacarPreview) return;

  const numeroA = Number(partidaTimeA?.value);
  const numeroB = Number(partidaTimeB?.value);
  const somarGols = (lado) =>
    [...(partidaStats?.querySelectorAll(`[data-lado="${lado}"] .partida-stat-gols`) || [])].reduce(
      (soma, input) => soma + Math.max(0, Math.floor(Number(input.value) || 0)),
      0
    );

  if (!numeroA || !numeroB || numeroA === numeroB) {
    partidaPlacarPreview.textContent = "SELECIONE OS TIMES";
    return;
  }

  partidaPlacarPreview.textContent = `Time ${numeroA} ${somarGols("A")} x ${somarGols("B")} Time ${numeroB}`;
}

function criarBlocoEstatisticas(lado, rotulo, time) {
  const bloco = document.createElement("div");
  bloco.className = "partida-stats-time";
  bloco.dataset.lado = lado;

  const topo = document.createElement("div");
  topo.className = "partida-stats-time-top";

  const nomeTime = document.createElement("span");
  nomeTime.className = "partida-stats-time-nome";
  nomeTime.textContent = `${rotulo} • TIME ${time.numero}`;

  const total = document.createElement("span");
  total.className = "partida-stats-time-total";
  total.textContent = "0 GOLS";

  topo.appendChild(nomeTime);
  topo.appendChild(total);
  bloco.appendChild(topo);

  for (const nome of time.jogadores) {
    const row = document.createElement("div");
    row.className = "partida-stat-row";
    row.dataset.jogador = nome;

    const jogador = document.createElement("div");
    jogador.className = "partida-stat-jogador";

    const nomeEl = document.createElement("span");
    nomeEl.className = "partida-stat-nome";
    nomeEl.textContent = nome;

    const estrelasEl = document.createElement("span");
    estrelasEl.className = "partida-stat-estrelas";
    estrelasEl.textContent = `${estrelasDoJogador(nome)}★`;

    jogador.appendChild(nomeEl);
    jogador.appendChild(estrelasEl);

    const grupoGols = document.createElement("label");
    grupoGols.className = "partida-stat-input";
    const labelGols = document.createElement("span");
    labelGols.textContent = "GOLS";
    const inputGols = document.createElement("input");
    inputGols.type = "number";
    inputGols.className = "partida-stat-gols";
    inputGols.min = "0";
    inputGols.max = "99";
    inputGols.step = "1";
    inputGols.value = "0";
    inputGols.inputMode = "numeric";
    inputGols.setAttribute("aria-label", `Gols de ${nome}`);
    grupoGols.appendChild(labelGols);
    grupoGols.appendChild(inputGols);

    const grupoAssistencias = document.createElement("label");
    grupoAssistencias.className = "partida-stat-input";
    const labelAssistencias = document.createElement("span");
    labelAssistencias.textContent = "ASSIST.";
    const inputAssistencias = document.createElement("input");
    inputAssistencias.type = "number";
    inputAssistencias.className = "partida-stat-assist";
    inputAssistencias.min = "0";
    inputAssistencias.max = "99";
    inputAssistencias.step = "1";
    inputAssistencias.value = "0";
    inputAssistencias.inputMode = "numeric";
    inputAssistencias.setAttribute("aria-label", `Assistências de ${nome}`);
    grupoAssistencias.appendChild(labelAssistencias);
    grupoAssistencias.appendChild(inputAssistencias);

    for (const input of [inputGols, inputAssistencias]) {
      input.addEventListener("input", () => {
        const valor = Math.max(0, Math.min(99, Math.floor(Number(input.value) || 0)));
        input.value = String(valor);
        atualizarTotalDoBloco(bloco);
        atualizarPreviewPlacar();
      });
    }

    row.appendChild(jogador);
    row.appendChild(grupoGols);
    row.appendChild(grupoAssistencias);
    bloco.appendChild(row);
  }

  return bloco;
}

function renderizarEstatisticasPartida() {
  if (!partidaStats) return;

  const numeroA = Number(partidaTimeA?.value);
  const numeroB = Number(partidaTimeB?.value);
  const timeA = timesDisponiveis.find((time) => time.numero === numeroA);
  const timeB = timesDisponiveis.find((time) => time.numero === numeroB);

  partidaStats.innerHTML = "";

  if (!timeA || !timeB || numeroA === numeroB) {
    partidaStats.classList.add("hidden");
    if (partidaPlacarPreview) partidaPlacarPreview.textContent = "SELECIONE OS TIMES";
    return;
  }

  partidaStats.classList.remove("hidden");
  partidaStats.appendChild(criarBlocoEstatisticas("A", "TIME A", timeA));
  partidaStats.appendChild(criarBlocoEstatisticas("B", "TIME B", timeB));
  atualizarPreviewPlacar();
}

function coletarEstatisticasPartida() {
  const estatisticas = [];

  partidaStats?.querySelectorAll(".partida-stats-time").forEach((bloco) => {
    bloco.querySelectorAll(".partida-stat-row").forEach((row) => {
      const jogador = row.dataset.jogador;
      const gols = Math.max(
        0,
        Math.min(99, Math.floor(Number(row.querySelector(".partida-stat-gols")?.value) || 0))
      );
      const assistencias = Math.max(
        0,
        Math.min(99, Math.floor(Number(row.querySelector(".partida-stat-assist")?.value) || 0))
      );
      if (!jogador || (!gols && !assistencias)) return;
      estatisticas.push({ jogador, gols, assistencias });
    });
  });

  return normalizarEstatisticasJogo(estatisticas);
}

function formularioPartidaAberto() {
  return Boolean(formPartida && !formPartida.classList.contains("hidden"));
}

function atualizarBotoesPartida() {
  const temEvento = Boolean(eventoAtual);
  const hoje = eventoEhHoje(eventoAtual);
  const finalizado = eventoFinalizado(eventoAtual);
  const liberado = temEvento && hoje && !finalizado;
  const temTimes = timesDisponiveis.length >= 2;
  const aberto = formularioPartidaAberto();

  if (btnAbrirPartida) {
    btnAbrirPartida.classList.toggle("hidden", !liberado || !temTimes || aberto);
    btnAbrirPartida.disabled = !liberado || !temTimes;
  }

  if (btnSalvarPartida) {
    btnSalvarPartida.disabled = !liberado || !temTimes;
  }

  if (partidaAvisoEvento) {
    partidaAvisoEvento.classList.toggle("hidden", !temEvento || liberado);
    if (temEvento && !liberado) {
      partidaAvisoEvento.textContent = finalizado
        ? "Este evento foi finalizado manualmente. Visualização somente leitura."
        : "Este evento já foi encerrado. Visualização somente leitura.";
    }
  }
}

function abrirFormularioPartida() {
  if (!eventoAtual) {
    mostrarToast("Sorteie os times para criar o evento do dia.");
    return;
  }
  if (!eventoEhHoje(eventoAtual)) {
    mostrarToast("Este evento já foi encerrado e não aceita novos jogos.");
    return;
  }
  if (eventoFinalizado(eventoAtual)) {
    mostrarToast("Este evento foi finalizado manualmente e não aceita novos jogos.");
    return;
  }
  if (timesDisponiveis.length < 2) {
    mostrarToast("Os times deste evento não foram encontrados.");
    return;
  }

  if (partidaTimeA && !partidaTimeA.value) {
    partidaTimeA.value = String(timesDisponiveis[0].numero);
  }
  if (partidaTimeB && !partidaTimeB.value) {
    partidaTimeB.value = String(timesDisponiveis[1].numero);
  }
  if (partidaTimeA?.value === partidaTimeB?.value) {
    const alternativa = timesDisponiveis.find(
      (time) => String(time.numero) !== partidaTimeA.value
    );
    if (alternativa) partidaTimeB.value = String(alternativa.numero);
  }

  formPartida?.classList.remove("hidden");
  renderizarEstatisticasPartida();
  atualizarBotoesPartida();
  formPartida?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function fecharFormularioPartida(opcoes = {}) {
  const { reset = true } = opcoes;
  formPartida?.classList.add("hidden");

  if (reset) {
    if (partidaStats) {
      partidaStats.innerHTML = "";
      partidaStats.classList.add("hidden");
    }
    if (partidaPlacarPreview) partidaPlacarPreview.textContent = "SELECIONE OS TIMES";
  }

  atualizarBotoesPartida();
}

function popularSelectTimes() {
  if (eventoAtual && Array.isArray(eventoAtual.times) && eventoAtual.times.length >= 2) {
    timesDisponiveis = eventoAtual.times.map((time) => ({
      numero: time.numero,
      jogadores: time.jogadores
        .map((jogador) => (typeof jogador === "string" ? jogador : jogador.nome))
        .filter(Boolean),
    }));
  } else {
    timesDisponiveis = carregarUltimoResultado();
  }

  const temTimes = timesDisponiveis.length >= 2;
  const temEvento = Boolean(eventoAtual);
  const encerrado = temEvento && !eventoEhHoje(eventoAtual);
  const temHistorico = carregarPartidas().length > 0;

  if (partidaDataLabel) {
    partidaDataLabel.textContent = temEvento ? formatarData(eventoAtual.data) : "SEM EVENTO";
  }

  partidasSection?.classList.toggle("hidden", !temEvento && !temHistorico);

  if (partidaAvisoTimes) {
    if (!temTimes) {
      partidaAvisoTimes.textContent = temEvento
        ? "Os times deste evento não foram encontrados."
        : "Sorteie os times para criar o evento do dia antes de registrar uma partida.";
      partidaAvisoTimes.classList.remove("hidden");
    } else if (!temEvento) {
      partidaAvisoTimes.textContent =
        "Sorteie os times para criar o evento do dia antes de registrar uma partida.";
      partidaAvisoTimes.classList.remove("hidden");
    } else {
      partidaAvisoTimes.classList.add("hidden");
    }
  }

  if (!temTimes) {
    if (partidaTimeA) partidaTimeA.innerHTML = "";
    if (partidaTimeB) partidaTimeB.innerHTML = "";
    if (partidaStats) {
      partidaStats.innerHTML = "";
      partidaStats.classList.add("hidden");
    }
    if (partidaPlacarPreview) partidaPlacarPreview.textContent = "SORTEIE OS TIMES PRIMEIRO";
    fecharFormularioPartida({ reset: false });
    return;
  }

  const valorA = partidaTimeA?.value;
  const valorB = partidaTimeB?.value;

  if (partidaTimeA) partidaTimeA.innerHTML = "";
  if (partidaTimeB) partidaTimeB.innerHTML = "";

  for (const time of timesDisponiveis) {
    const opcaoA = document.createElement("option");
    opcaoA.value = String(time.numero);
    opcaoA.textContent = `Time ${time.numero}`;
    partidaTimeA?.appendChild(opcaoA);

    const opcaoB = document.createElement("option");
    opcaoB.value = String(time.numero);
    opcaoB.textContent = `Time ${time.numero}`;
    partidaTimeB?.appendChild(opcaoB);
  }

  const existe = (valor) =>
    timesDisponiveis.some((time) => String(time.numero) === String(valor));
  const padraoA = String(timesDisponiveis[0].numero);
  const padraoB = String(timesDisponiveis[1].numero);

  if (partidaTimeA) partidaTimeA.value = existe(valorA) ? String(valorA) : padraoA;
  if (partidaTimeB) {
    partidaTimeB.value =
      existe(valorB) && String(valorB) !== partidaTimeA?.value ? String(valorB) : padraoB;
  }
  if (partidaTimeA?.value === partidaTimeB?.value) {
    const alternativa = timesDisponiveis.find(
      (time) => String(time.numero) !== partidaTimeA.value
    );
    if (alternativa && partidaTimeB) partidaTimeB.value = String(alternativa.numero);
  }

  if (encerrado) {
    fecharFormularioPartida({ reset: true });
    return;
  }

  if (formularioPartidaAberto()) {
    renderizarEstatisticasPartida();
  } else {
    if (partidaStats) {
      partidaStats.innerHTML = "";
      partidaStats.classList.add("hidden");
    }
    if (partidaPlacarPreview) partidaPlacarPreview.textContent = "SELECIONE OS TIMES";
  }

  atualizarBotoesPartida();
}

function jogosDoEvento(eventoId) {
  return carregarPartidas().filter((jogo) => jogo.eventoId === eventoId);
}

function partidasNoEscopoAtual() {
  return carregarPartidas().filter(
    (partida) => mostrarTodosJogos || !eventoAtual || partida.eventoId === eventoAtual.id
  );
}

function linkDoEvento(id) {
  const url = new URL(location.href);
  url.search = "";
  url.hash = "";
  url.searchParams.set("evento", id);
  return url.toString();
}

function garantirJogadoresDoEvento(evento) {
  if (!evento || !Array.isArray(evento.times)) return;
  let alterou = false;

  for (const time of evento.times) {
    for (const jogador of time.jogadores || []) {
      const nome = String(jogador?.nome || "").trim();
      const chave = normalizarChaveNome(nome);
      if (!chave || estadoCache.jogadores[chave]) continue;

      estadoCache.jogadores[chave] = {
        nome,
        estrelas: Number(jogador.estrelas) || 0,
        estrelasBase:
          jogador.estrelasBase !== undefined
            ? Number(jogador.estrelasBase) || 0
            : Number(jogador.estrelas) || 0,
        atualizadoEm: Date.now(),
      };
      alterou = true;
    }
  }

  if (alterou) {
    persistirEstadoLocal();
    atualizarContadoresMemoria();
    agendarSalvamentoRemoto();
  }
}

function renderizarEventoHeader() {
  if (!eventoHeader) return;

  if (!eventoAtual) {
    eventoHeader.classList.add("hidden");
    btnToggleHistorico?.classList.add("hidden");
    return;
  }

  eventoHeader.classList.remove("hidden");
  const encerrado = !eventoEhHoje(eventoAtual) || eventoFinalizado(eventoAtual);
  eventoHeader.classList.toggle("evento-encerrado", encerrado);
  if (eventoNome) eventoNome.textContent = eventoAtual.nome;

  const totalJogos = jogosDoEvento(eventoAtual.id).length;
  const finalizado = eventoFinalizado(eventoAtual);
  if (eventoMeta) {
    eventoMeta.textContent = `${formatarData(eventoAtual.data)} • ${eventoAtual.times.length} times • ${totalJogos} jogo(s)${
      finalizado ? " • FINALIZADO" : encerrado ? " • ENCERRADO" : ""
    }`;
  }

  if (eventoTimeLista) {
    eventoTimeLista.innerHTML = "";

    for (const time of eventoAtual.times) {
      const card = document.createElement("div");
      card.className = "evento-time";

      const topo = document.createElement("div");
      topo.className = "evento-time-top";

      const titulo = document.createElement("span");
      titulo.textContent = `TIME ${time.numero}`;

      let somaEstrelas = 0;
      for (const jogador of time.jogadores) {
        somaEstrelas += estrelasDoJogador(jogador.nome);
      }

      const total = document.createElement("span");
      total.className = "evento-time-total";
      total.textContent = `${somaEstrelas}★`;

      topo.appendChild(titulo);
      topo.appendChild(total);

      const lista = document.createElement("ul");
      lista.className = "evento-time-lista";

      for (const jogador of time.jogadores) {
        const item = document.createElement("li");

        const ident = document.createElement("span");
        ident.className = "jogador-ident";
        ident.appendChild(criarFotoJogador(jogador.nome));

        const nome = document.createElement("span");
        nome.className = "jogador-lista-nome";
        nome.textContent = jogador.nome;
        ident.appendChild(nome);

        const estrelas = document.createElement("span");
        estrelas.className = "evento-time-estrelas";
        estrelas.textContent = `${estrelasDoJogador(jogador.nome)}★`;
        item.appendChild(ident);
        item.appendChild(estrelas);
        lista.appendChild(item);
      }

      card.appendChild(topo);
      card.appendChild(lista);
      eventoTimeLista.appendChild(card);
    }
  }

  btnSairEvento?.classList.toggle("hidden", !modoEvento);
  btnCopiarLinkEvento?.classList.toggle("hidden", !eventoAtual);

  if (btnToggleHistorico) {
    btnToggleHistorico.classList.toggle("hidden", modoEvento);
    btnToggleHistorico.textContent = mostrarTodosJogos
      ? "VER APENAS O EVENTO"
      : "VER TODOS OS JOGOS";
  }
}

function aplicarEvento(evento, opcoes = {}) {
  if (!evento) return;
  const { modo = false } = opcoes;

  eventoAtual = evento;
  modoEvento = Boolean(modo);
  mostrarTodosJogos = false;
  nTimes = evento.times.length;
  document.body.classList.toggle("modo-evento", modoEvento);
  localStorage.setItem(EVENTO_ATUAL_STORAGE_KEY, evento.id);
  gruposJogosAbertos.add(`evento:${evento.id}`);

  garantirJogadoresDoEvento(evento);

  renderizarEventoHeader();
  popularSelectTimes();
  renderizarPartidas();

  if (modoEvento) {
    partidasSection?.scrollIntoView({ behavior: "auto", block: "start" });
  }
}

function limparEventoAtual() {
  if (eventoAtual) {
    gruposJogosAbertos.delete(`evento:${eventoAtual.id}`);
  }
  eventoAtual = null;
  modoEvento = false;
  mostrarTodosJogos = false;
  document.body.classList.remove("modo-evento");
  localStorage.removeItem(EVENTO_ATUAL_STORAGE_KEY);

  const url = new URL(location.href);
  if (url.searchParams.has("evento")) {
    url.searchParams.delete("evento");
    history.replaceState(null, "", url.toString());
  }

  renderizarEventoHeader();
  renderizarPartidas();
  popularSelectTimes();
}

async function carregarEventoDaURL() {
  const params = new URLSearchParams(location.search);
  const id = params.get("evento");
  if (!id) return false;

  let evento = estadoCache.eventos.find((item) => item.id === id);

  if (!evento && SUPABASE_ATIVO) {
    mostrarToast("Sincronizando evento...");
    for (let tentativa = 0; tentativa < 3 && !evento; tentativa++) {
      await new Promise((resolve) => setTimeout(resolve, tentativa === 0 ? 500 : 1200));
      await sincronizarEstadoComNuvem();
      evento = estadoCache.eventos.find((item) => item.id === id);
    }
  }

  if (!evento) {
    if (SUPABASE_ATIVO && !nuvemDisponivel) {
      mostrarToast("Sem conexão com a nuvem. Confira o link ou tente novamente.");
      return false;
    }

    mostrarToast("Evento não encontrado. Confira o link.");
    const url = new URL(location.href);
    url.searchParams.delete("evento");
    history.replaceState(null, "", url.toString());
    return false;
  }

  aplicarEvento(evento, { modo: true });
  return true;
}

function montarTimesDoResultado(solucao) {
  const times = [];

  for (let t = 1; t <= nTimes; t++) {
    const jogadores = (solucao[`time${t}`] || []).map((jogador) => {
      const nome = String(jogador?.nome || "").trim();
      const salvo = buscarJogadorNoBanco(nome);
      return {
        nome,
        estrelas: Number(jogador?.estrelas) || 0,
        estrelasBase: salvo ? Number(salvo.estrelasBase) || 0 : Number(jogador?.estrelas) || 0,
      };
    }).filter((jogador) => jogador.nome);

    if (jogadores.length > 0) {
      times.push({ numero: t, jogadores });
    }
  }

  return times;
}

function criarEventoDoResultado(solucao) {
  const times = montarTimesDoResultado(solucao);
  if (times.length < 2) return null;

  const evento = {
    id: gerarId(),
    nome: `Baba ${formatarData(dataHojeISO())}`,
    criadoEm: Date.now(),
    atualizadoEm: Date.now(),
    data: dataHojeISO(),
    times,
  };

  estadoCache.eventos.unshift(evento);
  persistirEstadoLocal();
  agendarSalvamentoRemoto();
  aplicarEvento(evento, { modo: false });
  mostrarToast("Times sorteados e evento criado! Copie o link para registrar os jogos.");
  return evento;
}

function atualizarEventoComResultado(evento, solucao) {
  if (!evento) return;
  const times = montarTimesDoResultado(solucao);
  if (times.length < 2) return;

  evento.times = times;
  evento.criadoEm = evento.criadoEm || Date.now();
  evento.atualizadoEm = Date.now();
  persistirEstadoLocal();
  agendarSalvamentoRemoto();
  aplicarEvento(evento, { modo: modoEvento });
  mostrarToast("Nova combinação equilibrada salva no evento.");
}

async function copiarLinkEvento() {
  const evento = eventoAtual || estadoCache.eventos[0];
  if (!evento) {
    mostrarToast("Sorteie os times para criar um evento.");
    return;
  }

  if (supabaseClient) {
    const salvou = await salvarEstadoRemoto();
    if (!salvou) {
      mostrarToast("Não foi possível sincronizar. Tente copiar o link novamente.");
      return;
    }
  }

  const link = linkDoEvento(evento.id);
  try {
    await navigator.clipboard.writeText(link);
    mostrarToast(
      supabaseClient
        ? "Link do evento copiado!"
        : "Link copiado. Em MODO LOCAL ele funciona apenas neste navegador."
    );
  } catch (err) {
    prompt("Copie o link do evento:", link);
  }
}

function sairDoEvento() {
  limparEventoAtual();
  configSection?.classList.remove("hidden");
  jogadoresSection?.classList.add("hidden");
  resultadoSection?.classList.add("hidden");
  atualizarIndicadorEtapa(1);
}

function calcularPlacarPartida(partida) {
  const elencoA = new Set(
    (partida.timeA?.jogadores || []).map((nome) => normalizarChaveNome(nome))
  );
  const elencoB = new Set(
    (partida.timeB?.jogadores || []).map((nome) => normalizarChaveNome(nome))
  );

  let golsA = 0;
  let golsB = 0;

  for (const estatistica of estatisticasDaPartida(partida)) {
    const autor = normalizarChaveNome(estatistica.jogador);
    if (elencoA.has(autor)) golsA += estatistica.gols;
    else if (elencoB.has(autor)) golsB += estatistica.gols;
  }

  return { golsA, golsB };
}

function chaveGrupoJogos(partida) {
  if (partida?.eventoId) return `evento:${partida.eventoId}`;
  return `data:${partida?.data || "sem-data"}`;
}

function agruparPartidasPorEvento(partidas) {
  const mapa = new Map();

  for (const partida of partidas) {
    const chave = chaveGrupoJogos(partida);
    let grupo = mapa.get(chave);

    if (!grupo) {
      const evento = partida.eventoId
        ? estadoCache.eventos.find((item) => item.id === partida.eventoId)
        : null;
      grupo = {
        chave,
        evento,
        data: evento?.data || partida.data || "",
        nome: evento?.nome || (partida.data ? `Jogos de ${formatarData(partida.data)}` : "Jogos sem data"),
        partidas: [],
        gols: 0,
        atualizadoEm: 0,
      };
      mapa.set(chave, grupo);
    }

    grupo.partidas.push(partida);
    grupo.atualizadoEm = Math.max(grupo.atualizadoEm, Number(partida.criadoEm) || 0);
  }

  const grupos = [...mapa.values()];
  for (const grupo of grupos) {
    grupo.partidas.sort((a, b) => {
      const dataA = String(a.data || "");
      const dataB = String(b.data || "");
      if (dataA !== dataB) return dataB.localeCompare(dataA);
      return (Number(b.criadoEm) || 0) - (Number(a.criadoEm) || 0);
    });
    grupo.gols = grupo.partidas.reduce((total, partida) => {
      const { golsA, golsB } = calcularPlacarPartida(partida);
      return total + golsA + golsB;
    }, 0);
  }

  grupos.sort((a, b) => {
    const dataA = String(a.data || "");
    const dataB = String(b.data || "");
    if (dataA !== dataB) return dataB.localeCompare(dataA);
    return b.atualizadoEm - a.atualizadoEm;
  });

  return grupos;
}

function criarCardPartida(partida) {
  const { golsA, golsB } = calcularPlacarPartida(partida);

  const card = document.createElement("div");
  card.className = "partida-card";

  const topo = document.createElement("div");
  topo.className = "partida-card-top";

  const info = document.createElement("div");

  const dataEl = document.createElement("span");
  dataEl.className = "partida-card-data";
  dataEl.textContent = formatarData(partida.data);

  const placarEl = document.createElement("div");
  placarEl.className = "partida-card-placar";
  placarEl.textContent = `Time ${partida.timeA?.numero} ${golsA} x ${golsB} Time ${partida.timeB?.numero}`;

  info.appendChild(dataEl);
  info.appendChild(placarEl);

  topo.appendChild(info);

  if (partidaEditavel(partida)) {
    const btnExcluir = document.createElement("button");
    btnExcluir.type = "button";
    btnExcluir.className = "db-delete-btn";
    btnExcluir.textContent = "✕";
    btnExcluir.title = "Excluir partida";
    btnExcluir.addEventListener("click", () => {
      if (!confirm(`Excluir o jogo de ${formatarData(partida.data)}?`)) return;
      const restantes = carregarPartidas().filter((item) => item.id !== partida.id);
      salvarPartidas(restantes);
      renderizarPartidas();
      renderizarEventoHeader();
      popularSelectTimes();
      renderizarBancoJogadores(dbSearchInput?.value || "");
      mostrarToast("Jogo excluído. As estrelas não são reduzidas.");
    });
    topo.appendChild(btnExcluir);
  }

  card.appendChild(topo);

  const estatisticas = estatisticasDaPartida(partida);
  const listaEventos = document.createElement("ul");
  listaEventos.className = "partida-eventos";

  if (estatisticas.length === 0) {
    const vazio = document.createElement("li");
    vazio.className = "partida-evento";
    vazio.textContent = "Jogo sem gols ou assistências registrados.";
    listaEventos.appendChild(vazio);
  } else {
    for (const estatistica of estatisticas) {
      const item = document.createElement("li");
      item.className = "partida-evento";

      const autorEl = document.createElement("span");
      autorEl.textContent = estatistica.jogador;

      const partes = [];
      if (estatistica.gols > 0) {
        partes.push(`${estatistica.gols} gol${estatistica.gols === 1 ? "" : "s"}`);
      }
      if (estatistica.assistencias > 0) {
        partes.push(
          `${estatistica.assistencias} assist.${estatistica.assistencias === 1 ? "" : "s"}`
        );
      }

      const assistenciaEl = document.createElement("span");
      assistenciaEl.className = "partida-evento-assist";
      assistenciaEl.textContent = partes.join(" • ");

      item.appendChild(autorEl);
      item.appendChild(assistenciaEl);
      listaEventos.appendChild(item);
    }
  }

  card.appendChild(listaEventos);
  return card;
}

function criarGrupoPartidas(grupo) {
  const details = document.createElement("details");
  details.className = "evento-jogos-grupo";
  details.dataset.grupo = grupo.chave;
  details.open = gruposJogosAbertos.has(grupo.chave);

  const resumo = document.createElement("summary");
  resumo.className = "evento-jogos-resumo";

  const seta = document.createElement("span");
  seta.className = "evento-jogos-seta";
  seta.textContent = "›";
  seta.setAttribute("aria-hidden", "true");

  const info = document.createElement("div");
  info.className = "evento-jogos-info";

  const topo = document.createElement("div");
  topo.className = "evento-jogos-topo";

  const data = document.createElement("span");
  data.className = "evento-jogos-data";
  const dataFormatada = grupo.data ? formatarData(grupo.data) : "SEM DATA";
  data.textContent = grupo.evento
    ? `JOGO DO DIA ${dataFormatada}`
    : `JOGOS DE ${dataFormatada}`;

  const meta = document.createElement("span");
  meta.className = "evento-jogos-meta";
  const totalPartidas = grupo.partidas.length;
  meta.textContent = `${totalPartidas} PARTIDA${totalPartidas === 1 ? "" : "S"} • ${grupo.gols} GOL${grupo.gols === 1 ? "" : "S"}`;

  const nome = document.createElement("span");
  nome.className = "evento-jogos-nome";
  nome.textContent = grupo.evento ? grupo.nome : "JOGOS SEM EVENTO VINCULADO";

  topo.appendChild(data);
  topo.appendChild(meta);
  info.appendChild(topo);
  info.appendChild(nome);

  resumo.appendChild(seta);
  resumo.appendChild(info);

  const conteudo = document.createElement("div");
  conteudo.className = "evento-jogos-conteudo";
  for (const partida of grupo.partidas) {
    conteudo.appendChild(criarCardPartida(partida));
  }

  details.appendChild(resumo);
  details.appendChild(conteudo);

  details.addEventListener("toggle", () => {
    if (details.open) {
      gruposJogosAbertos.add(grupo.chave);
    } else {
      gruposJogosAbertos.delete(grupo.chave);
    }
  });

  return details;
}

function renderizarPartidas() {
  if (!partidasLista) return;

  renderizarRankingGeral();

  const partidas = partidasNoEscopoAtual();
  const grupos = agruparPartidasPorEvento(partidas);

  partidasLista.innerHTML = "";

  const rotuloHistorico = partidasSection?.querySelector(
    ".partidas-historico-header .mono-eyebrow"
  );
  if (rotuloHistorico) {
    rotuloHistorico.textContent = mostrarTodosJogos ? "TODOS OS JOGOS" : "JOGOS REGISTRADOS";
  }

  const editaveis = partidas.filter(partidaEditavel);
  if (btnLimparPartidas) {
    const limparTudo = mostrarTodosJogos || !eventoAtual;
    btnLimparPartidas.textContent = limparTudo ? "LIMPAR JOGOS DE HOJE" : "LIMPAR EVENTO";
    btnLimparPartidas.classList.toggle("hidden", editaveis.length === 0);
  }

  const logado = adminLogado();
  const temJogosDoEvento =
    Boolean(eventoAtual) && partidas.some((p) => p.eventoId === eventoAtual.id);

  if (btnFinalizarEvento) {
    btnFinalizarEvento.classList.toggle("hidden", !temJogosDoEvento || !logado);
    btnFinalizarEvento.textContent =
      eventoAtual && (eventoFinalizado(eventoAtual) || !eventoEhHoje(eventoAtual))
        ? "GERAR RANKING"
        : "FINALIZAR EVENTO";
  }

  if (finalizarHint) {
    finalizarHint.classList.toggle("hidden", !temJogosDoEvento || logado);
  }

  if (grupos.length === 0) {
    partidasEmptyState?.classList.remove("hidden");
    return;
  }

  partidasEmptyState?.classList.add("hidden");

  for (const grupo of grupos) {
    partidasLista.appendChild(criarGrupoPartidas(grupo));
  }
}

btnAbrirPartida?.addEventListener("click", abrirFormularioPartida);
btnCancelarPartida?.addEventListener("click", () => fecharFormularioPartida());

partidaTimeA?.addEventListener("change", () => {
  if (partidaTimeA.value === partidaTimeB?.value) {
    const alternativa = timesDisponiveis.find(
      (time) => String(time.numero) !== partidaTimeA.value
    );
    if (alternativa) partidaTimeB.value = String(alternativa.numero);
  }
  renderizarEstatisticasPartida();
});

partidaTimeB?.addEventListener("change", () => {
  if (partidaTimeB.value === partidaTimeA?.value) {
    const alternativa = timesDisponiveis.find(
      (time) => String(time.numero) !== partidaTimeB.value
    );
    if (alternativa) partidaTimeA.value = String(alternativa.numero);
  }
  renderizarEstatisticasPartida();
});

formPartida?.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!eventoAtual) {
    mostrarToast("Sorteie os times para criar o evento do dia.");
    return;
  }

  if (!eventoEhHoje(eventoAtual)) {
    alert("Este evento já foi encerrado. As partidas só podem ser registradas no dia do evento.");
    fecharFormularioPartida();
    popularSelectTimes();
    return;
  }

  if (eventoFinalizado(eventoAtual)) {
    alert("Este evento foi finalizado manualmente. As partidas não podem mais ser registradas.");
    fecharFormularioPartida();
    popularSelectTimes();
    return;
  }

  if (timesDisponiveis.length < 2) {
    mostrarToast("Os times deste evento não foram encontrados.");
    return;
  }

  const numeroA = Number(partidaTimeA.value);
  const numeroB = Number(partidaTimeB.value);

  if (numeroA === numeroB) {
    alert("Selecione dois times diferentes.");
    return;
  }

  const timeA = timesDisponiveis.find((time) => time.numero === numeroA);
  const timeB = timesDisponiveis.find((time) => time.numero === numeroB);

  if (!timeA || !timeB) return;

  const partida = {
    id: gerarId(),
    eventoId: eventoAtual.id,
    data: eventoAtual.data,
    timeA: { numero: numeroA, jogadores: [...timeA.jogadores] },
    timeB: { numero: numeroB, jogadores: [...timeB.jogadores] },
    eventos: [],
    estatisticas: coletarEstatisticasPartida(),
    criadoEm: Date.now(),
    atualizadoEm: Date.now(),
  };

  const partidas = carregarPartidas();
  partidas.push(partida);
  salvarPartidas(partidas);

  const alterados = recalcularEstrelasPorPartidas();
  renderizarPartidas();
  renderizarEventoHeader();
  renderizarBancoJogadores(dbSearchInput?.value || "");
  fecharFormularioPartida();

  await salvarEstadoRemoto();

  if (alterados > 0) {
    mostrarToast(`Jogo adicionado! ${alterados} jogador(es) subiram de estrela.`);
  } else {
    mostrarToast("Jogo adicionado ao dia!");
  }
});

btnLimparPartidas?.addEventListener("click", () => {
  const todas = carregarPartidas();
  const limparTudo = mostrarTodosJogos || !eventoAtual;
  const partidas = partidasNoEscopoAtual().filter(partidaEditavel);

  if (partidas.length === 0) return;

  const mensagem = limparTudo
    ? "Apagar os jogos de hoje do histórico? As estrelas já conquistadas não serão reduzidas."
    : "Apagar todos os jogos deste evento? As estrelas já conquistadas não serão reduzidas.";

  if (!confirm(mensagem)) return;

  const ids = new Set(partidas.map((partida) => partida.id));
  const restantes = todas.filter((partida) => !ids.has(partida.id));

  salvarPartidas(restantes);
  renderizarPartidas();
  renderizarEventoHeader();
  popularSelectTimes();
  renderizarBancoJogadores(dbSearchInput?.value || "");
    mostrarToast("Jogos apagados.");
});

btnFinalizarEvento?.addEventListener("click", finalizarEventoAtual);

btnCopiarEvento?.addEventListener("click", copiarLinkEvento);
btnCopiarLinkEvento?.addEventListener("click", copiarLinkEvento);
btnSairEvento?.addEventListener("click", sairDoEvento);

btnToggleHistorico?.addEventListener("click", () => {
  mostrarTodosJogos = !mostrarTodosJogos;

  if (mostrarTodosJogos) {
    gruposJogosAbertos.clear();
  } else if (eventoAtual) {
    gruposJogosAbertos.add(`evento:${eventoAtual.id}`);
  }

  renderizarPartidas();
  renderizarEventoHeader();
});

// ==========================================
// ALGORITMO GENÉTICO
// ==========================================

function getPeso(estrelas) {
  switch (Number(estrelas)) {
    case 5:
      return 5;
    case 4:
      return 2;
    case 3:
      return 1.5;
    case 2:
      return 1;
    case 1:
      return 0.5;
    default:
      return 0;
  }
}

function embaralhar(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function getMaximoPorTime() {
  return jogadoresPorTime;
}

function getCapacidadeTime(indiceTime) {
  const timesCheios = Math.floor(totalJogadores / jogadoresPorTime);
  const resto = totalJogadores % jogadoresPorTime;
  if (indiceTime < timesCheios) return jogadoresPorTime;
  if (indiceTime === timesCheios && resto > 0) return resto;
  return 0;
}

function criarIndividuo() {
  const individuo = {}; // Cria um indivíduo

  for (let t = 1; t <= nTimes; t++) {
    individuo[`time${t}`] = []; // Crio o objeto que vai guardar a quantidade de times, por exemplo time1:[], time2:[], etc...
  }

  const capacidade = []; // Limite de cada dia
  for (let t = 1; t <= nTimes; t++) {
    capacidade.push(getCapacidadeTime(t - 1)); /// Retorna o arranjo(capacidade) com valores tipo [5],[5] e [2], para atribuir a capacidade de cada time
  }

  const genesEmbaralhados = embaralhar([...array_genes]);
  let timeAtual = 0;

  for (const gene of genesEmbaralhados) {
    while (
      timeAtual < nTimes &&
      individuo[`time${timeAtual + 1}`].length >= capacidade[timeAtual]
    ) {
      timeAtual++; // Se estiver cheio pula para o próximo time
    }
    if (timeAtual >= nTimes) {
      // Serve para garantir que não ultrapasse o último time
      timeAtual = nTimes - 1;
    }
    individuo[`time${timeAtual + 1}`].push(gene); // Adicionio o jogador(gene) no time(indivíduo) selecionado
  }

  return individuo;
}

function inicializacao_populacao() {
  // Função para criar a população
  populacao = [];

  for (let i = 0; i < tamPopulacao; i++) {
    const individuo = criarIndividuo();
    individuo.fitness = fitness(individuo);
    populacao.push(individuo);
  }
}

function calcularAlvo() {
  // Serve para retornar o meu alvo que deixa melhor divido
  let total = 0;

  for (const jogador of array_genes) {
    total += getPeso(jogador.estrelas); // Para cada jogador, pega o peso baseado nas estrelas
    // e soma no total geral
  }

  return total / nTimes; // Aqui ele pega o total da força e divivde pela quantidade
  // de times, aí da para saber quando cada time deveria ter de força
}

function fitness(individuo) {
  const somas = []; // Vai guardar a soma da força (peso) de cada time
  const alvo = calcularAlvo();
  let diferencaTotal = 0;

  for (let i = 1; i <= nTimes; i++) {
    // Percorre todos os times
    const chave = `time${i}`;
    let soma = 0;
    for (const jogador of individuo[chave]) {
      // Percorre todos os jogadores daquele time
      soma += getPeso(jogador.estrelas); // Soma os pesos do jogador
    }
    somas.push(soma); // Guarda a soma total desse time no array
  }

  for (const soma of somas) {
    diferencaTotal += Math.abs(soma - alvo); // Calcula o quão longe esse time está do valor ideial(alvo)
  }

  for (let i = 0; i < somas.length; i++) {
    for (let j = i + 1; j < somas.length; j++) {
      diferencaTotal += Math.abs(somas[i] - somas[j]); // Mede a diferença de força entre os dois times
    }
  }

  return diferencaTotal; // Quão menor for esse diferencaTotal, mais equilibrados os times estão
}

//função para selecionar o melhor candito entre 3 com melhor fitness
function selecaoTorneio(populacaoRef, tamanhoTorneio = 3) {
  let melhor = null;
  let melhorFitness = Infinity;

  for (let i = 0; i < tamanhoTorneio; i++) {
    const index = Math.floor(Math.random() * populacaoRef.length);
    const individuo = populacaoRef[index];
    if (individuo.fitness < melhorFitness) {
      melhorFitness = individuo.fitness;
      melhor = individuo;
    }
  }

  return melhor;
}

//seleciona individuos unicos, com uma quantidade(80% da população) para cruzarem
function selecionarParaCruzamento(populacaoRef, quantidade) {
  const selecionados = [];
  const indicesUsados = new Set();//garantia para não repetir index

  while (selecionados.length < quantidade) {
    const candidato = selecaoTorneio(populacaoRef);//usa o torneio para selecionar um candidato
    const idxOriginal = populacaoRef.indexOf(candidato);
    if (!indicesUsados.has(idxOriginal)) {//verifica se já tem o index
      indicesUsados.add(idxOriginal);
      selecionados.push(candidato);
    }
  }

  return selecionados;//devolve os selecionados
}

// Compara dois genes (jogadores). Usa o id quando existe, para que dois
// jogadores com o mesmo nome na lista não sejam confundidos entre si.
function mesmoGene(a, b) {
  if (a.id !== undefined && b.id !== undefined) {
    return a.id === b.id;
  }
  return a.nome === b.nome;
}

/*função para facilitar corte para cruzamento
  trasforma disso [time1(leo, jf, carlos), time2(...)
  para isso [3,4,5,6] onde o valor dentro é o time em que o jogador tá e o index
  é o jogador em relação a o array_genes*/
function individuoParaCodificacao(individuo) {
  const codificacao = [];
  for (const gene of array_genes) {
    for (let t = 1; t <= nTimes; t++) {
      const chave = `time${t}`;
      if (individuo[chave].some((j) => mesmoGene(j, gene))) {//verifica se o gene ta nesse time, se tiver passa para o prox gene
        codificacao.push(t);
        break;
      }
    }
  }
  return codificacao;
}

//faz o processo inverso da função anterior
function codificacaoParaIndividuo(codificacao) {
  const individuo = {};
  for (let t = 1; t <= nTimes; t++) {
    individuo[`time${t}`] = [];
  }

  const capacidades = [];
  for (let t = 1; t <= nTimes; t++) {
    capacidades.push(getCapacidadeTime(t - 1));
  }

  for (let i = 0; i < array_genes.length; i++) {
    const time = codificacao[i];
    const chave = `time${time}`;
    individuo[chave].push(array_genes[i]);
  }

  return individuo;
}

//garante que não há genes em excesso em cromossomos e nem duplicados em individuos
function repararCodificacao(codificacao) {
  const contagem = {};
  for (let i = 0; i < array_genes.length; i++) {
    const val = codificacao[i];
    contagem[val] = contagem[val] || [];
    contagem[val].push(i);
  }

  const duplicatas = [];
  for (const time in contagem) {
    if (contagem[time].length > getCapacidadeTime(time - 1)) {
      const excesso = contagem[time].length - getCapacidadeTime(time - 1);
      duplicatas.push(...contagem[time].slice(contagem[time].length - excesso));
    }
  }

  const ausentes = [];
  for (let t = 1; t <= nTimes; t++) {
    const count = contagem[t] ? contagem[t].length : 0;
    const capacidade = getCapacidadeTime(t - 1);
    for (let i = 0; i < capacidade - count; i++) {
      ausentes.push(t);
    }
  }

  for (let i = 0; i < duplicatas.length; i++) {
    codificacao[duplicatas[i]] = ausentes[i];
  }

  return codificacao;
}

function cruzamento(pai1, pai2) {
  const codPai1 = individuoParaCodificacao(pai1);
  const codPai2 = individuoParaCodificacao(pai2);

  const pontoCorte = Math.floor(Math.random() * (codPai1.length - 1)) + 1;//corta num ponto aleatorio

  //forma os dois filhos
  let filho1Cod = [...codPai1.slice(0, pontoCorte), ...codPai2.slice(pontoCorte)];
  let filho2Cod = [...codPai2.slice(0, pontoCorte), ...codPai1.slice(pontoCorte)];

  //garante que não tenha genes repetidos
  filho1Cod = repararCodificacao(filho1Cod);
  filho2Cod = repararCodificacao(filho2Cod);

  const filho1 = codificacaoParaIndividuo(filho1Cod);
  const filho2 = codificacaoParaIndividuo(filho2Cod);

  return [filho1, filho2];
}

function geneUsado(individuo, gene) {
  for (let t = 1; t <= nTimes; t++) {
    const chave = `time${t}`;
    if (individuo[chave].some((j) => mesmoGene(j, gene))) {
      // Verifica se existe alguém no time com esse nome
      return true;
    }
  }
  return false;
}

function encontrarTimeDisponivel(individuo) {
  for (let t = 1; t <= nTimes; t++) {
    const chave = `time${t}`;
    if (individuo[chave].length < getCapacidadeTime(t - 1)) {
      // Se meu indivíduo não estiver completo, ele retorna o index dele
      return chave;
    }
  }
  return null;
}

function mutacao(individuo, taxaMutacao = 0.1) {
  if (Math.random() > taxaMutacao) return individuo; // Se a taxa for maior que 0.1 ele não muta

  const time1Index = Math.floor(Math.random() * nTimes) + 1; // Escolhe dois times aleatórios
  let time2Index = Math.floor(Math.random() * nTimes) + 1; // Escolhe dois times aleatórios
  while (time2Index === time1Index) {
    time2Index = Math.floor(Math.random() * nTimes) + 1; // Para garantir que os times sejam diferentes
  }

  const chave1 = `time${time1Index}`;
  const chave2 = `time${time2Index}`;

  if (individuo[chave1].length > 0 && individuo[chave2].length > 0) {
    // Verifico se tem jogadores
    const idx1 = Math.floor(Math.random() * individuo[chave1].length); // Escolhe um jogador de cada time
    const idx2 = Math.floor(Math.random() * individuo[chave2].length); // Escolhe um jogador de cada time

    //Realiza as trocas
    const temp = individuo[chave1][idx1];
    individuo[chave1][idx1] = individuo[chave2][idx2];
    individuo[chave2][idx2] = temp;
  }

  return individuo;
}

function executar() {
  inicializacao_populacao();

  const geracoes = 100;
  const nElitismo = 1;
  const nCruzamento = Math.floor(tamPopulacao * 0.8);

  for (let geracao = 0; geracao < geracoes; geracao++) {
    populacao.sort((a, b) => a.fitness - b.fitness);//ordena do menor ao maior valor fitness

    const novaPopulacao = [];

    novaPopulacao.push(JSON.parse(JSON.stringify(populacao[0])));//fazendo uma copia real do melhor individuo para nova população

    const candidatosCruzamento = selecionarParaCruzamento(populacao, nCruzamento);//seleciona 80% para o cruzamento
    embaralhar(candidatosCruzamento);//embaralhando a ordem dos candidatos a cruzar

    for (let i = 0; i + 1 < candidatosCruzamento.length; i += 2) {
      const pai1 = candidatosCruzamento[i];
      const pai2 = candidatosCruzamento[i + 1];

      const [filho1, filho2] = cruzamento(pai1, pai2);//gerando os filhos

      const filho1Mutado = mutacao(filho1);
      filho1Mutado.fitness = fitness(filho1Mutado);
      novaPopulacao.push(filho1Mutado);

      const filho2Mutado = mutacao(filho2);
      filho2Mutado.fitness = fitness(filho2Mutado);
      novaPopulacao.push(filho2Mutado);
    }

    //preenchendo o restante da população com bons canditos
    while (novaPopulacao.length < tamPopulacao) {
      const individuo = selecaoTorneio(populacao);
      const copiado = JSON.parse(JSON.stringify(individuo));
      copiado.fitness = individuo.fitness;
      novaPopulacao.push(copiado);
    }

    populacao = novaPopulacao;
  }

  populacao.sort((a, b) => a.fitness - b.fitness);
  const melhorSolucao = populacao[0];
  localStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(melhorSolucao));
  renderizarTimes(melhorSolucao);
  return melhorSolucao;
}

// ==========================================
// FLUXO DE TELAS E INTERFACE DE ESTRELAS
// ==========================================

function atualizarIndicadorEtapa(etapa) {
  if (!stepIndicator) return;
  const nomesEtapa = {
    1: "ETAPA 01 / 03 — CONFIGURAÇÃO",
    2: "ETAPA 02 / 03 — JOGADORES",
    3: "ETAPA 03 / 03 — RESULTADO",
  };
  stepIndicator.textContent = nomesEtapa[etapa] || `ETAPA 0${etapa} / 03`;
}

function criarSeletorEstrelas(inputEstrelas, onSelectCallback) {
  const picker = document.createElement("div");
  picker.className = "star-picker";

  const botoes = [];

  function sincronizarVisual(valorAtual) {
    const num = Number(valorAtual);
    botoes.forEach((btn, idx) => {
      const estrelaIdx = idx + 1;
      if (!Number.isNaN(num) && valorAtual !== "" && estrelaIdx <= num) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  for (let s = 1; s <= 5; s++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "star-btn";
    btn.textContent = "★";
    btn.title = `${s} estrela(s) (clique novamente na 1ª para 0)`;
    btn.addEventListener("click", () => {
      const atual = inputEstrelas.value !== "" ? Number(inputEstrelas.value) : -1;
      const novoValor = atual === 1 && s === 1 ? 0 : s;
      inputEstrelas.value = String(novoValor);
      sincronizarVisual(novoValor);
      if (onSelectCallback) onSelectCallback(novoValor);
    });
    botoes.push(btn);
    picker.appendChild(btn);
  }

  return { picker, sincronizarVisual };
}

btnProximo.addEventListener("click", () => {
  const raw = listaTextarea.value.trim();
  if (raw) {
    nomesParseados = parsearLista(raw);
    totalJogadores = nomesParseados.length;
    inputTotalJogadores.value = totalJogadores;
  } else {
    nomesParseados = [];
    totalJogadores = Number(inputTotalJogadores.value);
  }

  jogadoresPorTime = Number(inputJogadoresPorTime.value);

  if (totalJogadores < 5) {
    alert("Mínimo de 5 jogadores!");
    return;
  }

  if (jogadoresPorTime < 2) {
    alert("Mínimo de 2 jogadores por time!");
    return;
  }

  if (jogadoresPorTime > totalJogadores) {
    alert("Jogadores por time não pode ultrapassar o total de jogadores!");
    return;
  }

  nTimes = Math.ceil(totalJogadores / jogadoresPorTime);

  if (nTimes < 2) {
    alert(
      "Com esses valores só será formado 1 time. Aumente o número de jogadores ou diminua jogadores por time."
    );
    return;
  }

  infoTimes.textContent = `Serão ${nTimes} time(s) de até ${jogadoresPorTime} jogadores (${totalJogadores} no total).`;

  listaJogadores.innerHTML = "";
  array_genes.length = 0;

  let encontradosNaMemoria = 0;

  for (let i = 0; i < totalJogadores; i++) {
    const nomeInicial = nomesParseados[i] || "";
    const registroSalvo = nomeInicial ? buscarJogadorNoBanco(nomeInicial) : null;

    const div = document.createElement("div");
    div.className = `jogador-input ${registroSalvo ? "" : "jogador-novo"}`;

    const topRow = document.createElement("div");
    topRow.className = "jogador-top-row";

    const label = document.createElement("label");
    label.setAttribute("for", `nome-${i}`);
    label.textContent = `Jogador #${i + 1}`;

    const statusBadge = document.createElement("span");
    if (registroSalvo) {
      encontradosNaMemoria++;
      statusBadge.className = "status-badge-inline status-salvo";
      statusBadge.textContent = `✓ SALVO (${registroSalvo.estrelas}★)`;
    } else {
      statusBadge.className = "status-badge-inline status-novo";
      statusBadge.textContent = "NOVO • AVALIAR";
    }

    topRow.appendChild(label);
    topRow.appendChild(statusBadge);

    const controlsRow = document.createElement("div");
    controlsRow.className = "jogador-controls-row";

    const inputNome = document.createElement("input");
    inputNome.type = "text";
    inputNome.id = `nome-${i}`;
    inputNome.placeholder = "Nome do jogador";
    inputNome.required = true;
    inputNome.value = nomeInicial;

    const inputEstrelas = document.createElement("input");
    inputEstrelas.type = "number";
    inputEstrelas.id = `estrelas-${i}`;
    inputEstrelas.placeholder = "0-5";
    inputEstrelas.min = "0";
    inputEstrelas.max = "5";
    inputEstrelas.required = true;

    if (registroSalvo) {
      inputEstrelas.value = String(registroSalvo.estrelas);
    }

    const { picker, sincronizarVisual } = criarSeletorEstrelas(
      inputEstrelas,
      (novoValor) => {
        const nomeAtual = inputNome.value.trim();
        if (nomeAtual) {
          salvarJogadorNoBanco(nomeAtual, novoValor);
          statusBadge.className = "status-badge-inline status-salvo";
          statusBadge.textContent = `✓ SALVO (${novoValor}★)`;
          div.classList.remove("jogador-novo");
        }
        salvarEstado();
      }
    );

    sincronizarVisual(inputEstrelas.value);

    inputEstrelas.addEventListener("input", () => {
      if (inputEstrelas.value === "") {
        sincronizarVisual("");
        salvarEstado();
        return;
      }
      let val = Number(inputEstrelas.value);
      if (val > 5) {
        val = 5;
        inputEstrelas.value = "5";
      }
      if (val < 0) {
        val = 0;
        inputEstrelas.value = "0";
      }
      sincronizarVisual(val);

      const nomeAtual = inputNome.value.trim();
      if (nomeAtual) {
        salvarJogadorNoBanco(nomeAtual, val);
        statusBadge.className = "status-badge-inline status-salvo";
        statusBadge.textContent = `✓ SALVO (${val}★)`;
        div.classList.remove("jogador-novo");
      }
      salvarEstado();
    });

    inputNome.addEventListener("input", () => {
      const nomeDigitado = inputNome.value.trim();
      const salvo = buscarJogadorNoBanco(nomeDigitado);
      if (salvo) {
        inputEstrelas.value = String(salvo.estrelas);
        sincronizarVisual(salvo.estrelas);
        statusBadge.className = "status-badge-inline status-salvo";
        statusBadge.textContent = `✓ SALVO (${salvo.estrelas}★)`;
        div.classList.remove("jogador-novo");
      } else if (inputEstrelas.value !== "" && nomeDigitado) {
        statusBadge.className = "status-badge-inline status-novo";
        statusBadge.textContent = "EDITANDO";
      } else {
        statusBadge.className = "status-badge-inline status-novo";
        statusBadge.textContent = "NOVO • AVALIAR";
        div.classList.add("jogador-novo");
      }
      salvarEstado();
    });

    inputNome.addEventListener("change", () => {
      const nomeDigitado = inputNome.value.trim();
      if (nomeDigitado && inputEstrelas.value !== "") {
        salvarJogadorNoBanco(nomeDigitado, Number(inputEstrelas.value));
        statusBadge.className = "status-badge-inline status-salvo";
        statusBadge.textContent = `✓ SALVO (${inputEstrelas.value}★)`;
        div.classList.remove("jogador-novo");
      }
    });

    controlsRow.appendChild(inputNome);
    controlsRow.appendChild(picker);
    controlsRow.appendChild(inputEstrelas);

    div.appendChild(topRow);
    div.appendChild(controlsRow);
    listaJogadores.appendChild(div);
  }

  if (memoryMatchBadge) {
    memoryMatchBadge.textContent = `${encontradosNaMemoria}/${totalJogadores} na memória`;
  }

  configSection.classList.add("hidden");
  resultadoSection.classList.add("hidden");
  jogadoresSection.classList.remove("hidden");
  btn1Sortear.classList.remove("hidden");
  atualizarIndicadorEtapa(2);
  salvarEstado();
});

btnPreencherNovos?.addEventListener("click", () => {
  let preenchidos = 0;
  for (let i = 0; i < totalJogadores; i++) {
    const inputNome = document.getElementById(`nome-${i}`);
    const inputEstrelas = document.getElementById(`estrelas-${i}`);
    if (inputEstrelas && inputEstrelas.value === "") {
      inputEstrelas.value = "3";
      inputEstrelas.dispatchEvent(new Event("input"));
      preenchidos++;
    } else if (inputNome && inputEstrelas) {
      const nome = inputNome.value.trim();
      if (nome && !buscarJogadorNoBanco(nome)) {
        inputEstrelas.value = "3";
        inputEstrelas.dispatchEvent(new Event("input"));
        preenchidos++;
      }
    }
  }
  if (preenchidos > 0) {
    mostrarToast(`${preenchidos} jogador(es) definido(s) com 3 estrelas!`);
  } else {
    mostrarToast("Todos os jogadores já possuem estrelas definidas.");
  }
});

btnSortear.addEventListener("click", () => {
  array_genes.length = 0;

  for (let i = 0; i < totalJogadores; i++) {
    const nomeInput = document.getElementById(`nome-${i}`);
    const estrelasInput = document.getElementById(`estrelas-${i}`);
    const nome = nomeInput ? nomeInput.value.trim() : "";
    const estrelasRaw = estrelasInput ? estrelasInput.value.trim() : "";
    const estrelas = Number(estrelasRaw);

    if (!nome || estrelasRaw === "" || Number.isNaN(estrelas) || estrelas < 0 || estrelas > 5) {
      alert(`Preencha corretamente o jogador #${i + 1}! (Nome e Estrelas de 0 a 5)`);
      estrelasInput?.focus();
      return;
    }

    garantirJogadorSalvo(nome, estrelas);

    array_genes.push({ id: i, nome, estrelas });
  }

  salvarEstado();

  jogadoresSection.classList.add("hidden");
  const inicio = performance.now();
  const solucao = executar();
  const fim = performance.now();
  const tempoTotal = ((fim - inicio) / 1000).toFixed(2);
  console.log(`Tempo total de execução: ${tempoTotal}s`);
  const evento = criarEventoDoResultado(solucao);
  popularSelectTimes();
  atualizarIndicadorEtapa(3);
  if (!evento) mostrarToast("Times sorteados!");
});

btnResortear?.addEventListener("click", () => {
  if (array_genes.length < 5) return;

  if (modoEdicaoTimes) sairDoModoEdicaoTimes();

  if (eventoAtual && !eventoEhHoje(eventoAtual)) {
    mostrarToast("Este evento já foi encerrado e não pode ser alterado.");
    return;
  }

  const solucao = executar();
  const jogos = eventoAtual ? jogosDoEvento(eventoAtual.id) : [];

  if (eventoAtual && jogos.length === 0) {
    atualizarEventoComResultado(eventoAtual, solucao);
  } else {
    criarEventoDoResultado(solucao);
  }

  popularSelectTimes();
});

function montarMensagemWhatsapp(solucao, evento) {
  const chavesTimes = Object.keys(solucao)
    .filter((chave) => /^time\d+$/.test(chave))
    .sort((a, b) => Number(a.slice(4)) - Number(b.slice(4)));

  const separador = "━".repeat(20);
  const linhas = ["⚽ *RESULTADO DO SORTEIO*", ""];

  if (evento?.nome) {
    linhas.push(`📅 *${evento.nome}*`, "");
  }

  let maxNomeLen = 12;
  for (const chave of chavesTimes) {
    for (const jogador of solucao[chave] || []) {
      if (jogador?.nome && jogador.nome.length > maxNomeLen) {
        maxNomeLen = jogador.nome.length;
      }
    }
  }

  chavesTimes.forEach((chave, indiceTime) => {
    const jogadores = (solucao[chave] || []).map((jogador) => ({
      nome: String(jogador?.nome || "").trim(),
      estrelas: Math.max(0, Math.min(5, Math.floor(Number(jogador?.estrelas) || 0))),
    }));

    const numeroTime = chave.slice(4);
    const somaEstrelas = jogadores.reduce((total, jogador) => total + jogador.estrelas, 0);

    linhas.push(separador, "", `🏆 *TIME ${numeroTime}* | ⭐ *${somaEstrelas} ${somaEstrelas === 1 ? "estrela" : "estrelas"}*`, "");

    if (jogadores.length > 0) {
      linhas.push("```");
      jogadores.forEach((jogador, idx) => {
        linhas.push(`${idx + 1}. ${jogador.nome.padEnd(maxNomeLen, " ")} ${"⭐".repeat(jogador.estrelas)}`);
      });
      linhas.push("```", "");
    }
  });

  linhas.push(separador, "", "⚽ *Boa sorte a todos!*");

  if (evento?.id) {
    linhas.push("", `🔗 ${linkDoEvento(evento.id)}`);
  }

  return linhas.join("\n").trim();
}

btnCopiarWhatsapp?.addEventListener("click", () => {
  cliquesCopiarTimes++;
  if (cliquesCopiarTimes >= 10) {
    cliquesCopiarTimes = 0;
    if (tentarEntrarModoEdicaoTimes()) return;
  }

  const timesSalvos = localStorage.getItem(RESULT_STORAGE_KEY);
  if (!timesSalvos) return;
  const solucao = JSON.parse(timesSalvos);

  const textoFinal = montarMensagemWhatsapp(solucao, eventoAtual);
  navigator.clipboard
    .writeText(textoFinal)
    .then(() => {
      mostrarToast("📋 Times copiados! Só colar no WhatsApp.");
    })
    .catch(() => {
      alert("Não foi possível copiar automaticamente:\n\n" + textoFinal);
    });
});

btnExportarImagem?.addEventListener("click", exportarImagemTimes);

// Botão "Voltar para a Lista" na Etapa 2
btn1Sortear.addEventListener("click", () => {
  if (modoEdicaoTimes) sairDoModoEdicaoTimes();
  jogadoresSection.classList.add("hidden");
  resultadoSection.classList.add("hidden");
  configSection.classList.remove("hidden");
  atualizarIndicadorEtapa(1);
});

// Botão "Nova Lista" na Etapa 3 (limpa apenas a sessão atual, MANTÉM o banco de jogadores!)
btnNovo.addEventListener("click", () => {
  if (modoEdicaoTimes) sairDoModoEdicaoTimes();
  localStorage.removeItem(SESSION_STORAGE_KEY);
  localStorage.removeItem(RESULT_STORAGE_KEY);
  limparEventoAtual();
  resultadoSection.classList.add("hidden");
  jogadoresSection.classList.add("hidden");
  configSection.classList.remove("hidden");
  listaTextarea.value = "";
  detectedCount.classList.add("hidden");
  detectedKnown.classList.add("hidden");
  nomesParseados = [];
  inputTotalJogadores.value = "";
  inputJogadoresPorTime.value = "5";
  array_genes.length = 0;
  listaJogadores.innerHTML = "";
  atualizarIndicadorEtapa(1);
});

btnLimparLista?.addEventListener("click", () => {
  listaTextarea.value = "";
  nomesParseados = [];
  inputTotalJogadores.value = "";
  detectedCount.classList.add("hidden");
  detectedKnown.classList.add("hidden");
  localStorage.removeItem(SESSION_STORAGE_KEY);
});

btnColarExemplo?.addEventListener("click", () => {
  configSection.classList.remove("hidden");
  jogadoresSection.classList.add("hidden");
  resultadoSection.classList.add("hidden");
  atualizarIndicadorEtapa(1);
  listaTextarea.value = LISTA_EXEMPLO_BABA;
  listaTextarea.dispatchEvent(new Event("input"));
  listaTextarea.scrollIntoView({ behavior: "smooth", block: "center" });
  mostrarToast("Lista do Baba carregada! Clique em Próximo.");
});

// ==========================================
// SESSÃO ATUAL & PARSER DO WHATSAPP
// ==========================================

function salvarEstado() {
  const jogadores = [];

  for (let i = 0; i < totalJogadores; i++) {
    const nome = document.getElementById(`nome-${i}`)?.value || "";
    const estrelasRaw = document.getElementById(`estrelas-${i}`)?.value;
    const estrelas = estrelasRaw !== "" && estrelasRaw !== undefined ? Number(estrelasRaw) : "";

    jogadores.push({ id: i, nome, estrelas });
  }

  localStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify({
      totalJogadores,
      jogadoresPorTime,
      listaRaw: listaTextarea.value,
      jogadores,
    })
  );
}

function parsearLista(texto) {
  const linhas = texto.split("\n");
  const nomes = [];

  for (const linha of linhas) {
    const t = linha.trim();
    if (!t) continue;

    if (/goleiros?/i.test(t) && !/^\d+\s*[\.\)]/.test(t)) break;

    if (t.startsWith("*")) continue;

    const match = t.match(/^\d+\s*[\.\)]\s*(.*)/);
    if (match) {
      const nome = match[1].trim();
      if (nome) nomes.push(nome);
    }
  }

  return nomes;
}

function atualizarStatusListaDetectada() {
  const raw = listaTextarea.value.trim();
  if (!raw) {
    detectedCount.classList.add("hidden");
    detectedKnown.classList.add("hidden");
    nomesParseados = [];
    return;
  }

  nomesParseados = parsearLista(raw);
  const total = nomesParseados.length;
  inputTotalJogadores.value = total;
  detectedCount.textContent = `${total} jogador(es) detectado(s)`;
  detectedCount.classList.remove("hidden");

  let conhecidos = 0;
  for (const nome of nomesParseados) {
    if (buscarJogadorNoBanco(nome)) {
      conhecidos++;
    }
  }
  const novos = total - conhecidos;
  detectedKnown.textContent = `💾 ${conhecidos} já salvo(s) na memória • ${novos} novo(s)`;
  detectedKnown.classList.remove("hidden");
}

listaTextarea.addEventListener("input", atualizarStatusListaDetectada);

function renderizarTimes(solucao) {
  timesContainer.innerHTML = "";

  for (let t = 1; t <= nTimes; t++) {
    const chave = `time${t}`;
    const jogadoresDoTime = solucao[chave] || [];
    let somaEstrelas = 0;
    let somaPeso = 0;

    const timeCard = document.createElement("div");
    timeCard.className = "time-card";

    const header = document.createElement("div");
    header.className = "time-card-header";

    const titulo = document.createElement("h3");
    titulo.textContent = `Time ${t}`;

    const lista = document.createElement("ul");
    lista.className = "jogador-lista";

    for (const [indice, jogador] of jogadoresDoTime.entries()) {
      const item = document.createElement("li");
      if (modoEdicaoTimes) {
        item.classList.add("jogador-editavel");
        item.addEventListener("click", () => aoClicarJogadorEdicao(t, indice));
      }

      const ident = document.createElement("span");
      ident.className = "jogador-ident";
      ident.appendChild(criarFotoJogador(jogador.nome));

      const spanNome = document.createElement("span");
      spanNome.className = "jogador-lista-nome";
      spanNome.textContent = jogador.nome;
      ident.appendChild(spanNome);

      const spanEstrelas = document.createElement("span");
      spanEstrelas.className = "estrelas";
      spanEstrelas.textContent = `${jogador.estrelas} ⭐`;

      item.appendChild(ident);
      item.appendChild(spanEstrelas);

      if (
        modoEdicaoTimes &&
        jogadorEdicaoSelecionado &&
        jogadorEdicaoSelecionado.time === t &&
        jogadorEdicaoSelecionado.indice === indice
      ) {
        item.classList.add("jogador-selecionado");
      }

      lista.appendChild(item);

      somaEstrelas += Number(jogador.estrelas);
      somaPeso += getPeso(jogador.estrelas);
    }

    const pesoBadge = document.createElement("span");
    pesoBadge.className = "time-peso-badge";
    pesoBadge.textContent = `Peso: ${somaPeso.toFixed(1)}`;

    header.appendChild(titulo);
    header.appendChild(pesoBadge);

    timeCard.appendChild(header);
    timeCard.appendChild(lista);

    const total = document.createElement("div");
    total.className = "total-estrelas";
    total.innerHTML = `<span>Total de Estrelas</span><span>${somaEstrelas} ⭐</span>`;
    timeCard.appendChild(total);

    timesContainer.appendChild(timeCard);
  }

  resultadoSection.classList.remove("hidden");
  partidasSection?.classList.remove("hidden");
}

// ==========================================
// AJUSTE MANUAL DOS TIMES DO RESULTADO
// ==========================================

function aoClicarJogadorEdicao(timeIndice, jogadorIndice) {
  if (!modoEdicaoTimes || !copiaEdicaoTimes) return;
  const listaAlvo = copiaEdicaoTimes[`time${timeIndice}`];
  if (!Array.isArray(listaAlvo) || !listaAlvo[jogadorIndice]) return;

  if (!jogadorEdicaoSelecionado) {
    jogadorEdicaoSelecionado = { time: timeIndice, indice: jogadorIndice };
    renderizarTimes(copiaEdicaoTimes);
    return;
  }

  if (
    jogadorEdicaoSelecionado.time === timeIndice &&
    jogadorEdicaoSelecionado.indice === jogadorIndice
  ) {
    jogadorEdicaoSelecionado = null;
    renderizarTimes(copiaEdicaoTimes);
    return;
  }

  if (jogadorEdicaoSelecionado.time === timeIndice) {
    jogadorEdicaoSelecionado = { time: timeIndice, indice: jogadorIndice };
    renderizarTimes(copiaEdicaoTimes);
    return;
  }

  const listaSelecionado = copiaEdicaoTimes[`time${jogadorEdicaoSelecionado.time}`];
  const indiceSelecionado = jogadorEdicaoSelecionado.indice;
  if (!Array.isArray(listaSelecionado) || !listaSelecionado[indiceSelecionado]) return;

  const temporario = listaAlvo[jogadorIndice];
  listaAlvo[jogadorIndice] = listaSelecionado[indiceSelecionado];
  listaSelecionado[indiceSelecionado] = temporario;

  jogadorEdicaoSelecionado = null;
  renderizarTimes(copiaEdicaoTimes);
}

function garantirToolbarEdicao() {
  const toolbarExistente = document.getElementById("toolbar-edicao-times");
  if (toolbarExistente) return;

  const toolbar = document.createElement("div");
  toolbar.id = "toolbar-edicao-times";
  toolbar.className = "toolbar-edicao hidden";

  const hint = document.createElement("span");
  hint.className = "toolbar-hint";
  hint.textContent = "TOQUE EM DOIS JOGADORES DE TIMES DIFERENTES PARA TROCAR";

  const btns = document.createElement("div");
  btns.className = "toolbar-edicao-btns";

  const btnSalvar = document.createElement("button");
  btnSalvar.type = "button";
  btnSalvar.className = "btn btn-forest btn-sm";
  btnSalvar.textContent = "SALVAR TIMES";
  btnSalvar.addEventListener("click", salvarEdicaoTimes);

  const btnDescartar = document.createElement("button");
  btnDescartar.type = "button";
  btnDescartar.className = "btn btn-ghost btn-sm";
  btnDescartar.textContent = "DESCARTAR";
  btnDescartar.addEventListener("click", sairDoModoEdicaoTimes);

  btns.appendChild(btnSalvar);
  btns.appendChild(btnDescartar);
  toolbar.appendChild(hint);
  toolbar.appendChild(btns);

  resultadoSection.insertBefore(toolbar, timesContainer.nextSibling);
}

function tentarEntrarModoEdicaoTimes() {
  const timesSalvos = localStorage.getItem(RESULT_STORAGE_KEY);
  if (!timesSalvos || resultadoSection.classList.contains("hidden") || modoEvento) {
    return false;
  }

  if (eventoAtual && !eventoEhHoje(eventoAtual)) {
    mostrarToast("Este evento já foi encerrado e não pode ser alterado.");
    return true;
  }

  let solucao = null;
  try {
    solucao = JSON.parse(timesSalvos);
  } catch {
    solucao = null;
  }
  if (!solucao || typeof solucao !== "object") return false;

  modoEdicaoTimes = true;
  jogadorEdicaoSelecionado = null;
  copiaEdicaoTimes = JSON.parse(JSON.stringify(solucao));

  garantirToolbarEdicao();
  renderizarTimes(copiaEdicaoTimes);
  document.getElementById("toolbar-edicao-times")?.classList.remove("hidden");
  resultadoActionsEl?.classList.add("hidden");
  timesContainer.scrollIntoView({ behavior: "smooth", block: "start" });
  mostrarToast("Ajuste manual liberado.");
  return true;
}

function finalizarModoEdicaoTimes() {
  modoEdicaoTimes = false;
  jogadorEdicaoSelecionado = null;
  copiaEdicaoTimes = null;
  document.getElementById("toolbar-edicao-times")?.classList.add("hidden");
  resultadoActionsEl?.classList.remove("hidden");
}

function salvarEdicaoTimes() {
  if (!modoEdicaoTimes || !copiaEdicaoTimes) return;

  if (eventoAtual && !eventoEhHoje(eventoAtual)) {
    mostrarToast("Este evento já foi encerrado e não pode ser alterado.");
    sairDoModoEdicaoTimes();
    return;
  }

  const solucao = copiaEdicaoTimes;
  localStorage.setItem(RESULT_STORAGE_KEY, JSON.stringify(solucao));

  const jogos = eventoAtual ? jogosDoEvento(eventoAtual.id) : [];
  if (eventoAtual && jogos.length === 0) {
    atualizarEventoComResultado(eventoAtual, solucao);
  } else {
    criarEventoDoResultado(solucao);
  }

  finalizarModoEdicaoTimes();
  renderizarTimes(solucao);
  popularSelectTimes();
}

function sairDoModoEdicaoTimes() {
  if (!modoEdicaoTimes) return;

  let solucao = null;
  try {
    const timesSalvos = localStorage.getItem(RESULT_STORAGE_KEY);
    solucao = timesSalvos ? JSON.parse(timesSalvos) : null;
  } catch {
    solucao = null;
  }

  finalizarModoEdicaoTimes();
  if (solucao && typeof solucao === "object") {
    renderizarTimes(solucao);
  }
}

// ==========================================
// IMAGEM DOS TIMES (PNG)
// ==========================================

function baixarBlob(blob, nomeArquivo) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

async function exportarImagemTimes() {
  if (typeof html2canvas !== "function") {
    mostrarToast("Gerador de imagem indisponível — verifique a conexão e recarregue.");
    return;
  }
  if (!timesContainer || timesContainer.children.length === 0) {
    mostrarToast("Sorteie os times antes de gerar a imagem.");
    return;
  }

  if (btnExportarImagem) btnExportarImagem.disabled = true;
  mostrarToast("Gerando imagem...");

  try {
    const largura = timesContainer.offsetWidth || 720;
    const nomeEvento = eventoAtual?.nome || "Times do Baba";
    const dataEvento = eventoAtual?.data || dataHojeISO();

    const wrapper = document.createElement("div");
    wrapper.className = "imagem-times-wrapper";
    wrapper.style.width = `${largura}px`;

    const cabecalho = document.createElement("div");
    cabecalho.className = "imagem-times-cabecalho";

    const titulo = document.createElement("span");
    titulo.className = "imagem-times-titulo";
    titulo.textContent = "TIMES DO BABA";

    const meta = document.createElement("span");
    meta.className = "imagem-times-meta";
    meta.textContent = `${nomeEvento} • ${formatarData(dataEvento)}`;

    cabecalho.appendChild(titulo);
    cabecalho.appendChild(meta);

    wrapper.appendChild(cabecalho);
    wrapper.appendChild(timesContainer.cloneNode(true));
    document.body.appendChild(wrapper);

    let canvas;
    try {
      canvas = await html2canvas(wrapper, {
        scale: 2,
        backgroundColor: "#0e0c0c",
        logging: false,
        useCORS: true,
      });
    } finally {
      wrapper.remove();
    }

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("Falha ao gerar o PNG");

    const nomeArquivo = `times-${dataEvento}.png`;
    const arquivo = new File([blob], nomeArquivo, { type: "image/png" });
    const podeCompartilhar =
      typeof navigator !== "undefined" &&
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: [arquivo] });

    if (podeCompartilhar) {
      try {
        await navigator.share({ files: [arquivo], title: nomeEvento });
        mostrarToast("Imagem compartilhada!");
        return;
      } catch (err) {
        if (err?.name === "AbortError") {
          mostrarToast("Compartilhamento cancelado.");
          return;
        }
      }
    }

    baixarBlob(blob, nomeArquivo);
    mostrarToast("Imagem salva!");
  } catch (err) {
    console.error("Erro ao gerar imagem dos times:", err);
    mostrarToast("Não foi possível gerar a imagem.");
  } finally {
    if (btnExportarImagem) btnExportarImagem.disabled = false;
  }
}

function criarLinhaRanking(posicao, jogador, valor, sufixo, sufixoPlural) {
  const linha = document.createElement("div");
  linha.className = `ranking-linha${posicao === 1 ? " ranking-linha-topo" : ""}`;

  const medalha = document.createElement("span");
  medalha.className = "ranking-medalha";
  medalha.textContent = ["🥇", "🥈", "🥉"][posicao - 1] || `${posicao}º`;

  const ident = document.createElement("span");
  ident.className = "jogador-ident";
  ident.appendChild(criarFotoJogador(jogador, "foto-jogador-lg"));

  const nome = document.createElement("span");
  nome.className = "ranking-nome";
  nome.textContent = jogador;
  ident.appendChild(nome);

  const valorEl = document.createElement("span");
  valorEl.className = "ranking-valor";
  const plural = sufixoPlural !== undefined ? sufixoPlural : `${sufixo}S`;
  valorEl.textContent = `${valor} ${valor === 1 ? sufixo : plural}`;

  linha.appendChild(medalha);
  linha.appendChild(ident);
  linha.appendChild(valorEl);
  return linha;
}

async function exportarImagemRanking() {
  if (typeof html2canvas !== "function") {
    mostrarToast("Gerador de imagem indisponível — verifique a conexão e recarregue.");
    return;
  }
  if (!eventoAtual) {
    mostrarToast("Não há evento para gerar o ranking.");
    return;
  }

  const estatisticas = estatisticasDoEvento(eventoAtual.id);
  const topGols = topDaCategoria(estatisticas, "gols");
  const topAssist = topDaCategoria(estatisticas, "assistencias");

  if (topGols.length === 0 && topAssist.length === 0) {
    mostrarToast("Sem gols ou assistências registrados neste evento.");
    return;
  }

  if (btnFinalizarEvento) btnFinalizarEvento.disabled = true;
  mostrarToast("Gerando ranking...");

  try {
    const nomeEvento = eventoAtual.nome || "Baba";
    const dataEvento = eventoAtual.data || dataHojeISO();
    const largura = Math.max(560, Math.min(720, window.innerWidth - 48));

    const wrapper = document.createElement("div");
    wrapper.className = "imagem-times-wrapper imagem-ranking-wrapper";
    wrapper.style.width = `${largura}px`;

    const cabecalho = document.createElement("div");
    cabecalho.className = "imagem-times-cabecalho";

    const titulo = document.createElement("span");
    titulo.className = "imagem-times-titulo";
    titulo.textContent = "RANKING DO BABA";

    const meta = document.createElement("span");
    meta.className = "imagem-times-meta";
    meta.textContent = `${nomeEvento} • ${formatarData(dataEvento)}`;

    cabecalho.appendChild(titulo);
    cabecalho.appendChild(meta);
    wrapper.appendChild(cabecalho);

    const colunas = document.createElement("div");
    colunas.className = "ranking-colunas";

    const criarColuna = (rotulo, lista, campo, sufixo, sufixoPlural) => {
      const coluna = document.createElement("div");
      coluna.className = "ranking-coluna";

      const tituloColuna = document.createElement("span");
      tituloColuna.className = "ranking-coluna-titulo";
      tituloColuna.textContent = rotulo;
      coluna.appendChild(tituloColuna);

      if (lista.length === 0) {
        const vazio = document.createElement("span");
        vazio.className = "ranking-vazio";
        vazio.textContent = "—";
        coluna.appendChild(vazio);
      } else {
        lista.forEach((item, indice) => {
          coluna.appendChild(
            criarLinhaRanking(indice + 1, item.jogador, item[campo], sufixo, sufixoPlural)
          );
        });
      }
      return coluna;
    };

    colunas.appendChild(criarColuna("ARTILHARIA", topGols, "gols", "GOL", "GOLS"));
    colunas.appendChild(criarColuna("ASSISTÊNCIAS", topAssist, "assistencias", "ASSIST.", "ASSIST."));
    wrapper.appendChild(colunas);

    document.body.appendChild(wrapper);

    let canvas;
    try {
      canvas = await html2canvas(wrapper, {
        scale: 2,
        backgroundColor: "#0e0c0c",
        logging: false,
        useCORS: true,
      });
    } finally {
      wrapper.remove();
    }

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("Falha ao gerar o PNG");

    const nomeArquivo = `ranking-${dataEvento}.png`;
    const arquivo = new File([blob], nomeArquivo, { type: "image/png" });
    const podeCompartilhar =
      typeof navigator !== "undefined" &&
      typeof navigator.canShare === "function" &&
      navigator.canShare({ files: [arquivo] });

    if (podeCompartilhar) {
      try {
        await navigator.share({ files: [arquivo], title: nomeEvento });
        mostrarToast("Ranking compartilhado!");
        return;
      } catch (err) {
        if (err?.name === "AbortError") {
          mostrarToast("Compartilhamento cancelado.");
          return;
        }
      }
    }

    baixarBlob(blob, nomeArquivo);
    mostrarToast("Imagem do ranking salva!");
  } catch (err) {
    console.error("Erro ao gerar imagem do ranking:", err);
    mostrarToast("Não foi possível gerar o ranking.");
  } finally {
    if (btnFinalizarEvento) btnFinalizarEvento.disabled = false;
  }
}

async function finalizarEventoAtual() {
  if (!adminLogado()) {
    mostrarToast("Entre como administrador para encerrar o evento.");
    abrirLogin();
    return;
  }

  if (!eventoAtual) {
    mostrarToast("Não há evento para finalizar.");
    return;
  }

  if (!eventoFinalizado(eventoAtual) && eventoEhHoje(eventoAtual)) {
    const ok = confirm(
      "Finalizar o evento?\n\nIsso tranca o registro de novos jogos de hoje e gera a imagem do ranking (top 3 goleadores e assistentes)."
    );
    if (!ok) return;

    eventoAtual.finalizadoEm = Date.now();
    eventoAtual.atualizadoEm = Date.now();
    salvarEventos(estadoCache.eventos);

    fecharFormularioPartida();
    renderizarPartidas();
    renderizarEventoHeader();
    popularSelectTimes();
    atualizarBotoesPartida();
    mostrarToast("Evento finalizado. Registro de jogos trancado.");

    await salvarEstadoRemoto();
  }

  await exportarImagemRanking();
}

// ==========================================
// RANKING GERAL (TODOS OS EVENTOS)
// ==========================================

function estatisticasGerais() {
  const mapa = new Map();
  const corte = Number(estadoCache.estatisticasResetEm) || 0;

  for (const partida of carregarPartidas()) {
    if (Number(partida.criadoEm || 0) < corte) continue;
    for (const item of estatisticasDaPartida(partida)) {
      const chave = normalizarChaveNome(item.jogador);
      if (!chave) continue;
      const atual = mapa.get(chave) || { jogador: item.jogador, gols: 0, assistencias: 0 };
      atual.gols += item.gols;
      atual.assistencias += item.assistencias;
      mapa.set(chave, atual);
    }
  }

  return mapa;
}

function renderizarRankingGeral() {
  if (!rankingGeralLista) return;

  const ativo = rankingGeralCategoria === "assistencias" ? "assistencias" : "gols";
  btnRankingGols?.classList.toggle("ranking-tab-ativo", ativo === "gols");
  btnRankingAssistencias?.classList.toggle("ranking-tab-ativo", ativo === "assistencias");

  const lista = topDaCategoria(estatisticasGerais(), ativo, rankingGeralLimite);
  rankingGeralLista.innerHTML = "";

  if (lista.length === 0) {
    rankingGeralEmpty?.classList.remove("hidden");
    return;
  }

  rankingGeralEmpty?.classList.add("hidden");

  const sufixo = ativo === "gols" ? "GOL" : "ASSIST.";
  const sufixoPlural = ativo === "gols" ? "GOLS" : "ASSIST.";
  lista.forEach((item, indice) => {
    rankingGeralLista.appendChild(
      criarLinhaRanking(indice + 1, item.jogador, item[ativo], sufixo, sufixoPlural)
    );
  });
}

btnRankingGols?.addEventListener("click", () => {
  rankingGeralCategoria = "gols";
  renderizarRankingGeral();
});

btnRankingAssistencias?.addEventListener("click", () => {
  rankingGeralCategoria = "assistencias";
  renderizarRankingGeral();
});

// ==========================================
// PAINEL VISUAL DO BANCO DE JOGADORES
// ==========================================

function renderizarBancoJogadores(filtro = "") {
  if (!dbGrid) return;
  renderizarRankingGeral();
  const db = carregarBancoJogadores();
  const partidas = carregarPartidas();
  const chaves = Object.keys(db);
  atualizarContadoresMemoria();

  const termo = normalizarChaveNome(filtro);
  const filtradas = chaves
    .filter((chave) => {
      if (!termo) return true;
      return chave.includes(termo) || normalizarChaveNome(db[chave].nome).includes(termo);
    })
    .sort((a, b) => db[a].nome.localeCompare(db[b].nome, "pt-BR"));

  dbGrid.innerHTML = "";

  if (chaves.length === 0) {
    dbEmptyState?.classList.remove("hidden");
    return;
  }

  dbEmptyState?.classList.add("hidden");

  for (const chave of filtradas) {
    const jogador = db[chave];
    const card = document.createElement("div");
    card.className = "db-player-card";

    const top = document.createElement("div");
    top.className = "db-player-top";

    const nomeEl = document.createElement("span");
    nomeEl.className = "db-player-name";
    nomeEl.textContent = jogador.nome;
    nomeEl.title = jogador.nome;

    const btnFoto = document.createElement("button");
    btnFoto.type = "button";
    btnFoto.className = "foto-btn";
    btnFoto.title = `Foto de ${jogador.nome} — clique para ${
      fotoUrlDoJogador(jogador.nome) ? "trocar" : "adicionar"
    }`;

    const inputFoto = document.createElement("input");
    inputFoto.type = "file";
    inputFoto.accept = "image/*";
    inputFoto.className = "hidden";
    inputFoto.addEventListener("change", () => {
      processarFotoSelecionada(chave, inputFoto.files?.[0]);
      inputFoto.value = "";
    });

    btnFoto.appendChild(criarFotoJogador(jogador.nome, "foto-jogador-lg"));
    btnFoto.addEventListener("click", () => inputFoto.click());

    const btnDel = document.createElement("button");
    btnDel.type = "button";
    btnDel.className = "db-delete-btn";
    btnDel.textContent = "✕";
    btnDel.title = `Remover ${jogador.nome} da memória`;
    btnDel.addEventListener("click", () => {
      removerJogadorDoBanco(chave);
      mostrarToast(`${jogador.nome} removido da memória.`);
    });

    top.appendChild(btnFoto);
    top.appendChild(inputFoto);
    top.appendChild(nomeEl);
    top.appendChild(btnDel);

    const bottom = document.createElement("div");
    bottom.className = "db-player-bottom";

    const dummyInput = { value: String(jogador.estrelas) };
    const starLabel = document.createElement("span");
    starLabel.className = "db-star-count";
    const baseEstrelas =
      jogador.estrelasBase !== undefined ? Number(jogador.estrelasBase) : Number(jogador.estrelas);
    starLabel.textContent = `${jogador.estrelas} ★ (base ${baseEstrelas}★ • Peso ${getPeso(jogador.estrelas)})`;

    const { picker, sincronizarVisual } = criarSeletorEstrelas(dummyInput, (novaNota) => {
      salvarJogadorNoBanco(jogador.nome, novaNota);
      mostrarToast(`${jogador.nome} atualizado para ${novaNota} ⭐`);
    });
    sincronizarVisual(jogador.estrelas);

    const stats = calcularEstatisticasJogador(jogador.nome, partidas);
    const statsEl = document.createElement("div");
    statsEl.className = "db-player-stats";
    if (stats.eventos > 0) {
      statsEl.textContent = `${stats.eventos}E • ${stats.gols}G • ${stats.assistencias}A • MÉDIA ${stats.media.toFixed(2)}`;
    } else {
      statsEl.textContent = "SEM EVENTOS REGISTRADOS";
    }

    bottom.appendChild(picker);
    bottom.appendChild(starLabel);

    card.appendChild(top);
    card.appendChild(bottom);
    card.appendChild(statsEl);
    dbGrid.appendChild(card);
  }
}

dbSearchInput?.addEventListener("input", () => {
  renderizarBancoJogadores(dbSearchInput.value);
});

formAddJogador?.addEventListener("submit", (e) => {
  e.preventDefault();
  const nome = dbAddNome.value.trim();
  const estrelas = Number(dbAddEstrelas.value);

  if (!nome || Number.isNaN(estrelas) || estrelas < 0 || estrelas > 5) {
    alert("Informe um nome válido e estrelas entre 0 e 5.");
    return;
  }

  salvarJogadorNoBanco(nome, estrelas);
  atualizarStatusListaDetectada();
  dbAddNome.value = "";
  dbAddEstrelas.value = "3";
  mostrarToast(`Jogador "${nome}" (${estrelas}⭐) salvo na memória!`);
});

btnExportarDb?.addEventListener("click", () => {
  const db = carregarBancoJogadores();
  if (Object.keys(db).length === 0) {
    alert("Não há jogadores salvos para exportar.");
    return;
  }
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "baba_jogadores_estrelas.json";
  a.click();
  URL.revokeObjectURL(url);
  mostrarToast("Backup JSON exportado com sucesso!");
});

inputImportarDb?.addEventListener("change", (e) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const importado = JSON.parse(String(event.target?.result || "{}"));
      const dbAtual = carregarBancoJogadores();
      let count = 0;

      for (const k in importado) {
        const item = importado[k];
        if (item && item.nome && item.estrelas !== undefined) {
          const chave = normalizarChaveNome(item.nome);
          const estrelasItem = Math.max(0, Math.min(5, Number(item.estrelas)));
          const baseItem =
            item.estrelasBase !== undefined
              ? Math.max(0, Math.min(5, Number(item.estrelasBase)))
              : estrelasItem;
          dbAtual[chave] = {
            nome: String(item.nome).trim(),
            estrelas: estrelasItem,
            estrelasBase: baseItem,
            fotoVersao:
              item.fotoVersao !== undefined
                ? Math.max(0, Number(item.fotoVersao) || 0)
                : Number(dbAtual[chave]?.fotoVersao) || 0,
            atualizadoEm: Date.now(),
          };
          count++;
        }
      }

      salvarBancoJogadores(dbAtual);
      renderizarBancoJogadores(dbSearchInput?.value || "");
      atualizarStatusListaDetectada();
      mostrarToast(`${count} jogador(es) importado(s) para a memória!`);
    } catch (err) {
      alert("Arquivo JSON inválido.");
    }
    inputImportarDb.value = "";
  };
  reader.readAsText(file);
});

btnLimparDb?.addEventListener("click", () => {
  const db = carregarBancoJogadores();
  const total = Object.keys(db).length;
  if (total === 0) return;

  if (confirm(`Tem certeza que deseja apagar os ${total} jogadores salvos na memória?`)) {
    estadoCache.jogadores = {};
    persistirEstadoLocal();
    agendarSalvamentoRemoto();
    atualizarContadoresMemoria();
    renderizarBancoJogadores();
    atualizarStatusListaDetectada();
    mostrarToast("Banco de jogadores limpo.");
  }
});

btnRestaurarBase?.addEventListener("click", () => {
  const db = carregarBancoJogadores();
  const temJogos = carregarPartidas().length > 0;
  const alvo = Object.keys(db).filter((chave) => {
    const base =
      db[chave].estrelasBase !== undefined ? Number(db[chave].estrelasBase) : Number(db[chave].estrelas) || 0;
    return Number(db[chave].estrelas) > base;
  });

  if (alvo.length === 0 && !temJogos) {
    mostrarToast("Nada para restaurar: jogadores já estão na base e não há partidas.");
    return;
  }

  const partes = [];
  if (alvo.length > 0) {
    partes.push(`Restaurar as estrelas base de ${alvo.length} jogador(es)?`);
  }
  if (temJogos) {
    partes.push(
      "Também zera a contagem de jogos, gols, assistências e média usada na progressão e nos cards, a partir de agora."
    );
  }
  const aviso = "Os jogos, gols e assistências já registrados continuam no histórico e no ranking.";
  const ok = confirm(`${partes.join("\n\n")}\n\n${aviso}`);
  if (!ok) return;

  const agora = Date.now();
  for (const chave of alvo) {
    db[chave].estrelas = Math.max(
      0,
      Math.min(5, db[chave].estrelasBase !== undefined ? Number(db[chave].estrelasBase) : db[chave].estrelas)
    );
    db[chave].atualizadoEm = agora;
  }

  estadoCache.estatisticasResetEm = agora;

  if (alvo.length > 0) {
    salvarBancoJogadores(db);
  } else {
    persistirEstadoLocal();
    agendarSalvamentoRemoto();
  }

  renderizarBancoJogadores(dbSearchInput?.value || "");

  const mensagens = [];
  if (alvo.length > 0) mensagens.push(`${alvo.length} jogador(es) restaurados para a estrela base`);
  if (temJogos) mensagens.push("estatísticas zeradas a partir de agora");
  mostrarToast(mensagens.join(" e ") + ".");
});

// ==========================================
// INICIALIZAÇÃO
// ==========================================

function restaurarSessaoLocal() {
  const dadosSalvos = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!dadosSalvos) return;

  try {
    const dados = JSON.parse(dadosSalvos);
    totalJogadores = dados.totalJogadores;
    jogadoresPorTime = dados.jogadoresPorTime || 5;
    nomesParseados = dados.listaRaw ? parsearLista(dados.listaRaw) : [];
    nTimes = Math.ceil(totalJogadores / jogadoresPorTime);

    if (dados.listaRaw) {
      listaTextarea.value = dados.listaRaw;
      atualizarStatusListaDetectada();
    }

    inputTotalJogadores.value = totalJogadores;
    inputJogadoresPorTime.value = jogadoresPorTime;

    if (totalJogadores >= 5) {
      btnProximo.click();

      const timesSalvos = localStorage.getItem(RESULT_STORAGE_KEY);
      if (timesSalvos) {
        const solucao = JSON.parse(timesSalvos);
        jogadoresSection.classList.add("hidden");
        renderizarTimes(solucao);
        atualizarIndicadorEtapa(3);

        const eventoId = localStorage.getItem(EVENTO_ATUAL_STORAGE_KEY);
        if (eventoId) {
          const evento = estadoCache.eventos.find((item) => item.id === eventoId);
          if (evento) {
            aplicarEvento(evento, { modo: false });
          } else {
            localStorage.removeItem(EVENTO_ATUAL_STORAGE_KEY);
          }
        }
      }
    }
  } catch (err) {
    console.error("Erro ao restaurar estado:", err);
  }
}

window.addEventListener("load", async () => {
  atualizarUIAdmin();
  renderizarBancoJogadores();
  atualizarContadoresMemoria();
  renderizarEventoHeader();
  atualizarStatusSincronizacao();

  renderizarPartidas();
  popularSelectTimes();

  await sincronizarEstadoComNuvem();

  renderizarBancoJogadores(dbSearchInput?.value || "");
  atualizarContadoresMemoria();
  renderizarEventoHeader();
  renderizarPartidas();
  popularSelectTimes();

  const eventoDaUrl = await carregarEventoDaURL();

  if (!eventoDaUrl) {
    restaurarSessaoLocal();
  }

  assinarRealtime();
  atualizarStatusSincronizacao();
  ultimaTentativaSync = Date.now();

  setInterval(() => {
    verificarViradaDeDia();
    tentarSincronizarSeOffline();
  }, 60000);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      verificarViradaDeDia();
      tentarSincronizarSeOffline();
    }
  });
  window.addEventListener("focus", () => {
    verificarViradaDeDia();
    tentarSincronizarSeOffline();
  });
});
