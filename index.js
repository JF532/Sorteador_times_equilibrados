const array_genes = []; // Array com todos os genes criados
let populacao = []; // Array para colocar todos os indivíduos
const tamPopulacao = 10;
let totalJogadores;
let jogadoresPorTime;
let nTimes;

const configSection = document.getElementById("config-section");
const jogadoresSection = document.getElementById("jogadores-section");
const resultadoSection = document.getElementById("resultado-section");
const inputTotalJogadores = document.getElementById("total-jogadores");
const inputJogadoresPorTime = document.getElementById("jogadores-por-time");
const btnProximo = document.getElementById("btn-proximo");
const btnSortear = document.getElementById("btn-sortear");
const btnNovo = document.getElementById("btn-novo");
const listaJogadores = document.getElementById("lista-jogadores");
const infoTimes = document.getElementById("info-times");
const timesContainer = document.getElementById("times-container");
const btn1Sortear = document.getElementById("btn-novo-jogadores");

function getPeso(estrelas) {
  switch (estrelas) {
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

/*função para facilitar corte para cruzamento
  trasforma disso [time1(leo, jf, carlos), time2(...)
  para isso [3,4,5,6] onde o valor dentro é o time em que o jogador tá e o index
  é o jogador em relação a o array_genes*/
function individuoParaCodificacao(individuo) {
  const codificacao = [];
  for (const gene of array_genes) {
    for (let t = 1; t <= nTimes; t++) {
      const chave = `time${t}`;
      if (individuo[chave].some((j) => j.nome === gene.nome)) {//verifica se o gene ta nesse time, se tiver passa para o prox gene
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
    if (individuo[chave].some((j) => j.nome === gene.nome)) {
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
  localStorage.setItem("timesGerados", JSON.stringify(melhorSolucao));
  renderizarTimes(melhorSolucao);
}

btnProximo.addEventListener("click", () => {
  totalJogadores = Number(inputTotalJogadores.value);
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
    alert("Com esses valores só será formado 1 time. Aumente o número de jogadores ou diminua jogadores por time.");
    return;
  }

  infoTimes.textContent = `Serão ${nTimes} time(s) de até ${jogadoresPorTime} jogadores.`;

  listaJogadores.innerHTML = "";
  array_genes.length = 0;

  for (let i = 0; i < totalJogadores; i++) {
    const div = document.createElement("div");
    div.className = "jogador-input";

    const label = document.createElement("label");
    label.textContent = `Jogador ${i + 1}`;

    const inputNome = document.createElement("input");
    inputNome.type = "text";
    inputNome.id = `nome-${i}`;
    inputNome.placeholder = "Nome";
    inputNome.required = true;

    const inputEstrelas = document.createElement("input");
    inputEstrelas.type = "number";
    inputEstrelas.id = `estrelas-${i}`;
    inputEstrelas.placeholder = "Estrelas";
    inputEstrelas.min = "0";
    inputEstrelas.max = "5";
    inputEstrelas.required = true;
    inputEstrelas.addEventListener("input", () => {
      let val = Number(inputEstrelas.value);
      if (val > 5) inputEstrelas.value = 5;
      if (val < 0) inputEstrelas.value = 0;
    });
    inputNome.addEventListener("input", salvarEstado);
    inputEstrelas.addEventListener("input", salvarEstado);
    div.appendChild(label);
    div.appendChild(inputNome);
    div.appendChild(inputEstrelas);
    listaJogadores.appendChild(div);
  }

  configSection.classList.add("hidden");
  jogadoresSection.classList.remove("hidden");
  btn1Sortear.classList.remove("hidden");
});

btnSortear.addEventListener("click", () => {
  array_genes.length = 0;

  for (let i = 0; i < totalJogadores; i++) {
    const nome = document.getElementById(`nome-${i}`).value.trim();
    const estrelas = Number(document.getElementById(`estrelas-${i}`).value);

    if (!nome || estrelas < 0 || estrelas > 5) {
      alert(`Preencha corretamente o jogador ${i + 1}! (Estrelas: 0 a 5)`);
      return;
    }

    array_genes.push({ nome, estrelas });
  }
  const dados = {
    totalJogadores,
    jogadores: array_genes,
  };

  localStorage.setItem("timesFutsal", JSON.stringify(dados));

  resultadoSection.classList.add("hidden");
  btn1Sortear.classList.add("hidden");
  const inicio = performance.now();
  executar();
  const fim = performance.now();
  const tempoTotal = ((fim - inicio) / 1000).toFixed(2);
  console.log(`Tempo total de execução: ${tempoTotal}s`);
});

btn1Sortear.addEventListener("click", () => {
  jogadoresSection.classList.add("hidden");
  configSection.classList.remove("hidden");
  inputTotalJogadores.value = "";
  inputJogadoresPorTime.value = "5";
  array_genes.length = 0;
  listaJogadores.innerHTML = "";
  localStorage.removeItem("timesFutsal");
});

btnNovo.addEventListener("click", () => {
  localStorage.removeItem("timesFutsal");
  localStorage.removeItem("timesGerados");
  resultadoSection.classList.add("hidden");
  jogadoresSection.classList.add("hidden");
  configSection.classList.remove("hidden");
  inputTotalJogadores.value = "";
  inputJogadoresPorTime.value = "5";
  array_genes.length = 0;
  listaJogadores.innerHTML = "";
});

window.addEventListener("load", () => {
  const dadosSalvos = localStorage.getItem("timesFutsal");
  if (!dadosSalvos) return;

  const dados = JSON.parse(dadosSalvos);

  totalJogadores = dados.totalJogadores;
  jogadoresPorTime = dados.jogadoresPorTime || 5;
  nTimes = Math.ceil(totalJogadores / jogadoresPorTime);

  inputTotalJogadores.value = totalJogadores;
  inputJogadoresPorTime.value = jogadoresPorTime;

  btnProximo.click();

  // espera o DOM atualizar
  setTimeout(() => {
    dados.jogadores.forEach((jogador, i) => {
      const nomeInput = document.getElementById(`nome-${i}`);
      const estrelasInput = document.getElementById(`estrelas-${i}`);

      if (nomeInput) nomeInput.value = jogador.nome;
      if (estrelasInput) estrelasInput.value = jogador.estrelas;
    });
  }, 0);

  const timesSalvos = localStorage.getItem("timesGerados");

  if (timesSalvos) {
    const solucao = JSON.parse(timesSalvos);
    renderizarTimes(solucao);
  }
});

function salvarEstado() {
  const jogadores = [];

  for (let i = 0; i < totalJogadores; i++) {
    const nome = document.getElementById(`nome-${i}`)?.value || "";
    const estrelas = Number(
      document.getElementById(`estrelas-${i}`)?.value || 0,
    );

    jogadores.push({ nome, estrelas });
  }

  localStorage.setItem(
    "timesFutsal",
    JSON.stringify({
      totalJogadores,
      jogadoresPorTime,
      jogadores,
    }),
  );
}

function renderizarTimes(solucao) {
  timesContainer.innerHTML = "";

  for (let t = 1; t <= nTimes; t++) {
    const chave = `time${t}`;
    let soma = 0;

    const timeCard = document.createElement("div");
    timeCard.className = "time-card";

    const titulo = document.createElement("h3");
    titulo.textContent = `Time ${t}`;
    timeCard.appendChild(titulo);

    const lista = document.createElement("ul");
    lista.className = "jogador-lista";

    for (const jogador of solucao[chave]) {
      const item = document.createElement("li");
      item.innerHTML = `<span>${jogador.nome}</span><span class="estrelas">${jogador.estrelas}⭐</span>`;
      lista.appendChild(item);
      soma += jogador.estrelas;
    }

    timeCard.appendChild(lista);

    const total = document.createElement("div");
    total.className = "total-estrelas";
    total.textContent = `Total: ${soma} estrelas`;
    timeCard.appendChild(total);

    timesContainer.appendChild(timeCard);
  }

  resultadoSection.classList.remove("hidden");
}
