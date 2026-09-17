-- Vorbereitung für eine spätere gemeinsame Bestenliste.
-- Im Supabase SQL Editor ausführen, sobald das Backend angebunden wird.

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

create policy "Bestenliste anonym lesen"
on public.scores
for select
to anon
using (true);

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

-- Es gibt bewusst keine UPDATE- oder DELETE-Policy für die Rolle anon.
-- Die spätere Client-Implementierung sollte submission_id einmal pro Ergebnis
-- erzeugen, Offline-Ergebnisse lokal vormerken und Inserts bei Netzfehlern
-- wiederholen. Der eindeutige Index verhindert dabei Doppelübertragungen.

create index if not exists scores_ranking_idx
on public.scores (score desc, created_at asc);
