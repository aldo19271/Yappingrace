-- Migrasi: menambah Gmail + lupa password. Jalankan SEKALI di Neon > SQL Editor.
-- Aman untuk data lama: akun yang sudah ada tidak dihapus/diubah, kolom email-nya hanya kosong (NULL).
-- Aman dijalankan ulang.

alter table users add column if not exists email text;

create unique index if not exists users_email_idx on users (email) where email is not null;

create table if not exists email_codes (
  user_id     uuid primary key references users(id) on delete cascade,
  code_hash   text not null,
  expires_at  timestamptz not null,
  attempts    smallint not null default 0,
  sent_at     timestamptz not null default now()
);
