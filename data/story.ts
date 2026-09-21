export interface StoryItem {
  year: string;
  title: string;
  alt: string;
  /**
   * 사진 경로 규칙: public/images/story/{year}.jpg
   * 아직 파일이 없어도 404 시 자동으로 placeholder가 표시되므로(FallbackImage),
   * 규칙에 맞는 파일만 넣으면 코드 수정 없이 바로 반영된다.
   */
  image: string;
  lane: "bride" | "groom" | "merge" | "merged";
  /**
   * scroll-driven 타임라인의 가로 좌표 시스템(px, TRACK_W=4300 기준)에서 사용된다.
   * SVG path(신부/신랑 라인이 2020년에 합류하는 연출)와 직접 연결되어 있으므로
   * 이벤트 개수/순서를 바꾸지 않는 한 임의로 수정하지 않는다.
   */
  x: number;
  /** 세로 좌표(px, TRACK_H=400 기준). 신부=80, 신랑=320, 합류 이후=200 고정. */
  y: number;
  big?: boolean;
}

// OUR STORY: 각 이벤트는 이미지 1장 + 연도 + 타이틀로 구성된다.
// image 경로는 public/images/story/{year}.jpg 규칙을 미리 반영해두었다 (현재는 파일이 없어 placeholder가 보인다).
export const storyItems: StoryItem[] = [
  { year: "1995", title: "진형의 어린 시절", alt: "진형의 어린 시절", image: "/images/story/1995.jpg", lane: "bride", x: 380, y: 80 },
  { year: "1996", title: "상우의 어린 시절", alt: "상우의 어린 시절", image: "/images/story/1996.jpg", lane: "groom", x: 760, y: 320 },
  { year: "2020", title: "우리가 처음 만난 날", alt: "우리가 처음 만난 날", image: "/images/story/2020.jpg", lane: "merge", x: 1560, y: 200, big: true },
  { year: "2021", title: "함께한 첫 계절", alt: "함께한 첫 계절", image: "/images/story/2021.jpg", lane: "merged", x: 1960, y: 200 },
  { year: "2022", title: "함께 걸어온 시간", alt: "함께 걸어온 시간", image: "/images/story/2022.jpg", lane: "merged", x: 2360, y: 200 },
  { year: "2023", title: "변함없는 마음", alt: "변함없는 마음", image: "/images/story/2023.jpg", lane: "merged", x: 2760, y: 200 },
  { year: "2024", title: "더 단단해진 우리", alt: "더 단단해진 우리", image: "/images/story/2024.jpg", lane: "merged", x: 3160, y: 200 },
  { year: "2025", title: "청혼, 그리고 약속", alt: "청혼, 그리고 약속", image: "/images/story/2025.jpg", lane: "merged", x: 3560, y: 200 },
  { year: "2026", title: "우리의 결혼식", alt: "우리의 결혼식", image: "/images/story/2026.jpg", lane: "merged", x: 3980, y: 200, big: true },
];

// scroll-driven 타임라인 트랙의 전체 좌표계 크기(px). storyItems의 x/y와 짝을 이룬다.
export const STORY_TRACK_W = 4300;
export const STORY_TRACK_H = 400;
