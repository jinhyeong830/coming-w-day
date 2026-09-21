export interface AccountEntry {
  label: string;
  bank: string;
  number: string;
}

export interface AccountGroup {
  role: string;
  name: string;
  /** "확인하기" 클릭 시 함께 노출되는 계좌들 (본인 계좌 + 부모님 한 분 계좌) */
  accounts: AccountEntry[];
}

// ACCOUNT: "확인하기" 버튼 1개가 그 사람 쪽(신랑측/신부측)의 계좌 전체를 한꺼번에 펼쳐서 보여준다.
export const accountGroups: { groom: AccountGroup; bride: AccountGroup } = {
  groom: {
    role: "신랑",
    name: "박상우",
    accounts: [
      { label: "신랑 박상우", bank: "하나은행", number: "123-456-789012" },
      { label: "아버지 박○○", bank: "국민은행", number: "111-222-333444" },
    ],
  },
  bride: {
    role: "신부",
    name: "유진형",
    accounts: [
      { label: "신부 유진형", bank: "국민은행", number: "123-456-789012" },
      { label: "어머니 김○○", bank: "신한은행", number: "555-666-777888" },
    ],
  },
};
