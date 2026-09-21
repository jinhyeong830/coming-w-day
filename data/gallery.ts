export interface GalleryImage {
  src: string;
  alt: string;
}

// GALLERY: 전체 이미지는 최대 30장까지 이 배열 하나로 관리한다.
// 미리보기 그리드는 앞쪽 GALLERY_PREVIEW_COUNT장만 노출하고,
// fullscreen viewer는 배열 전체(최대 30장)를 탐색할 수 있다.
//
// 사진 경로 규칙: public/images/gallery/01.jpg ~ 30.jpg
// 아직 파일이 없는 슬롯도 404 시 자동으로 placeholder가 표시되므로(FallbackImage),
// 규칙에 맞는 파일만 넣으면 코드 수정 없이 바로 반영된다.
//
// 아래 표는 규칙(NN.jpg)을 따르지 않는 원본 파일명을 가진 슬롯만 예외로 지정한 것이다.
// (파일명 순서대로 비어있던 03, 04, 05, 09~15번 슬롯에 채워 넣었다. 파일 자체는 리네임하지 않았다.)
const RAW_FILENAME_OVERRIDES: Record<number, string> = {
  3: "YJ_00016_1.jpg",
  4: "YJ_00081_1.jpg",
  5: "YJ_00603_1.jpg",
  9: "YJ_00897_1.jpg",
  10: "YJ_01144_1.jpg",
  11: "YJ_01538_1.jpg",
  12: "YJ_01644_1.jpg",
  13: "YJ_01781_1.jpg",
  14: "YJ_01938_1.jpg",
  15: "YJ_02026_1.jpg",
};

export const galleryImages: GalleryImage[] = Array.from({ length: 30 }, (_, i) => {
  const slotNumber = i + 1; // 1-indexed, public/images/gallery의 파일명과 대응
  // const filename = RAW_FILENAME_OVERRIDES[slotNumber] ?? `${String(slotNumber).padStart(2, "0")}.jpg`;
  const filename =`${String(slotNumber).padStart(2, "0")}.jpg`;
  return {
    src: `/images/gallery/${filename}`,
    alt: `웨딩 사진 ${String(slotNumber).padStart(2, "0")}`,
  };
});

export type GalleryItemType = "g-wide" | "g-portrait" | "g-small";

export interface GalleryLayoutSlot {
  type: GalleryItemType;
  /** 모바일(6칸 그리드) 노출 순서. 없으면 모바일 프리뷰에서 숨긴다(뷰어에서는 계속 열람 가능). */
  mobileOrder?: number;
}

// 데스크톱(768px+, 12칸 그리드)과 모바일(6칸 그리드)은 한 행을 딱 채우는 조합이 다르기 때문에
// 두 breakpoint에서 보여주는 "장수"와 "배치 순서"를 서로 다르게 둔다.
//   - 데스크톱: 이 배열 순서 그대로 9장 전부 노출 (wide=8칸, quarter=4칸 → 매 행이 정확히 12칸)
//   - 모바일: mobileOrder가 있는 8장만 그 순서대로 노출 (wide=6칸, quarter=3칸 → 매 행이 정확히 6칸)
// 장수/순서를 바꿀 경우 이 정렬이 깨지면서 마지막 행에 빈 칸이 생길 수 있으니 유의한다.
export const GALLERY_LAYOUT: GalleryLayoutSlot[] = [
  { type: "g-wide", mobileOrder: 1 },
  { type: "g-portrait", mobileOrder: 2 },
  { type: "g-small", mobileOrder: 3 },
  { type: "g-portrait", mobileOrder: 5 },
  { type: "g-small", mobileOrder: 6 },
  { type: "g-wide", mobileOrder: 4 },
  { type: "g-portrait", mobileOrder: 8 },
  { type: "g-wide", mobileOrder: 7 },
  { type: "g-small" }, // 모바일 프리뷰에서는 숨김
];

// 데스크톱 기준 전체 장수(9) — 모바일은 이 중 8장만 보인다.
export const GALLERY_PREVIEW_COUNT = GALLERY_LAYOUT.length;
