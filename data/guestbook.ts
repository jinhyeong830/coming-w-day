export interface GuestbookMessage {
  /** Supabase guestbook.id. 작성 직후 INSERT 응답으로 채워진다. */
  id?: string;
  name: string;
  msg: string;
  /** Supabase guestbook.created_at (ISO 문자열). UI에는 Asia/Seoul 기준 YYYY.MM.DD로 표시된다. */
  createdAt?: string;
  /**
   * 방명록 화면에서 "내가 방금 쓴 글"을 같은 세션 안에서 수정해볼 수 있게 하는
   * 로컬 전용 값이다. 서버로 다시 전송되거나 DB에 평문으로 저장되지 않는다
   * (DB의 password_hash는 작성 시 서버(app/api/guestbook)에서만 생성/저장되고,
   * 클라이언트에는 절대 내려오지 않는다).
   *
   * 삭제(Delete)는 이 값과 무관하게 매번 서버에서 password_hash로 실제 검증한다
   * (app/api/guestbook DELETE). 반면 수정(Edit)은 아직 실제 DB에 반영되는 기능이
   * 아니라서(요구사항에 없어 추가하지 않음) 같은 세션에서 작성한 글에 한해
   * 이 로컬 password로만 게이트한다 — 새로고침하면 초기화된다.
   */
  password?: string;
}

export const GUESTBOOK_PAGE_SIZE = 5;
