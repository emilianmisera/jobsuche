-- =========================================================
-- Gmail-Sync
-- =========================================================

create type public.suggestion_state as enum (
  'none',
  'pending',
  'accepted',
  'dismissed',
  'auto_applied'
);

-- Verbundenes Postfach. Ein Account pro User.
create table public.email_accounts (
  user_id         uuid primary key references auth.users (id) on delete cascade,
  email           text not null,
  refresh_token   text not null,
  last_synced_at  timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Verarbeitete Mails. Verhindert Doppelverarbeitung und trägt die Vorschläge.
create table public.email_messages (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  application_id    uuid references public.applications (id) on delete cascade,

  gmail_message_id  text not null,
  gmail_thread_id   text,

  from_address      text not null,
  subject           text not null default '',
  snippet           text not null default '',
  received_at       timestamptz not null,

  suggested_status  public.application_status,
  confidence        numeric(3, 2),
  state             public.suggestion_state not null default 'none',

  created_at        timestamptz not null default now(),

  constraint email_messages_confidence_range
    check (confidence is null or (confidence >= 0 and confidence <= 1))
);

create unique index email_messages_gmail_id_idx
  on public.email_messages (user_id, gmail_message_id);

create index email_messages_application_idx
  on public.email_messages (application_id, received_at desc);

-- Offene Vorschläge, die in der UI auftauchen
create index email_messages_pending_idx
  on public.email_messages (user_id, received_at desc)
  where state = 'pending';

create trigger email_accounts_set_updated_at
  before update on public.email_accounts
  for each row execute function public.set_updated_at();

alter table public.email_accounts enable row level security;
alter table public.email_messages enable row level security;

create policy "email_accounts: owner all" on public.email_accounts
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "email_messages: owner all" on public.email_messages
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update, delete on
  public.email_accounts,
  public.email_messages
to authenticated, service_role;