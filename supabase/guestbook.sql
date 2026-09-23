-- 방명록(guestbook) 테이블 + RLS 정책
-- 참고용 문서다 — 실제 DB는 이미 아래와 같은 구조로 설정되어 있으므로
-- 이 파일을 Supabase SQL Editor에서 다시 실행할 필요는 없다.
--
-- 정책 요약:
--   - 누구나(익명 포함) 목록을 조회(SELECT)할 수 있다. (password_hash 포함 전체 컬럼이
--     RLS 상으로는 조회 가능하므로, 앱은 항상 select("id, name, message, created_at")처럼
--     컬럼을 명시해 password_hash를 절대 클라이언트로 내려보내지 않는다.)
--   - 누구나(익명 포함) 새 글을 작성(INSERT)할 수 있다.
--   - UPDATE/DELETE 정책은 만들지 않는다 → RLS가 기본적으로 차단한다.
--     삭제는 app/api/guestbook(DELETE)에서 service role key로 password_hash를
--     서버에서 직접 검증한 뒤에만 수행한다(RLS를 우회하는 신뢰된 서버 경로).

create table if not exists public.guestbook (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) > 0 and char_length(name) <= 50),
  message text not null check (char_length(trim(message)) > 0 and char_length(message) <= 1000),
  password_hash text not null,
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
-- 삭제는 app/api/guestbook의 서버 라우트(service role key)에서만 수행한다.
