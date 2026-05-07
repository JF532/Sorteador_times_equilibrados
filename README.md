# Sorteador de Times Equilibrados

Algoritmo Genético desenvolvido para a cadeira de Inteligência Artificial na Universidade Federal do Vale do São Francisco (UNIVASF).

Idealizado para uso pela atlética da faculdade, permitindo sortear times equilibrados com base nas estrelas (nível técnico) de cada jogador.

## Funcionalidades

- **Colar lista do WhatsApp** — cole a lista de jogadores diretamente do grupo
- **Detecção automática** — extrai nomes e ignora goleiros automaticamente
- **Configuração flexível** — escolha quantos jogadores por time
- **Algoritmo Genético** — distribui os jogadores de forma equilibrada
- **Persistência** — os dados são salvos automaticamente no navegador

## Como funciona o AG

1. **População inicial** — 10 distribuições aleatórias dos jogadores nos times
2. **Fitness** — calcula o quão equilibrados os times estão (menor = melhor)
3. **Seleção** — torneio entre 3 indivíduos, os melhores são escolhidos
4. **Cruzamento** — crossover de ponto único com reparo de cromossomos
5. **Mutação** — troca de jogadores entre times (10% de chance)
6. **Elitismo** — o melhor indivíduo sempre passa para a próxima geração
7. **100 gerações** — ao final, exibe a melhor distribuição encontrada

## Como usar

1. Abra o `index.html` no navegador
2. Cole a lista de jogadores ou digite a quantidade manualmente
3. Defina quantos jogadores por time
4. Atribua estrelas (0 a 5) para cada jogador
5. Clique em "Sortear Times"

## Autores

- **João Filipe Peixoto de Carvalho**
- **Leonardo Rodrigues da Silva Santos**

## Universidade

UNIVASF — Universidade Federal do Vale do São Francisco
Disciplina: Inteligência Artificial
