export interface GuestbookMessage {
  /** Supabase guestbook.id. 작성 직후 INSERT 응답으로 채워진다. */
  id?: string;
  name: string;
  msg: string;
  /**
   * 방명록 화면에서 "내가 방금 쓴 글"을 같은 세션 안에서 수정/삭제해볼 수 있게 하는
   * 로컬 전용 값이다. Supabase guestbook 테이블에는 비밀번호 컬럼이 없고, 이 값은
   * 서버로 전송/저장되지 않는다.
   *
   * DB에서 불러온 기존 메시지는 password가 없으므로(undefined) 수정/삭제 시 비밀번호가
   * 항상 일치하지 않는다 — 이번 단계에서는 UPDATE/DELETE를 공개 RLS로 열지 않기로 했으므로
   * 의도된 동작이다(같은 세션에서 방금 작성한 글만 로컬로 수정/삭제 가능, 새로고침하면 초기화).
   */
  password?: string;
}

export const GUESTBOOK_PAGE_SIZE = 5;
