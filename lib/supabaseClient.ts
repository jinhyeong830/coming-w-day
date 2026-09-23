import { createClient } from "@supabase/supabase-js";

// 방명록은 로그인/세션이 필요 없는 공개 작성·조회 기능이라 브라우저용 client 하나로 충분하다.
// (publishable/anon key만 사용 — RLS가 실제 접근 제어를 담당한다. service role key는 여기서도,
//  다른 어떤 클라이언트 코드에서도 절대 사용하지 않는다.)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/** 실제 Supabase 프로젝트 환경변수가 설정되어 있는지. 호출부에서 네트워크 요청 전에 확인한다. */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

// 환경변수가 없어도(로컬 최초 세팅 전, 혹은 build의 정적 생성 단계) createClient 자체가
// throw하지 않도록 형식만 유효한 더미 값으로 fallback한다. 실제 호출은 항상
// isSupabaseConfigured를 먼저 확인하므로, 이 더미 값으로 실제 네트워크 요청까지 가지 않는다.
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseKey || "placeholder-key"
);
