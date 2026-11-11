-- =====================================================================
-- SCHEMA DO BANCO — cole TUDO no Supabase ▸ SQL Editor ▸ New query ▸ Run
--
-- Pode rodar quantas vezes quiser (é idempotente): não apaga dados.
-- Segurança: RLS ligado em todas as tabelas. Regra "a equipe compartilha tudo":
-- qualquer usuário LOGADO lê e grava; visitantes anônimos não acessam nada.
-- =====================================================================

-- Extensões ------------------------------------------------------------
create extension if not exists pgcrypto; -- gen_random_uuid()

-- Função que atualiza a coluna updated_at em todo UPDATE ----------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =====================================================================
-- CONFIGURACOES — linha única com os dados do negócio
-- (a coluna "unica" só aceita TRUE e é UNIQUE, então nunca haverá 2 linhas)
-- =====================================================================
create table if not exists public.configuracoes (
  id                uuid primary key default gen_random_uuid(),
  unica             boolean not null default true unique check (unica),
  nome_negocio      text not null default 'Meu Negócio' check (char_length(nome_negocio) between 1 and 80),
  whatsapp          text check (whatsapp is null or whatsapp ~ '^[0-9]{10,13}$'),
  cidade            text,
  endereco          text,
  instagram         text,
  cor_primaria      text not null default '#2F3640' check (cor_primaria ~ '^#[0-9A-Fa-f]{6}$'),
  mensagem_whatsapp text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

drop trigger if exists trg_configuracoes_updated_at on public.configuracoes;
create trigger trg_configuracoes_updated_at
  before update on public.configuracoes
  for each row execute function public.set_updated_at();

alter table public.configuracoes enable row level security;

drop policy if exists "configuracoes_select_autenticado" on public.configuracoes;
create policy "configuracoes_select_autenticado" on public.configuracoes
  for select to authenticated using (true);

drop policy if exists "configuracoes_insert_autenticado" on public.configuracoes;
create policy "configuracoes_insert_autenticado" on public.configuracoes
  for insert to authenticated with check (true);

drop policy if exists "configuracoes_update_autenticado" on public.configuracoes;
create policy "configuracoes_update_autenticado" on public.configuracoes
  for update to authenticated using (true) with check (true);

drop policy if exists "configuracoes_delete_autenticado" on public.configuracoes;
create policy "configuracoes_delete_autenticado" on public.configuracoes
  for delete to authenticated using (true);

-- Garante que a linha de configuração exista (não altera se já existir).
insert into public.configuracoes (unica) values (true)
on conflict (unica) do nothing;

-- =====================================================================
-- PERSONALIZAÇÃO DA MARCA (tela /personalizacao)
-- Logo, cores, fonte, nome exibido, subtítulo, tema padrão e arredondamento.
-- Colunas novas em "configuracoes" (add column if not exists = seguro rodar de novo).
-- =====================================================================
alter table public.configuracoes add column if not exists nome_exibicao text;
alter table public.configuracoes add column if not exists subtitulo     text;
alter table public.configuracoes add column if not exists logo_url      text;
alter table public.configuracoes add column if not exists cor_destaque  text not null default '#E1B12C';
alter table public.configuracoes add column if not exists fonte         text not null default 'moderna';
alter table public.configuracoes add column if not exists raio          text not null default 'medio';
alter table public.configuracoes add column if not exists tema_padrao   text not null default 'sistema';

-- Regras (drop + add = pode rodar de novo)
alter table public.configuracoes drop constraint if exists configuracoes_nome_exibicao_ck;
alter table public.configuracoes add constraint configuracoes_nome_exibicao_ck
  check (nome_exibicao is null or char_length(nome_exibicao) between 1 and 60);
alter table public.configuracoes drop constraint if exists configuracoes_subtitulo_ck;
alter table public.configuracoes add constraint configuracoes_subtitulo_ck
  check (subtitulo is null or char_length(subtitulo) between 1 and 60);
alter table public.configuracoes drop constraint if exists configuracoes_logo_url_ck;
alter table public.configuracoes add constraint configuracoes_logo_url_ck
  check (logo_url is null or (char_length(logo_url) <= 500 and logo_url ~ '^https?://'));
alter table public.configuracoes drop constraint if exists configuracoes_cor_destaque_ck;
alter table public.configuracoes add constraint configuracoes_cor_destaque_ck
  check (cor_destaque ~ '^#[0-9A-Fa-f]{6}$');
alter table public.configuracoes drop constraint if exists configuracoes_fonte_ck;
alter table public.configuracoes add constraint configuracoes_fonte_ck
  check (fonte in ('moderna', 'elegante', 'amigavel', 'classica', 'tecnica', 'divertida'));
alter table public.configuracoes drop constraint if exists configuracoes_raio_ck;
alter table public.configuracoes add constraint configuracoes_raio_ck
  check (raio in ('reto', 'medio', 'redondo'));
alter table public.configuracoes drop constraint if exists configuracoes_tema_padrao_ck;
alter table public.configuracoes add constraint configuracoes_tema_padrao_ck
  check (tema_padrao in ('claro', 'escuro', 'sistema'));

-- Leitura PÚBLICA só dos campos de marca (login, redefinir senha e páginas públicas).
-- "security definer" = roda com permissão do dono da função, então o visitante
-- anônimo vê a marca SEM ter acesso à tabela configuracoes (WhatsApp, endereço...).
drop function if exists public.marca_publica();
create function public.marca_publica()
returns table (
  nome_exibido text,
  subtitulo    text,
  logo_url     text,
  cor_primaria text,
  cor_destaque text,
  fonte        text,
  raio         text,
  tema_padrao  text
)
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(nullif(trim(c.nome_exibicao), ''), c.nome_negocio),
         c.subtitulo, c.logo_url, c.cor_primaria, c.cor_destaque, c.fonte, c.raio, c.tema_padrao
  from public.configuracoes c
  where c.unica
  limit 1;
$$;
revoke all on function public.marca_publica() from public;
grant execute on function public.marca_publica() to anon, authenticated;

-- Pasta de arquivos (Storage) "marca" para a logo: pública para LEITURA
-- (a logo aparece no login e no ícone da aba); só usuários logados enviam/trocam/removem.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('marca', 'marca', true, 1048576, array['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'])
on conflict (id) do update set
  public             = excluded.public,
  file_size_limit    = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "marca_leitura_publica" on storage.objects;
create policy "marca_leitura_publica" on storage.objects
  for select to anon, authenticated using (bucket_id = 'marca');

drop policy if exists "marca_envio_autenticado" on storage.objects;
create policy "marca_envio_autenticado" on storage.objects
  for insert to authenticated with check (bucket_id = 'marca');

drop policy if exists "marca_atualizacao_autenticado" on storage.objects;
create policy "marca_atualizacao_autenticado" on storage.objects
  for update to authenticated using (bucket_id = 'marca') with check (bucket_id = 'marca');

drop policy if exists "marca_remocao_autenticado" on storage.objects;
create policy "marca_remocao_autenticado" on storage.objects
  for delete to authenticated using (bucket_id = 'marca');

-- =====================================================================
-- TABELAS DO APP · GESTÃO DE FROTA
-- Todas com RLS: só usuários logados (a equipe) leem e gravam.
-- =====================================================================

-- MOTORISTAS
create table if not exists public.motoristas (
  id uuid primary key default gen_random_uuid(),
  nome text not null check (char_length(btrim(nome)) between 1 and 100),
  telefone text check (telefone is null or telefone ~ '^[0-9]{10,13}$'),
  cnh_categoria text not null default 'B' check (cnh_categoria in ('A', 'B', 'C', 'D', 'E', 'AB', 'AD', 'AE')),
  cnh_validade date not null,
  status text not null default 'ativo' check (status in ('ativo', 'afastado', 'desligado')),
  observacoes text check (observacoes is null or char_length(observacoes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists motoristas_cnh_validade_idx on public.motoristas (cnh_validade);
create index if not exists motoristas_status_idx on public.motoristas (status);
drop trigger if exists trg_motoristas_updated_at on public.motoristas;
create trigger trg_motoristas_updated_at before update on public.motoristas
  for each row execute function public.set_updated_at();
alter table public.motoristas enable row level security;

-- VEÍCULOS
create table if not exists public.veiculos (
  id uuid primary key default gen_random_uuid(),
  placa text not null check (char_length(btrim(placa)) between 1 and 8),
  modelo text not null check (char_length(btrim(modelo)) between 1 and 60),
  marca text check (marca is null or char_length(marca) <= 40),
  tipo text not null default 'carro' check (tipo in ('carro', 'utilitario', 'van', 'caminhao', 'moto')),
  ano integer check (ano is null or (ano >= 1980 and ano <= 2100)),
  combustivel text not null default 'flex' check (combustivel in ('flex', 'gasolina', 'etanol', 'diesel', 'gnv', 'eletrico')),
  odometro integer not null default 0 check (odometro is null or (odometro >= 0)),
  motorista_id uuid references public.motoristas(id) on delete set null,
  status text not null default 'ativo' check (status in ('ativo', 'manutencao', 'reserva', 'vendido')),
  crlv_vencimento date,
  ipva_vencimento date,
  seguro_vencimento date,
  observacoes text check (observacoes is null or char_length(observacoes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists veiculos_placa_uq on public.veiculos (lower(placa));
create index if not exists veiculos_tipo_idx on public.veiculos (tipo);
create index if not exists veiculos_motorista_id_idx on public.veiculos (motorista_id);
create index if not exists veiculos_status_idx on public.veiculos (status);
create index if not exists veiculos_crlv_vencimento_idx on public.veiculos (crlv_vencimento);
create index if not exists veiculos_ipva_vencimento_idx on public.veiculos (ipva_vencimento);
create index if not exists veiculos_seguro_vencimento_idx on public.veiculos (seguro_vencimento);
drop trigger if exists trg_veiculos_updated_at on public.veiculos;
create trigger trg_veiculos_updated_at before update on public.veiculos
  for each row execute function public.set_updated_at();
alter table public.veiculos enable row level security;

-- VIAGENS E ROTAS
create table if not exists public.viagens (
  id uuid primary key default gen_random_uuid(),
  veiculo_id uuid not null references public.veiculos(id) on delete restrict,
  motorista_id uuid references public.motoristas(id) on delete set null,
  data date not null,
  origem text check (origem is null or char_length(origem) <= 80),
  destino text not null check (char_length(btrim(destino)) between 1 and 80),
  finalidade text check (finalidade is null or char_length(finalidade) <= 100),
  km_saida integer not null check (km_saida is null or (km_saida >= 0)),
  km_chegada integer check (km_chegada is null or (km_chegada >= 0)),
  km_rodados integer generated always as (case when km_chegada is not null and km_chegada >= km_saida then km_chegada - km_saida end) stored,
  status text not null default 'andamento' check (status in ('andamento', 'concluida')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists viagens_veiculo_id_idx on public.viagens (veiculo_id);
create index if not exists viagens_motorista_id_idx on public.viagens (motorista_id);
create index if not exists viagens_data_idx on public.viagens (data);
create index if not exists viagens_status_idx on public.viagens (status);
drop trigger if exists trg_viagens_updated_at on public.viagens;
create trigger trg_viagens_updated_at before update on public.viagens
  for each row execute function public.set_updated_at();
alter table public.viagens enable row level security;
-- Ao concluir a viagem com a quilometragem de chegada, atualiza o veículo.
create or replace function public.viagens_atualiza_km() returns trigger
language plpgsql set search_path = public as $$
begin
  if new.km_chegada is not null then
    update public.veiculos set odometro = greatest(odometro, new.km_chegada) where id = new.veiculo_id;
  end if;
  return new;
end;
$$;
drop trigger if exists trg_viagens_km on public.viagens;
create trigger trg_viagens_km after insert or update of km_chegada on public.viagens
  for each row execute function public.viagens_atualiza_km();

-- ABASTECIMENTOS
create table if not exists public.abastecimentos (
  id uuid primary key default gen_random_uuid(),
  veiculo_id uuid not null references public.veiculos(id) on delete restrict,
  data date not null,
  motorista_id uuid references public.motoristas(id) on delete set null,
  litros numeric(12,2) not null check (litros is null or (litros >= 0.1 and litros <= 2000)),
  valor numeric(12,2) not null check (valor is null or (valor >= 0)),
  preco_litro numeric(12,3) generated always as (case when litros > 0 then round(valor / litros, 3) end) stored,
  odometro integer not null check (odometro is null or (odometro >= 0)),
  posto text check (posto is null or char_length(posto) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists abastecimentos_veiculo_id_idx on public.abastecimentos (veiculo_id);
create index if not exists abastecimentos_data_idx on public.abastecimentos (data);
create index if not exists abastecimentos_motorista_id_idx on public.abastecimentos (motorista_id);
drop trigger if exists trg_abastecimentos_updated_at on public.abastecimentos;
create trigger trg_abastecimentos_updated_at before update on public.abastecimentos
  for each row execute function public.set_updated_at();
alter table public.abastecimentos enable row level security;
-- Ao lançar um abastecimento com quilometragem maior, atualiza o veículo.
create or replace function public.abastecimentos_atualiza_km() returns trigger
language plpgsql set search_path = public as $$
begin
  update public.veiculos set odometro = greatest(odometro, new.odometro) where id = new.veiculo_id;
  return new;
end;
$$;
drop trigger if exists trg_abastecimentos_km on public.abastecimentos;
create trigger trg_abastecimentos_km after insert or update of odometro on public.abastecimentos
  for each row execute function public.abastecimentos_atualiza_km();

-- MANUTENÇÕES
create table if not exists public.manutencoes (
  id uuid primary key default gen_random_uuid(),
  veiculo_id uuid not null references public.veiculos(id) on delete restrict,
  tipo text not null default 'preventiva' check (tipo in ('preventiva', 'corretiva', 'revisao', 'pneus', 'outros')),
  descricao text not null check (char_length(btrim(descricao)) between 1 and 120),
  status text not null default 'agendada' check (status in ('agendada', 'andamento', 'concluida')),
  data_servico date not null,
  oficina text check (oficina is null or char_length(oficina) <= 80),
  valor numeric(12,2) check (valor is null or (valor >= 0)),
  odometro integer check (odometro is null or (odometro >= 0)),
  proxima_data date,
  proximo_km integer check (proximo_km is null or (proximo_km >= 0)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists manutencoes_veiculo_id_idx on public.manutencoes (veiculo_id);
create index if not exists manutencoes_tipo_idx on public.manutencoes (tipo);
create index if not exists manutencoes_status_idx on public.manutencoes (status);
create index if not exists manutencoes_data_servico_idx on public.manutencoes (data_servico);
create index if not exists manutencoes_proxima_data_idx on public.manutencoes (proxima_data);
drop trigger if exists trg_manutencoes_updated_at on public.manutencoes;
create trigger trg_manutencoes_updated_at before update on public.manutencoes
  for each row execute function public.set_updated_at();
alter table public.manutencoes enable row level security;

-- DESPESAS DA FROTA
create table if not exists public.despesas (
  id uuid primary key default gen_random_uuid(),
  descricao text not null check (char_length(btrim(descricao)) between 1 and 120),
  categoria text not null default 'outros' check (categoria in ('ipva', 'seguro', 'pedagio', 'estacionamento', 'lavagem', 'rastreador', 'outros')),
  veiculo_id uuid references public.veiculos(id) on delete set null,
  valor numeric(12,2) not null check (valor is null or (valor >= 0)),
  vencimento date not null,
  status text not null default 'a_pagar' check (status in ('a_pagar', 'paga')),
  pago_em date,
  fornecedor text check (fornecedor is null or char_length(fornecedor) <= 80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists despesas_categoria_idx on public.despesas (categoria);
create index if not exists despesas_veiculo_id_idx on public.despesas (veiculo_id);
create index if not exists despesas_vencimento_idx on public.despesas (vencimento);
create index if not exists despesas_status_idx on public.despesas (status);
create index if not exists despesas_pago_em_idx on public.despesas (pago_em);
drop trigger if exists trg_despesas_updated_at on public.despesas;
create trigger trg_despesas_updated_at before update on public.despesas
  for each row execute function public.set_updated_at();
alter table public.despesas enable row level security;

-- MULTAS
create table if not exists public.multas (
  id uuid primary key default gen_random_uuid(),
  veiculo_id uuid not null references public.veiculos(id) on delete restrict,
  motorista_id uuid references public.motoristas(id) on delete set null,
  data date not null,
  infracao text not null check (char_length(btrim(infracao)) between 1 and 120),
  pontos integer check (pontos is null or (pontos >= 0 and pontos <= 21)),
  valor numeric(12,2) not null check (valor is null or (valor >= 0)),
  vencimento date,
  status text not null default 'a_pagar' check (status in ('a_pagar', 'paga', 'recorrida')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists multas_veiculo_id_idx on public.multas (veiculo_id);
create index if not exists multas_motorista_id_idx on public.multas (motorista_id);
create index if not exists multas_data_idx on public.multas (data);
create index if not exists multas_vencimento_idx on public.multas (vencimento);
create index if not exists multas_status_idx on public.multas (status);
drop trigger if exists trg_multas_updated_at on public.multas;
create trigger trg_multas_updated_at before update on public.multas
  for each row execute function public.set_updated_at();
alter table public.multas enable row level security;

-- Políticas (a equipe logada compartilha tudo) ------------------------
do $pol$
declare t text;
begin
  foreach t in array array['motoristas', 'veiculos', 'viagens', 'abastecimentos', 'manutencoes', 'despesas', 'multas'] loop
    execute format('drop policy if exists %I on public.%I', t || '_select_autenticado', t);
    execute format('drop policy if exists %I on public.%I', t || '_insert_autenticado', t);
    execute format('drop policy if exists %I on public.%I', t || '_update_autenticado', t);
    execute format('drop policy if exists %I on public.%I', t || '_delete_autenticado', t);
    execute format('create policy %I on public.%I for select to authenticated using (true)', t || '_select_autenticado', t);
    execute format('create policy %I on public.%I for insert to authenticated with check (true)', t || '_insert_autenticado', t);
    execute format('create policy %I on public.%I for update to authenticated using (true) with check (true)', t || '_update_autenticado', t);
    execute format('create policy %I on public.%I for delete to authenticated using (true)', t || '_delete_autenticado', t);
  end loop;
end $pol$;

-- =====================================================================
-- PERMISSÕES DA API (GRANT)
-- Projetos novos do Supabase NÃO liberam as tabelas do schema "public" para a API automaticamente.
-- Sem estes GRANTs a API bloqueia a leitura antes mesmo de checar o RLS ("não foi possível ler ...").
-- O RLS continua valendo: o GRANT só abre a porta, quem decide o que cada um vê são as políticas.
-- =====================================================================
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant execute on all functions in schema public to authenticated;
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

-- Páginas públicas (papel anon): só o que as políticas "to anon" já permitem.
do $grant_anon$
declare r record;
begin
  for r in select distinct schemaname, tablename, cmd from pg_policies
           where schemaname = 'public' and 'anon' = any(roles) loop
    execute format('grant %s on %I.%I to anon',
                   case r.cmd when 'ALL' then 'select, insert, update, delete' else r.cmd end, r.schemaname, r.tablename);
  end loop;
end
$grant_anon$;

-- Tabelas e funções criadas no futuro (ex.: ao acrescentar um cadastro) já nascem liberadas.
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant usage, select on sequences to authenticated;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant execute on functions to service_role;

-- Recarrega o cache da API para enxergar as permissões na hora.
notify pgrst, 'reload schema';
