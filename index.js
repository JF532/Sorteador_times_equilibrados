const array_genes = [];
const populacao = [];

// 2. Fitness (aptidão) - calcula o quão apto é um cromossomo de acordo com sua
// função objetivo.
// 3. Seleção: seleciona M indivíduos aptos de uma população para gerar novos
// indivíduos, com M < N, sendo N o total de soluções por geração. Em geral, os
// pais são selecionados a partir de uma probabilidade proporcional (p) a seus
// valores de fitness.

function embaralhar(array) {
  return array.sort(() => Math.random() - 0.5);
}

function inicializacao_genes() {
  for (let i = 0; i < 10; i++) {
    const gene = {
      nome: prompt("Qual o nome?"),
      estrelas: Number(prompt("Estrelas?")),
    };
    array_genes.push(gene);
  }
}

function incializacao_individuos() {
  /// A principio tô simulando só para 10 jogadores, conforme aumentasse, teria que mudar aqui
  let contador = 0;

  const individuos = {
    jogadores: [],
    jogadores_2: [],
    fitness: "",
  };

  const array_genes_embaralhado = embaralhar(array_genes);

  for (let i = 0; i < array_genes_embaralhado.length; i++) {
    if (contador < array_genes_embaralhado.length / 2) {
      individuos.jogadores.push(array_genes_embaralhado[i]);
    } else {
      individuos.jogadores_2.push(array_genes_embaralhado[i]);
    }
    contador++;
  }

  populacao.push(individuos);
}

function inicializacao_populacao() {
  populacao = [];

  // Criei a população com 10 individuos
  for (let i = 0; i < 10; i++) {
    incializacao_individuos();
  }

  for (let i = 0; i < populacao.length; i++) {
    const individuo = populacao[i];
    individuo.fitness = fitness(individuo);
  }
}

function fitness(individuo) { // Aqui ainda tá limitado também, para só dois times, a gente consegue limitar para 6, acho que é o ideial
  let soma_estrelas_time_1 = 0;
  let soma_estrelas_time_2 = 0;

  for (let j of individuo.jogadores) {
    soma_estrelas_time_1 += j.estrelas;
  }

  for (let j of individuo.jogadores_2) {
    soma_estrelas_time_2 += j.estrelas;
  }

  return Math.abs(soma_estrelas_time_1 - soma_estrelas_time_2);
}

function selecao() {}
