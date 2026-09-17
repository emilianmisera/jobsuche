-- =========================================================
-- Jobsuche · Initial schema
-- =========================================================

-- ---------- Enums ----------

create type public.application_status as enum (
  'draft',
  'applied',
  'in_progress',
  'rejected',
  'offer'
);

create type public.employment_type as enum (
  'full_time',
  'part_time',
  'mini_job',
  'fixed_term'
);

create type public.document_type as enum (
  'cv',
  'attachment'
);

create type public.activity_type as enum (
  'created',
  'status_changed',
  'note',
  'email_received'
);


-- ---------- Tables ----------

-- Hochgeladene Dateien (CVs, weitere Anhänge)
create table public.documents (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type          public.document_type not null default 'cv',
  title         text not null,
  storage_path  text not null unique,
  mime_type     text not null default 'application/pdf',
  size_bytes    integer,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Vorlage für Anschreiben: Basis-PDF, Unterschrift, Font, Layout-Koordinaten aus Figma
create table public.cover_letter_templates (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name               text not null,
  base_pdf_path      text not null,
  signature_pdf_path text,
  font_path          text,
  layout             jsonb not null default '{}'::jsonb,
  is_default         boolean not null default false,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- Konkretes Anschreiben: nur Titel und Fließtext, Rest kommt aus der Vorlage
create table public.cover_letters (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  template_id uuid not null references public.cover_letter_templates (id) on delete restrict,
  title       text not null,
  body        text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Bewerbungen
create table public.applications (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null default auth.uid() references auth.users (id) on delete cascade,

  company          text not null,
  position         text not null,
  job_link         text,

  location         text,
  is_remote        boolean not null default false,
  employment_type  public.employment_type,

  status           public.application_status not null default 'draft',
  applied_at       date,

  next_action_at   date,
  next_action_note text,

  cv_document_id   uuid references public.documents (id) on delete set null,
  cover_letter_id  uuid references public.cover_letters (id) on delete set null,

  notes            text,

  gmail_thread_id  text,

  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint applications_company_not_blank check (length(btrim(company)) > 0),
  constraint applications_position_not_blank check (length(btrim(position)) > 0)
);

-- Weitere Anhänge pro Bewerbung (Zeugnisse, Portfolio, ...)
create table public.application_attachments (
  application_id uuid not null references public.applications (id) on delete cascade,
  document_id    uuid not null references public.documents (id) on delete cascade,
  created_at     timestamptz not null default now(),
  primary key (application_id, document_id)
);

-- Timeline pro Bewerbung
create table public.activities (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  application_id uuid not null references public.applications (id) on delete cascade,
  type           public.activity_type not null,
  message        text not null,
  payload        jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now()
);


-- ---------- Indexes ----------

create index documents_user_type_idx
  on public.documents (user_id, type, created_at desc);

create index cover_letters_user_idx
  on public.cover_letters (user_id, created_at desc);

create index cover_letters_template_idx
  on public.cover_letters (template_id);

create index applications_user_status_idx
  on public.applications (user_id, status, created_at desc);

create index applications_next_action_idx
  on public.applications (user_id, next_action_at)
  where next_action_at is not null;

create unique index applications_gmail_thread_idx
  on public.applications (user_id, gmail_thread_id)
  where gmail_thread_id is not null;

create index application_attachments_document_idx
  on public.application_attachments (document_id);

create index activities_application_idx
  on public.activities (application_id, created_at desc);

-- Genau eine Standard-Vorlage pro User
create unique index cover_letter_templates_default_idx
  on public.cover_letter_templates (user_id)
  where is_default;


-- ---------- Triggers ----------

-- updated_at automatisch pflegen
create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger documents_set_updated_at
  before update on public.documents
  for each row execute function public.set_updated_at();

create trigger cover_letter_templates_set_updated_at
  before update on public.cover_letter_templates
  for each row execute function public.set_updated_at();

create trigger cover_letters_set_updated_at
  before update on public.cover_letters
  for each row execute function public.set_updated_at();

create trigger applications_set_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();


-- "Beworben am" an den Status koppeln.
-- Verlässt eine Bewerbung 'draft', wird das Datum auf heute gesetzt (Wiener Zeit,
-- sonst fällt eine Bewerbung um 00:30 Uhr auf den Vortag, weil Postgres in UTC läuft).
-- Wandert sie zurück auf 'draft', wird es geleert. Manuell gesetzte Werte bleiben erhalten.
create or replace function public.sync_applied_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    if new.status <> 'draft' and new.applied_at is null then
      new.applied_at := (now() at time zone 'Europe/Vienna')::date;
    end if;
    return new;
  end if;

  if new.status is distinct from old.status then
    if new.status = 'draft' then
      new.applied_at := null;
    elsif new.applied_at is null then
      new.applied_at := (now() at time zone 'Europe/Vienna')::date;
    end if;
  end if;

  return new;
end;
$$;

create trigger applications_sync_applied_at
  before insert or update on public.applications
  for each row execute function public.sync_applied_at();


-- Anlegen und jeden Statuswechsel in die Timeline schreiben
create or replace function public.log_application_activity()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.activities (user_id, application_id, type, message, payload)
    values (
      new.user_id,
      new.id,
      'created',
      'Bewerbung angelegt',
      jsonb_build_object('status', new.status)
    );
    return new;
  end if;

  if new.status is distinct from old.status then
    insert into public.activities (user_id, application_id, type, message, payload)
    values (
      new.user_id,
      new.id,
      'status_changed',
      'Status geändert',
      jsonb_build_object('from', old.status, 'to', new.status)
    );
  end if;

  return new;
end;
$$;

create trigger applications_log_activity
  after insert or update on public.applications
  for each row execute function public.log_application_activity();


-- ---------- Row Level Security ----------

alter table public.documents               enable row level security;
alter table public.cover_letter_templates  enable row level security;
alter table public.cover_letters           enable row level security;
alter table public.applications            enable row level security;
alter table public.application_attachments enable row level security;
alter table public.activities              enable row level security;


create policy "documents: owner all" on public.documents
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "cover_letter_templates: owner all" on public.cover_letter_templates
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "cover_letters: owner all" on public.cover_letters
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "applications: owner all" on public.applications
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Join-Tabelle hat keine eigene user_id, der Zugriff hängt an der Bewerbung
create policy "application_attachments: owner all" on public.application_attachments
  for all to authenticated
  using (
    exists (
      select 1 from public.applications a
      where a.id = application_id
        and a.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.applications a
      where a.id = application_id
        and a.user_id = (select auth.uid())
    )
  );

-- Timeline wird von Triggern geschrieben, aus der App nur gelesen
create policy "activities: owner read" on public.activities
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "activities: owner insert" on public.activities
  for insert to authenticated
  with check ((select auth.uid()) = user_id);


-- ---------- Grants ----------
-- Seit dem 30. Mai 2026 exponieren neue Supabase-Projekte Tabellen im public-Schema
-- nicht mehr automatisch über die Data API. Ohne explizites GRANT sieht supabase-js
-- die Tabellen nicht. anon bekommt bewusst keinen Zugriff.

grant usage on schema public to authenticated, service_role;

grant select, insert, update, delete on
  public.documents,
  public.cover_letter_templates,
  public.cover_letters,
  public.applications,
  public.application_attachments,
  public.activities
to authenticated, service_role;


-- ---------- Storage ----------
-- Privater Bucket, Pfade nach Schema: {user_id}/cv/..., {user_id}/attachments/...,
-- {user_id}/templates/{template_id}/...

insert into storage.buckets (id, name, public, file_size_limit)
values ('documents', 'documents', false, 10485760)
on conflict (id) do nothing;

create policy "documents: owner read" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "documents: owner upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "documents: owner update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "documents: owner delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
