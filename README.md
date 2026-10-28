# Sorteador de Times Equilibrados

Algoritmo Genético desenvolvido para a cadeira de Inteligência Artificial na Universidade Federal do Vale do São Francisco (UNIVASF).

Idealizado para uso pela atlética da faculdade, permitindo sortear times equilibrados com base nas estrelas (nível técnico) de cada jogador.

## Funcionalidades

- **Colar lista do WhatsApp** — cole a lista de jogadores diretamente do grupo
- **Detecção automática** — extrai nomes e ignora goleiros automaticamente
- **Memória de jogadores** — as estrelas de cada jogador ficam salvas no navegador (`localStorage`) e são preenchidas automaticamente nas próximas listas
- **Backup do banco de jogadores** — exportar e importar os jogadores em JSON
- **Configuração flexível** — escolha quantos jogadores por time
- **Algoritmo Genético** — distribui os jogadores de forma equilibrada
- **Copiar para o WhatsApp** — copia os times sorteados já formatados para colar no grupo
- **Persistência** — a partida em andamento é salva automaticamente no navegador

## Como funciona o AG

1. **População inicial** — 10 distribuições aleatórias dos jogadores nos times
2. **Fitness** — calcula o quão equilibrados os times estão (menor = melhor)
3. **Seleção** — torneio entre 3 indivíduos, os melhores são escolhidos
4. **Cruzamento** — crossover de ponto único com reparo de cromossomos
5. **Mutação** — troca de jogadores entre times (10% de chance)
6. **Elitismo** — o melhor indivíduo sempre passa para a próxima geração
7. **100 gerações** — ao final, exibe a melhor distribuição encontrada

Pesos usados por estrela: 5★ = 5, 4★ = 2, 3★ = 1.5, 2★ = 1, 1★ = 0.5.

## Como usar

1. Abra o `index.html` no navegador
2. Cole a lista de jogadores (ou use o botão **Lista exemplo**) ou digite a quantidade manualmente
3. Defina quantos jogadores por time e clique em **Próximo**
4. Confira as estrelas: jogadores já conhecidos vêm preenchidos (`SALVO`); os novos aparecem como `NOVO` para você avaliar (0 a 5)
5. Clique em **Sortear Times**
6. Use **Copiar times para o WhatsApp** para compartilhar o resultado

### Banco de jogadores

Na seção **Banco de Jogadores Salvos** é possível buscar, cadastrar, alterar a nota ou remover jogadores, além de exportar/importar um backup em JSON. Os nomes são comparados sem diferenciar maiúsculas/minúsculas, acentos ou espaços extras (`João Gabriel` = `joao gabriel`). Os dados ficam apenas no navegador de quem usa.

## Autores

- **João Filipe Peixoto de Carvalho**
- **Leonardo Rodrigues da Silva Santos**

## Universidade

UNIVASF — Universidade Federal do Vale do São Francisco
Disciplina: Inteligência Artificial
