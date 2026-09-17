-- Gemeinsame Bestenliste für Brand Color Battle.
-- Einmal vollständig im Supabase SQL Editor ausführen.

create extension if not exists pgcrypto;

create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  nickname text not null check (
    char_length(btrim(nickname)) between 1 and 18
    and nickname = btrim(nickname)
  ),
  score integer not null check (score between 0 and 1200),
  created_at timestamptz not null default now(),
  submission_id uuid not null unique
);

alter table public.scores enable row level security;

drop policy if exists "Bestenliste anonym lesen" on public.scores;
create policy "Bestenliste anonym lesen"
on public.scores
for select
to anon
using (true);

drop policy if exists "Gültige Ergebnisse anonym eintragen" on public.scores;
create policy "Gültige Ergebnisse anonym eintragen"
on public.scores
for insert
to anon
with check (
  char_length(btrim(nickname)) between 1 and 18
  and nickname = btrim(nickname)
  and score between 0 and 1200
  and submission_id is not null
);

revoke all on table public.scores from anon;
grant select on table public.scores to anon;
grant insert (nickname, score, submission_id) on table public.scores to anon;

-- Es gibt bewusst keine UPDATE- oder DELETE-Policy und keine entsprechenden
-- Rechte für anon. id und created_at werden ausschließlich vom Server gesetzt.
-- submission_id wird einmal pro Ergebnis erzeugt; der eindeutige Constraint
-- verhindert Doppelübertragungen bei wiederholten Offline-Synchronisationen.

create index if not exists scores_ranking_idx
on public.scores (score desc, created_at asc);
