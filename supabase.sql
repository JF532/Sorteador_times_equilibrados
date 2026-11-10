-- Execute este SQL no "SQL Editor" do seu projeto Supabase (uma vez).
-- Depois copie "Project URL" e "anon public key" em Project Settings -> API
-- e cole nas constantes SUPABASE_URL e SUPABASE_ANON_KEY do index.js.

create table if not exists public.baba_estado (
  id text primary key,
  dados jsonb not null default '{}'::jsonb,
  atualizado_em timestamptz not null default now()
);

alter table public.baba_estado enable row level security;

grant select, insert, update on public.baba_estado to anon, authenticated;

drop policy if exists "baba leitura publica" on public.baba_estado;
drop policy if exists "baba insercao publica" on public.baba_estado;
drop policy if exists "baba atualizacao publica" on public.baba_estado;

create policy "baba leitura publica" on public.baba_estado
  for select using (true);

create policy "baba insercao publica" on public.baba_estado
  for insert with check (true);

create policy "baba atualizacao publica" on public.baba_estado
  for update using (true);

insert into public.baba_estado (id, dados)
values ('principal', '{"versao":1,"jogadores":{},"eventos":[],"jogos":[]}'::jsonb)
on conflict (id) do nothing;

-- Realtime para atualizar a lista de jogos entre aparelhos.
do $$
begin
  alter publication supabase_realtime add table public.baba_estado;
exception
  when duplicate_object then null;
end $$;

-- Bucket público para as fotos dos jogadores (JPEG comprimido ~256px).
-- Se o projeto já existe, rode este bloco novamente para criar o bucket.
insert into storage.buckets (id, name, public)
values ('fotos-jogadores', 'fotos-jogadores', true)
on conflict (id) do nothing;

-- Políticas abertas no bucket, no mesmo estilo do resto do projeto:
-- qualquer pessoa com o app pode enviar/atualizar/remover fotos.
grant select, insert, update, delete on storage.objects to anon, authenticated;

drop policy if exists "fotos leitura publica" on storage.objects;
drop policy if exists "fotos insercao publica" on storage.objects;
drop policy if exists "fotos atualizacao publica" on storage.objects;
drop policy if exists "fotos remocao publica" on storage.objects;

create policy "fotos leitura publica" on storage.objects
  for select using (bucket_id = 'fotos-jogadores');

create policy "fotos insercao publica" on storage.objects
  for insert with check (bucket_id = 'fotos-jogadores');

create policy "fotos atualizacao publica" on storage.objects
  for update using (bucket_id = 'fotos-jogadores');

create policy "fotos remocao publica" on storage.objects
  for delete using (bucket_id = 'fotos-jogadores');
