-- Wann eine automatische Änderung zuletzt angesehen wurde
alter table public.email_messages add column seen_at timestamptz;

-- Nur die Zeilen, die einen Hinweis auslösen
create index email_messages_updates_idx
  on public.email_messages (application_id)
  where state = 'pending' or (state = 'auto_applied' and seen_at is null);