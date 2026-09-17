-- Nur für lokale Entwicklung. Läuft nicht gegen das gehostete Projekt.

-- ---------- Dev-User ----------

insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  confirmation_token,
  recovery_token,
  email_change,
  email_change_token_new,
  email_change_token_current,
  phone_change,
  phone_change_token,
  reauthentication_token
)
values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'dev@local.test',
  extensions.crypt('devpassword', extensions.gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{}'::jsonb,
  '', '', '', '', '', '', '', ''
)
on conflict (id) do nothing;

insert into auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
values (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '{"sub":"00000000-0000-0000-0000-000000000001","email":"dev@local.test"}'::jsonb,
  'email',
  now(),
  now(),
  now()
)
on conflict (id) do nothing;


-- ---------- Testdaten ----------
-- Die Storage-Pfade zeigen auf keine echten Dateien. Für Tabelle und Board reicht das,
-- für Preview und Download musst du später echte PDFs hochladen.

insert into public.documents (id, user_id, type, title, storage_path)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'cv', 'CV_english-1', '00000000-0000-0000-0000-000000000001/cv/cv-english-1.pdf'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'cv', 'CV_english-2', '00000000-0000-0000-0000-000000000001/cv/cv-english-2.pdf'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'attachment', 'Zeugnis_Bachelor', '00000000-0000-0000-0000-000000000001/attachments/zeugnis-bachelor.pdf');

insert into public.cover_letter_templates (id, user_id, name, base_pdf_path, is_default)
values (
  '20000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Standard',
  '00000000-0000-0000-0000-000000000001/templates/standard/base.pdf',
  true
);

insert into public.cover_letters (id, user_id, template_id, title, body)
values
  ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'bending_spoons-Motivation', 'Sehr geehrte Damen und Herren, ...'),
  ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'eversports-Motivation', 'Sehr geehrte Damen und Herren, ...');

insert into public.applications (
  id, user_id, company, position, job_link, location, is_remote,
  employment_type, status, applied_at, next_action_at, next_action_note,
  cv_document_id, cover_letter_id, notes
)
values
  (
    '40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001',
    'eversportsmanager', 'SAP Softwareentwickler', 'https://www.loremipsum.de', 'Wien', false,
    'full_time', 'draft', null, current_date, 'Anschreiben fertig schreiben',
    '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', null
  ),
  (
    '40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001',
    'eversportsmanager', 'SAP Softwareentwickler', 'https://www.loremipsum.de', 'Wien', false,
    'full_time', 'applied', current_date - 9, current_date, 'Follow-up schicken',
    '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', null
  ),
  (
    '40000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001',
    'allaboutapps', 'Flutter Appentwicklung', 'https://www.loremipsum.de', null, true,
    'part_time', 'rejected', current_date - 15, null, null,
    '10000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', null
  ),
  (
    '40000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001',
    'bending spoons', 'Frontend Entwickler', 'https://www.loremipsum.de', null, true,
    'full_time', 'rejected', current_date - 15, null, null,
    '10000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001',
    'Absage kam per Mail nach zwei Wochen.'
  ),
  (
    '40000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001',
    'Kaminsky', 'Bartender', null, 'Wien', false,
    'mini_job', 'in_progress', current_date - 8, current_date + 2, 'Probeschicht vorbereiten',
    null, null, null
  ),
  (
    '40000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001',
    'NexTime', 'Aushilfe Katering', null, 'Regensburg', false,
    'fixed_term', 'offer', current_date - 25, null, null,
    null, null, null
  );

insert into public.application_attachments (application_id, document_id)
values
  ('40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003'),
  ('40000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000003');