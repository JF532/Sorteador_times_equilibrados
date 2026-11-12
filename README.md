# Sorteador de Times Equilibrados

Algoritmo Genético desenvolvido para a cadeira de Inteligência Artificial na Universidade Federal do Vale do São Francisco (UNIVASF).

Idealizado para uso pela atlética da faculdade, permitindo sortear times equilibrados com base nas estrelas (nível técnico) de cada jogador.

## Funcionalidades

- **Colar lista do WhatsApp** — cole a lista de jogadores diretamente do grupo
- **Detecção automática** — extrai nomes e ignora goleiros automaticamente
- **Memória de jogadores compartilhada** — as estrelas de cada jogador ficam salvas na nuvem (Supabase) e são preenchidas automaticamente nas próximas listas; sem configuração, funciona no navegador (`localStorage`)
- **Evento compartilhado por link** — cada sorteio gera um link (`?evento=...`) que pode ser aberto em qualquer aparelho
- **Jogos do dia** — qualquer pessoa com o link pode registrar vários jogos na mesma data, sem redigitar os times
- **Evento válido somente no dia** — depois da data do evento, a página passa para somente leitura
- **Atualização em tempo real** — novos jogos e alterações no banco aparecem nos outros aparelhos via Realtime
- **Backup do banco de jogadores** — exportar e importar os jogadores em JSON
- **Fotos dos jogadores** — foto de perfil adicionada no painel administrativo; salva no Storage do Supabase e sincronizada entre aparelhos (com fallback local offline)
- **Finalizar evento com ranking** — tranca o registro de jogos do dia e gera uma imagem do evento com o top 3 goleadores e o top 3 assistentes (com as fotos dos jogadores); exige login do administrador
- **Login do administrador (mock)** — credenciais fixas no código; libera apenas o encerramento/ranking do evento (os jogos continuam abertos para todos)
- **Ranking geral** — seção pública com o Top 10 de gols e assistências de todos os eventos, atualizada em tempo real
- **Configuração flexível** — escolha quantos jogadores por time
- **Algoritmo Genético** — distribui os jogadores de forma equilibrada
- **Copiar para o WhatsApp** — copia os times sorteados já formatados para colar no grupo: cabeçalho com o evento, total de estrelas de cada time, jogadores alinhados em bloco monoespaçado com estrelas visuais (⭐⭐⭐) e o link do evento no final
- **Imagem dos times** — gera um PNG do resultado para baixar ou compartilhar direto no WhatsApp (celular)
- **Persistência** — o sorteio em andamento e o evento atual são salvos automaticamente
- **Histórico de partidas** — registre data, times, gols e assistências de cada jogo
- **Progressão de estrelas** — jogadores sobem de estrela conforme a média de gols + assistências por evento

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

1. Abra o `index.html` no navegador (ou o link publicado)
2. Cole a lista de jogadores (ou use o botão **Lista exemplo**) ou digite a quantidade manualmente
3. Defina quantos jogadores por time e clique em **Próximo**
4. Confira as estrelas: jogadores já conhecidos vêm preenchidos (`SALVO`); os novos aparecem como `NOVO` para você avaliar (0 a 5)
5. Clique em **Sortear Times**: um evento é criado automaticamente
6. Use **Copiar link do evento** e envie no grupo. Quem abrir o link vê apenas a página do evento
7. Em **Jogos do dia**, clique em **+ Adicionar Partida** (disponível somente no dia do evento)
8. Escolha o Time A e o Time B. O grid mostra todos os jogadores dos dois times com nome, estrelas e os campos de gols e assistências
9. Clique em **Salvar Partida**: o formulário fecha e os campos são zerados. Para registrar outro jogo, repita o processo — o mesmo confronto pode ser registrado várias vezes

### Evento e jogos do dia

- Cada sorteio cria um evento com nome, data e times. O link do evento é `...?evento=<id>`.
- A data é definida na criação e **não pode ser alterada**.
- O evento vale somente no dia dele:
  - **No dia:** pode adicionar partidas.
  - **Depois do dia:** somente leitura; adicionar, editar, excluir e limpar ficam bloqueados.
- A validação da data é refeita ao abrir o link, ao voltar para a aba, ao ganhar foco e antes de salvar. Se a página ficar aberta e o dia virar, ela passa para somente leitura.
- **Copiar link** e **Sair do evento** continuam disponíveis em evento passado, pois não alteram dados.
- **Sortear novamente** atualiza o evento atual enquanto não houver jogos registrados. Depois do primeiro jogo, gera um novo evento (o anterior continua no histórico).
- O histórico é agrupado por evento/sorteio. Cada evento aparece em um card recolhido com a data, o nome e o total de partidas/gols; clique no card para abrir e ver os jogos daquele dia.
- O card do evento aberto já inicia expandido. Use **Ver todos os jogos** para alternar para o histórico completo, com todos os eventos recolhidos; ao sair do evento, o histórico completo também fica visível.
- Jogos antigos sem evento vinculado são agrupados pela data.

### Finalizar evento e ranking do dia

Na seção de jogos, ao lado do histórico, o botão **FINALIZAR EVENTO** aparece quando o evento do dia tem pelo menos um jogo registrado. O encerramento exige login de administrador (veja abaixo):

- Ao clicar, ele pede confirmação, **tranca o registro de novos jogos** daquele evento (igual à virada do dia) e gera uma **imagem do ranking**: top 3 goleadores e top 3 assistentes do evento, com as fotos dos jogadores, medalhas 🥇🥈🥉 e o nome/data do evento.
- Empates na contagem são desempatados pela **menor estrela** (quem tem menos estrelas fica na frente); se empatar também nas estrelas, segue a ordem alfabética.
- A imagem pode ser compartilhada direto no WhatsApp (Web Share) ou baixada como `ranking-AAAA-MM-DD.png`.
- Depois de finalizado (ou depois da virada do dia), o botão vira **GERAR RANKING** — a imagem pode ser gerada quantas vezes quiser, sem trancar nada de novo.
- O status finalizado faz parte do evento e sincroniza entre aparelhos.

### Login do administrador (mock)

O acesso administrativo de encerramento usa **credenciais fixas** no código:

- **Usuário:** `admin`
- **Senha:** `eniacadmin`

Clique em **ENTRAR** na navbar para abrir o modal e informe as credenciais. Enquanto não estiver logado, o botão de finalizar/gerar ranking fica oculto (uma dica aparece no lugar) e o encerramento é bloqueado. O botão **SAIR** remove a sessão.

O que **não** muda: qualquer pessoa com o link continua podendo registrar jogos, e o painel do banco de jogadores continua sendo liberado pelos 10 cliques no ícone.

> **Aviso:** este login é apenas cosmético (client-side). As credenciais ficam visíveis no código-fonte e não há backend validando a sessão — ele serve para evitar encerramento acidental, não é uma barreira de segurança.

### Ranking geral

A seção **RANKING GERAL** (no menu) mostra o **Top 10** de gols e assistências somando todos os eventos registrados, com abas para alternar entre as duas categorias, fotos e estrelas dos jogadores. O desempate é o mesmo do ranking do dia (mais gols/assistências, depois menor estrela, depois ordem alfabética).

O ranking respeita o corte do **RESTAURAR ESTRELAS BASE**: jogos anteriores ao corte deixam de contar para a classificação, mas continuam no histórico de eventos. Eventos não finalizados também entram no ranking geral.

### Eventos e progressão de estrelas

Depois de sortear os times, a seção **Jogos do dia** aparece logo abaixo do resultado, para qualquer pessoa com o link:

1. Clique em **+ Adicionar Partida**
2. Escolha o Time A e o Time B (times do evento)
3. O grid mostra todos os jogadores dos dois times, com nome, estrelas e os campos **GOLS** e **ASSIST.** da nova partida
4. Um jogador pode ter vários gols e assistências; o placar é atualizado em tempo real
5. **Salvar Partida** fecha o formulário e zera os campos; **Cancelar** fecha sem salvar
6. A data aparece apenas como leitura (`DATA DA PARTIDA: 29/10/2026`)

A cada partida salva, o sistema recalcula as estatísticas do jogador: `média = (gols + assistências) / eventos`, onde **eventos** é o número de eventos distintos em que ele participou (partidas do mesmo dia/evento contam uma vez só). A partir de 3 eventos, a estrela sobe conforme as faixas da média (média 3.0 = +1★, 6.0 = +2★, etc.), sempre limitada a 5★. **As estrelas nunca descem**, nem ao excluir uma partida do histórico. Editar a nota manualmente redefine a estrela base do jogador.

## Sincronização com Supabase (opcional)

Sem configuração, o app continua funcionando em **MODO LOCAL**: os dados ficam apenas no navegador e o link do evento não funciona em outros aparelhos.

Para sincronizar entre aparelhos:

1. Crie um projeto gratuito em <https://supabase.com>.
2. No **SQL Editor**, execute o conteúdo de `supabase.sql`. Ele cria a tabela `public.baba_estado`, ativa RLS pública, insere a linha `principal` e adiciona a tabela ao Realtime.
3. Em **Project Settings → API**, copie a **Project URL** e a **anon public key**.
4. Abra `index.js` e preencha:
   ```js
   const SUPABASE_URL = "https://SEU-PROJETO.supabase.co";
   const SUPABASE_ANON_KEY = "SUA_ANON_KEY";
   ```
5. Publique o app (GitHub Pages, Netlify, Vercel etc.) ou abra localmente. O status da navbar muda para **NUVEM** quando a conexão funciona.

> **Segurança:** a chave `anon` é pública por design. As políticas de RLS deste projeto são intencionalmente abertas para que qualquer pessoa com o link leia e edite o mesmo evento. Não use este projeto para dados sensíveis. Projetos gratuitos do Supabase podem ser pausados por inatividade; se o app ficar offline, reative o projeto no painel.

### Estrutura dos dados

Tudo fica em uma única linha (`id = 'principal'`) da tabela `public.baba_estado`, na coluna `dados jsonb`:

```json
{
  "versao": 1,
  "estatisticasResetEm": 0,
  "jogadores": {
    "joao gabriel": { "nome": "João Gabriel", "estrelas": 4, "estrelasBase": 3, "fotoVersao": 0, "atualizadoEm": 0 }
  },
  "eventos": [{ "id": "...", "nome": "Baba 29/10/2026", "data": "2026-10-29", "times": [] }],
  "jogos": [
    {
      "id": "...",
      "eventoId": "...",
      "data": "2026-10-29",
      "timeA": {},
      "timeB": {},
      "estatisticas": [{ "jogador": "João", "gols": 2, "assistencias": 1 }]
    }
  ]
}
```

Jogos antigos que ainda usam a lista `eventos` continuam válidos: a função `estatisticasDaPartida` usa `estatisticas` quando existe e, caso contrário, agrega os eventos antigos de gol e assistência. Jogos sem `eventoId` são vinculados automaticamente ao evento quando há um único evento com a mesma data e os mesmos times.

## Autores

- **João Filipe Peixoto de Carvalho**
- **Leonardo Rodrigues da Silva Santos**

## Universidade

UNIVASF — Universidade Federal do Vale do São Francisco
Disciplina: Inteligência Artificial
