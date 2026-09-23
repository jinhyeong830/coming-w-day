// 날짜/장소 등 청첩장 전반에서 쓰이는 정보를 한 곳에서 관리한다.
// D-Day 계산과 캘린더는 이 값을 기준으로 자동 생성된다.
export const weddingInfo = {
  groomNameEn: "SANGWOO",
  brideNameEn: "JINHYEONG",
  /** JS Date 기준 월은 0부터 시작 (11 = 12월) */
  date: { year: 2026, month: 11, day: 13 },
  dateLabel: "2026.12.13",
  /** opening 섹션 전용 표기 (점 양옆 공백) */
  dateLabelSpaced: "2026 . 12 . 13",
  /** fullscreen nav 하단 전용 표기 */
  dateLabelNav: "2026. 12. 13",
  dowLabel: "SUN",
  timeLabel: "1:40 PM",
  venueName: "상록아트홀",
  venueAddress: "서울특별시 강남구 언주로 508 상록회관 지하 1층",
  venueHall: "그랜드볼룸 홀",
};

export const venueInfo = {
  transit: `지하철 2호선/수인부당선 · 선릉역 8번 출구 도보 10분\n
  버스 간선 · KT 강남지사 하차 - 141, 242, 361\n
  버스 지선 0000 · 상록아트홀 정류장 하차`,
  parking: `자가용 이용시 '상록아트홀' 또는 '서울시 강남구 언주로 508' 입력\n
  건물 지하 주차장 이용 가능 (90분 무료)\n`,
  shuttle: "선릉역 5번 출구 앞에서 승차 · 수시 운행",
};
