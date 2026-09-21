export interface GuestbookMessage {
  name: string;
  msg: string;
  /**
   * 데모용 평문 비밀번호. 이 mockup은 backend가 없어 클라이언트 배열에 그대로 들고 있다가 비교한다.
   * 실제 서비스로 연결할 때는 비밀번호를 서버로 전송해 해시(bcrypt 등) 비교하고,
   * 목록 조회 응답에는 비밀번호 필드를 절대 포함하지 않아야 한다.
   * (向후 Supabase 연결 시 components/sections/Guestbook.tsx의 로컬 상태 로직을
   *  API 호출로 교체한다.)
   */
  password: string;
}

// 데모용 기본 비밀번호. 새로 작성되는 메시지는 작성 시 입력한 4자리로 대체된다.
export const guestbookSeed: GuestbookMessage[] = [
  { name: "민지", msg: "두 분의 새로운 시작을 진심으로 축하해요!", password: "0000" },
  { name: "철수", msg: "결혼 정말 축하해! 오래오래 행복해 :)", password: "0000" },
  { name: "수진", msg: "두 사람이 함께 걸어갈 모든 계절을 응원할게요.", password: "0000" },
  { name: "지훈", msg: "항상 지금처럼 서로를 아껴주길 바라요 :)", password: "0000" },
];

export const GUESTBOOK_PAGE_SIZE = 5;
