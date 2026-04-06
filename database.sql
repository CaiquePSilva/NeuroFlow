-- Ative o gerador de UUIDs se não estiver ativo
create extension if not exists "uuid-ossp";

-- Criação da tabela de Aprendentes
create table public.aprendentes (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  data_ou_idade text not null,
  responsavel_1 text not null,
  responsavel_2 text,
  contato text,
  email text,
  medico text,
  contato_medico text,
  escola text,
  contato_escola text,
  contato_professor text,
  status text not null default 'ativo',
  metodo_pagamento text default 'Sessão',
  forma_pagamento text,
  valor_referencia text default 'R$ 0,00',
  duracao_minutos text default '45',
  tipo_sessao text default 'Sessão',
  data_criacao timestamp with time zone default timezone('utc'::text, now()) not null,
  magic_pin text unique not null -- PINO Único de 6 caracteres para os pais
);

-- Criação da tabela de Sessões
create table public.sessoes (
  id uuid primary key default uuid_generate_v4(),
  aprendente_id uuid references public.aprendentes(id) on delete cascade not null,
  nome_aprendente text not null,
  data_realizacao date not null,
  hora_inicio text not null,
  hora_fim text not null,
  valor text not null,
  status text not null default 'agendado',
  tipo_sessao text not null default 'Sessão',
  data_criacao timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Configurações de Segurança (Row Level Security - Para os Pais poderem ler via PIN)
alter table public.aprendentes enable row level security;
alter table public.sessoes enable row level security;

-- Permitir Leitura Anônima dos Aprendentes caso encontre pelo PIN e para as Sessões por Aprendente ID
-- ATENÇÃO: Em produção pesada os Policies garantem isolamento, por enquanto vamos liberar R/W básico para anonimo devido a chave Anon:
create policy "Anon access to aprendentes" on public.aprendentes for all using (true);
create policy "Anon access to sessoes" on public.sessoes for all using (true);

-- Notifique o Realtime (WebSocket do Supabase) que a Tabela de Sessoes deve disparar avisos
alter publication supabase_realtime add table public.sessoes;
alter publication supabase_realtime add table public.aprendentes;
