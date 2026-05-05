const array_genes = [];
let populacao = [];
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
  const timesCheios = Math.floor(totalJogadores / 5);
  const resto = totalJogadores % 5;
  if (indiceTime < timesCheios) return 5;
  if (indiceTime === timesCheios && resto > 0) return resto;
  return 0;
}

function criarIndividuo() {
  const individuo = {};
  for (let t = 1; t <= nTimes; t++) {
    individuo[`time${t}`] = [];
  }

  const capacidade = [];
  for (let t = 1; t <= nTimes; t++) {
    capacidade.push(getCapacidadeTime(t - 1));
  }

  const genesEmbaralhados = embaralhar([...array_genes]);
  let timeAtual = 0;

  for (const gene of genesEmbaralhados) {
    while (timeAtual < nTimes && individuo[`time${timeAtual + 1}`].length >= capacidade[timeAtual]) {
      timeAtual++;
    }
    if (timeAtual >= nTimes) {
      timeAtual = nTimes - 1;
    }
    individuo[`time${timeAtual + 1}`].push(gene);
  }

  return individuo;
}

function inicializacao_populacao() {
  populacao = [];

  for (let i = 0; i < tamPopulacao; i++) {
    const individuo = criarIndividuo();
    individuo.fitness = fitness(individuo);
    populacao.push(individuo);
  }
}

function fitness(individuo) {
  const somas = [];
  for (let i = 1; i <= nTimes; i++) {
    const chave = `time${i}`;
    let soma = 0;
    for (const jogador of individuo[chave]) {
      soma += jogador.estrelas;
    }
    somas.push(soma);
  }

  let diferencaTotal = 0;
  for (let i = 0; i < somas.length; i++) {
    for (let j = i + 1; j < somas.length; j++) {
      diferencaTotal += Math.abs(somas[i] - somas[j]);
    }
  }

  return diferencaTotal;
}

function selecaoTorneio(tamanhoTorneio = 3) {
  let melhor = null;
  let melhorFitness = Infinity;

  for (let i = 0; i < tamanhoTorneio; i++) {
    const index = Math.floor(Math.random() * populacao.length);
    const individuo = populacao[index];
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
    todosGenesPai1.push(...pai1[chave]);
    todosGenesPai2.push(...pai2[chave]);
  }

  const genesPai1Embaralhados = embaralhar(todosGenesPai1);
  const genesPai2Embaralhados = embaralhar(todosGenesPai2);

  for (const gene of genesPai1Embaralhados) {
    if (!geneUsado(filho, gene)) {
      const timeDestino = encontrarTimeDisponivel(filho);
      if (timeDestino) {
        filho[timeDestino].push(gene);
      }
    }
  }

  for (const gene of genesPai2Embaralhados) {
    if (!geneUsado(filho, gene)) {
      const timeDestino = encontrarTimeDisponivel(filho);
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
    if (individuo[chave].some(j => j.nome === gene.nome)) {
      return true;
    }
  }
  return false;
}

function encontrarTimeDisponivel(individuo) {
  for (let t = 1; t <= nTimes; t++) {
    const chave = `time${t}`;
    if (individuo[chave].length < getCapacidadeTime(t - 1)) {
      return chave;
    }
  }
  return null;
}

function mutacao(individuo, taxaMutacao = 0.1) {
  if (Math.random() > taxaMutacao) return individuo;

  const time1Index = Math.floor(Math.random() * nTimes) + 1;
  let time2Index = Math.floor(Math.random() * nTimes) + 1;
  while (time2Index === time1Index) {
    time2Index = Math.floor(Math.random() * nTimes) + 1;
  }

  const chave1 = `time${time1Index}`;
  const chave2 = `time${time2Index}`;

  if (individuo[chave1].length > 0 && individuo[chave2].length > 0) {
    const idx1 = Math.floor(Math.random() * individuo[chave1].length);
    const idx2 = Math.floor(Math.random() * individuo[chave2].length);

    const temp = individuo[chave1][idx1];
    individuo[chave1][idx1] = individuo[chave2][idx2];
    individuo[chave2][idx2] = temp;
  }

  return individuo;
}

function executar() {
  inicializacao_populacao();

  const geracoes = 100;
  const taxaElitismo = 0.1;
  const nElitismo = Math.max(1, Math.floor(tamPopulacao * taxaElitismo));

  for (let geracao = 0; geracao < geracoes; geracao++) {
    populacao.sort((a, b) => a.fitness - b.fitness);

    const novaPopulacao = [];
    for (let i = 0; i < nElitismo; i++) {
      novaPopulacao.push(JSON.parse(JSON.stringify(populacao[i])));
    }

    while (novaPopulacao.length < tamPopulacao) {
      const pai1 = selecaoTorneio();
      const pai2 = selecaoTorneio();
      let filho = cruzamento(pai1, pai2);
      filho = mutacao(filho);
      filho.fitness = fitness(filho);
      novaPopulacao.push(filho);
    }

    populacao = novaPopulacao;
  }

  populacao.sort((a, b) => a.fitness - b.fitness);
  const melhorSolucao = populacao[0];

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

    for (const jogador of melhorSolucao[chave]) {
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

  resultadoSection.classList.add("hidden");
  executar();
});

btnNovo.addEventListener("click", () => {
  resultadoSection.classList.add("hidden");
  jogadoresSection.classList.add("hidden");
  configSection.classList.remove("hidden");
  inputTotalJogadores.value = "";
  array_genes.length = 0;
  listaJogadores.innerHTML = "";
});
