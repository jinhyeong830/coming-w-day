// 서버 전용 — app/api/**/route.ts에서만 import한다. 절대 "use client" 컴포넌트에서
// import하지 않는다(SUPABASE_SERVICE_ROLE_KEY는 NEXT_PUBLIC_ 접두사가 없으므로
// Next.js가 클라이언트 번들에 포함하지 않지만, 그래도 서버 전용 파일로 명확히 분리해둔다).
//
// service role key는 RLS를 우회한다 — password_hash 조회/검증, 검증 성공 후 삭제처럼
// anon key/RLS만으로는 안전하게 할 수 없는 작업에만 이 client를 사용한다.
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseServerConfigured = Boolean(supabaseUrl && serviceRoleKey);

export const supabaseServer = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  serviceRoleKey || "placeholder-service-role-key",
  { auth: { persistSession: false } }
);
