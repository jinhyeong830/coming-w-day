-- 방명록(guestbook) 테이블 + RLS 정책
-- Supabase 대시보드 → SQL Editor에서 그대로 실행한다.
--
-- 정책 요약:
--   - 누구나(익명 포함) 목록을 조회(SELECT)할 수 있다.
--   - 누구나(익명 포함) 새 글을 작성(INSERT)할 수 있다.
--   - UPDATE/DELETE 정책은 만들지 않는다 → RLS가 기본적으로 차단한다(공개하지 않음).
--   - 비밀번호/전화번호/이메일 등 개인정보 컬럼은 두지 않는다.

create table if not exists public.guestbook (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) > 0 and char_length(name) <= 50),
  message text not null check (char_length(trim(message)) > 0 and char_length(message) <= 500),
  created_at timestamptz not null default now()
);

alter table public.guestbook enable row level security;

create policy "guestbook_select_anyone"
  on public.guestbook
  for select
  to anon, authenticated
  using (true);

create policy "guestbook_insert_anyone"
  on public.guestbook
  for insert
  to anon, authenticated
  with check (true);

-- UPDATE / DELETE 정책은 의도적으로 만들지 않는다.
-- RLS가 켜진 상태에서 정책이 없는 작업은 기본적으로 거부된다.
