const array_genes = []; // Array com todos os genes criados
let populacao = []; // Array para colocar todos os indivíduos
const tamPopulacao = 10;
let totalJogadores;
let nTimes;

const configSection = document.getElementById("config-section");
const jogadoresSection = document.getElementById("jogadores-section");
const resultadoSection = document.getElementById("resultado-section");
const inputTotalJogadores = document.getElementById("total-jogadores");
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
  return 5;
}

function getCapacidadeTime(indiceTime) {
  const timesCheios = Math.floor(totalJogadores / 5); // Quantos times vão ter jogadores completos
  const resto = totalJogadores % 5; // Pega quantos jogadores sobraram
  if (indiceTime < timesCheios) return 5; // Os primeiros times vão ficar com 5 jogadores, aí se por acaso sobrar ele vai ficar para o último time
  if (indiceTime === timesCheios && resto > 0) return resto; // Voltar o resto dos jogadores
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

function selecaoTorneio(tamanhoTorneio = 3) {
  let melhor = null;
  let melhorFitness = Infinity;

  for (let i = 0; i < tamanhoTorneio; i++) {
    const index = Math.floor(Math.random() * populacao.length); // Escolhe um indivíduo aleatoriamente
    const individuo = populacao[index]; // Pego o indivíduo que está na posição index do arranjo(populacao)
    if (individuo.fitness < melhorFitness) {
      melhorFitness = individuo.fitness;
      melhor = individuo;
    }
  }

  return melhor;
}

function cruzamento(pai1, pai2) {
  const filho = {};
  for (let t = 1; t <= nTimes; t++) {
    filho[`time${t}`] = [];
  }

  const todosGenesPai1 = [];
  const todosGenesPai2 = [];

  for (let t = 1; t <= nTimes; t++) {
    const chave = `time${t}`;
    todosGenesPai1.push(...pai1[chave]); // Junto todos os jogadores
    todosGenesPai2.push(...pai2[chave]); // Junto todos os jogadores
  }

  const genesPai1Embaralhados = embaralhar(todosGenesPai1);
  const genesPai2Embaralhados = embaralhar(todosGenesPai2);

  for (const gene of genesPai1Embaralhados) {
    if (!geneUsado(filho, gene)) {
      // Verifica se o gene já esta no filho
      const timeDestino = encontrarTimeDisponivel(filho); // Encontra um time disponível
      if (timeDestino) {
        filho[timeDestino].push(gene);
      }
    }
  }

  for (const gene of genesPai2Embaralhados) {
    if (!geneUsado(filho, gene)) {
      // Verifica se o gene já esta no filho
      const timeDestino = encontrarTimeDisponivel(filho); // Encontra um time disponível
      if (timeDestino) {
        filho[timeDestino].push(gene);
      }
    }
  }

  return filho;
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

  const geracoes = 100; // Quantas vezes o algoritmo vai evoluir
  const taxaElitismo = 0.1;
  const nElitismo = Math.max(1, Math.floor(tamPopulacao * taxaElitismo)); // Garante pelo menos um indivíduo
  const taxaCrossover = 0.8;

  for (let geracao = 0; geracao < geracoes; geracao++) {
    populacao.sort((a, b) => a.fitness - b.fitness); // Ordenar a população, melhor indivíduo fica na frente

    const novaPopulacao = [];

    // Elitismo
    for (let i = 0; i < nElitismo; i++) {
      novaPopulacao.push(JSON.parse(JSON.stringify(populacao[i])));
    }

    while (novaPopulacao.length < tamPopulacao) {
      // Gera nova população
      const pai1 = selecaoTorneio();
      const pai2 = selecaoTorneio();
      let filho;

      if (Math.random() < taxaCrossover) {
        filho = cruzamento(pai1, pai2);
      } else {
        filho = JSON.parse(JSON.stringify(Math.random() < 0.5 ? pai1 : pai2));
      }
      filho = mutacao(filho);
      filho.fitness = fitness(filho);
      novaPopulacao.push(filho);
    }

    populacao = novaPopulacao;
  }

  populacao.sort((a, b) => a.fitness - b.fitness); // Após todas as gerações, pega o melhor resultado final
  const melhorSolucao = populacao[0];
  localStorage.setItem("timesGerados", JSON.stringify(melhorSolucao));
  renderizarTimes(melhorSolucao);
}

btnProximo.addEventListener("click", () => {
  totalJogadores = Number(inputTotalJogadores.value);

  if (totalJogadores < 5) {
    alert("Mínimo de 5 jogadores!");
    return;
  }

  nTimes = Math.ceil(totalJogadores / 5);
  infoTimes.textContent = `Serão ${nTimes} time(s) de até 5 jogadores.`;

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
  btn1Sortear.remove();
  executar();
});

btnNovo.addEventListener("click", () => {
  localStorage.removeItem("timesFutsal");
  localStorage.removeItem("timesGerados");
  resultadoSection.classList.add("hidden");
  jogadoresSection.classList.add("hidden");
  configSection.classList.remove("hidden");
  inputTotalJogadores.value = "";
  array_genes.length = 0;
  listaJogadores.innerHTML = "";
});

window.addEventListener("load", () => {
  const dadosSalvos = localStorage.getItem("timesFutsal");
  if (!dadosSalvos) return;

  const dados = JSON.parse(dadosSalvos);

  totalJogadores = dados.totalJogadores;
  nTimes = Math.ceil(totalJogadores / 5);

  inputTotalJogadores.value = totalJogadores;

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
