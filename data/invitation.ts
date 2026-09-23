export interface FamilyProfile {
  /**
   * 사진 경로 규칙: public/images/parents/groom.jpg, public/images/parents/bride.jpg
   * 아직 파일이 없어도 404 시 자동으로 placeholder가 표시되므로(FallbackImage),
   * 규칙에 맞는 파일만 넣으면 코드 수정 없이 바로 반영된다.
   */
  parentPhoto: string;
  lineage: string;
  story: string;
  role: string;
  name: string;
}

// INVITATION: 신랑/신부 각각을 "사진 → 가계 → 성장 이야기 → 이름" 순으로 소개한다.
// 실제 콘텐츠로 교체할 때는 이 객체의 값만 채우면 되고 컴포넌트(JSX)는 건드릴 필요가 없다.
export const invitation: { groom: FamilyProfile; bride: FamilyProfile } = {
  groom: {
    parentPhoto: "/images/parents/groom.jpg",
    lineage: "아버지 박무식 · 어머니 박희경의 아들",
    story:
      "어릴 적부터 차분하고 다정한 성격으로 주변을 살필 줄 아는 사람이었습니다. 그 마음은 지금도 변하지 않았습니다.",
    role: "신랑",
    name: "박상우",
  },
  bride: {
    parentPhoto: "/images/parents/bride.jpg",
    lineage: "아버지 유항선 · 어머니 정경애의 딸",
    story:
      "밝고 씩씩하게 자라 어떤 순간에도 자신만의 속도로 최선을 다하는 사람으로 성장했습니다.",
    role: "신부",
    name: "유진형",
  },
};

export const invitationQuote =
  "서로 다른 계절을 지나온 두 사람이\n이제 같은 곳을 바라보며\n새로운 계절을 시작하려 합니다.";
