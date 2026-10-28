const array_genes = []; // Array com todos os genes criados
let populacao = []; // Array para colocar todos os indivíduos
const tamPopulacao = 10;
let totalJogadores;
let jogadoresPorTime;
let nTimes;

const DB_STORAGE_KEY = "baba_jogadores_db_v2";
const SESSION_STORAGE_KEY = "timesFutsal";
const RESULT_STORAGE_KEY = "timesGerados";

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
const fitnessBadge = document.getElementById("fitness-badge");
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

let nomesParseados = [];
let toastTimeout = null;

// ==========================================
// MÓDULO DE PERSISTÊNCIA: BANCO DE JOGADORES
// ==========================================

function normalizarChaveNome(nome) {
  return String(nome || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function carregarBancoJogadores() {
  try {
    const raw = localStorage.getItem(DB_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (err) {
    console.error("Erro ao ler banco de jogadores:", err);
    return {};
  }
}

function salvarBancoJogadores(db) {
  localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
  atualizarContadoresMemoria();
}

function buscarJogadorNoBanco(nome) {
  const chave = normalizarChaveNome(nome);
  if (!chave) return null;
  const db = carregarBancoJogadores();
  return db[chave] || null;
}

function salvarJogadorNoBanco(nome, estrelas) {
  const nomeLimpo = String(nome || "").trim();
  const chave = normalizarChaveNome(nomeLimpo);
  if (!chave) return;

  const nota = Math.max(0, Math.min(5, Number(estrelas)));
  if (Number.isNaN(nota)) return;

  const db = carregarBancoJogadores();
  db[chave] = {
    nome: nomeLimpo,
    estrelas: nota,
    atualizadoEm: Date.now(),
  };
  salvarBancoJogadores(db);
  renderizarBancoJogadores(dbSearchInput?.value || "");
}

function removerJogadorDoBanco(chave) {
  const db = carregarBancoJogadores();
  if (db[chave]) {
    delete db[chave];
    salvarBancoJogadores(db);
    renderizarBancoJogadores(dbSearchInput?.value || "");
     atualizarStatusListaDetectada();
  }
}

function atualizarContadoresMemoria() {
  const db = carregarBancoJogadores();
  const total = Object.keys(db).length;
  if (navSavedCount) navSavedCount.textContent = total;
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

    // Salva permanentemente no banco de jogadores por nome!
    salvarJogadorNoBanco(nome, estrelas);

    array_genes.push({ id: i, nome, estrelas });
  }

  salvarEstado();

  jogadoresSection.classList.add("hidden");
  const inicio = performance.now();
  executar();
  const fim = performance.now();
  const tempoTotal = ((fim - inicio) / 1000).toFixed(2);
  console.log(`Tempo total de execução: ${tempoTotal}s`);
  atualizarIndicadorEtapa(3);
  mostrarToast("Times sorteados e estrelas salvas na memória!");
});

btnResortear?.addEventListener("click", () => {
  if (array_genes.length < 5) return;
  executar();
  mostrarToast("Nova combinação equilibrada gerada!");
});

btnCopiarWhatsapp?.addEventListener("click", () => {
  const timesSalvos = localStorage.getItem(RESULT_STORAGE_KEY);
  if (!timesSalvos) return;
  const solucao = JSON.parse(timesSalvos);

  let maxNomeLen = 12;
  for (let t = 1; t <= nTimes; t++) {
    const timeJogadores = solucao[`time${t}`] || [];
    timeJogadores.forEach((j) => {
      if (j.nome && j.nome.length > maxNomeLen) {
        maxNomeLen = j.nome.length;
      }
    });
  }

  const linhas = ["*⚽ TIMES SORTEADOS*", ""];
  for (let t = 1; t <= nTimes; t++) {
    const chave = `time${t}`;
    const timeJogadores = solucao[chave] || [];
    let somaEstrelas = 0;
    timeJogadores.forEach((j) => {
      somaEstrelas += Number(j.estrelas);
    });

    linhas.push(`*🏆 TIME ${t}* _(${somaEstrelas}★)_\`\`\``);
    timeJogadores.forEach((j, idx) => {
      const ehUltimo = idx === timeJogadores.length - 1;
      const nomeAlinhado = String(j.nome || "").padEnd(maxNomeLen, " ");
      const linhaJogador = `${idx + 1}. ${nomeAlinhado} (${j.estrelas}★)${ehUltimo ? "```" : ""}`;
      linhas.push(linhaJogador);
    });
    linhas.push("");
  }

  const textoFinal = linhas.join("\n").trim();
  navigator.clipboard
    .writeText(textoFinal)
    .then(() => {
      mostrarToast("📋 Times copiados! Só colar no WhatsApp.");
    })
    .catch(() => {
      alert("Não foi possível copiar automaticamente:\n\n" + textoFinal);
    });
});

// Botão "Voltar para a Lista" na Etapa 2
btn1Sortear.addEventListener("click", () => {
  jogadoresSection.classList.add("hidden");
  resultadoSection.classList.add("hidden");
  configSection.classList.remove("hidden");
  atualizarIndicadorEtapa(1);
});

// Botão "Nova Lista" na Etapa 3 (limpa apenas a sessão atual, MANTÉM o banco de jogadores!)
btnNovo.addEventListener("click", () => {
  localStorage.removeItem(SESSION_STORAGE_KEY);
  localStorage.removeItem(RESULT_STORAGE_KEY);
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

  if (fitnessBadge && solucao.fitness !== undefined) {
    fitnessBadge.textContent = `Desvio Fitness: ${Number(solucao.fitness).toFixed(1)}`;
  }

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

    for (const jogador of jogadoresDoTime) {
      const item = document.createElement("li");
      const spanNome = document.createElement("span");
      spanNome.textContent = jogador.nome;

      const spanEstrelas = document.createElement("span");
      spanEstrelas.className = "estrelas";
      spanEstrelas.textContent = `${jogador.estrelas} ⭐`;

      item.appendChild(spanNome);
      item.appendChild(spanEstrelas);
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
}

// ==========================================
// PAINEL VISUAL DO BANCO DE JOGADORES
// ==========================================

function renderizarBancoJogadores(filtro = "") {
  if (!dbGrid) return;
  const db = carregarBancoJogadores();
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

    const btnDel = document.createElement("button");
    btnDel.type = "button";
    btnDel.className = "db-delete-btn";
    btnDel.textContent = "✕";
    btnDel.title = `Remover ${jogador.nome} da memória`;
    btnDel.addEventListener("click", () => {
      removerJogadorDoBanco(chave);
      mostrarToast(`${jogador.nome} removido da memória.`);
    });

    top.appendChild(nomeEl);
    top.appendChild(btnDel);

    const bottom = document.createElement("div");
    bottom.className = "db-player-bottom";

    const dummyInput = { value: String(jogador.estrelas) };
    const starLabel = document.createElement("span");
    starLabel.className = "db-star-count";
    starLabel.textContent = `${jogador.estrelas} ★ (Peso ${getPeso(jogador.estrelas)})`;

    const { picker, sincronizarVisual } = criarSeletorEstrelas(dummyInput, (novaNota) => {
      salvarJogadorNoBanco(jogador.nome, novaNota);
      mostrarToast(`${jogador.nome} atualizado para ${novaNota} ⭐`);
    });
    sincronizarVisual(jogador.estrelas);

    bottom.appendChild(picker);
    bottom.appendChild(starLabel);

    card.appendChild(top);
    card.appendChild(bottom);
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
          dbAtual[chave] = {
            nome: String(item.nome).trim(),
            estrelas: Math.max(0, Math.min(5, Number(item.estrelas))),
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
    localStorage.removeItem(DB_STORAGE_KEY);
    atualizarContadoresMemoria();
    renderizarBancoJogadores();
    atualizarStatusListaDetectada();
    mostrarToast("Banco de jogadores limpo.");
  }
});

// ==========================================
// INICIALIZAÇÃO
// ==========================================

window.addEventListener("load", () => {
  renderizarBancoJogadores();
  atualizarContadoresMemoria();

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
      }
    }
  } catch (err) {
    console.error("Erro ao restaurar estado:", err);
  }
});
