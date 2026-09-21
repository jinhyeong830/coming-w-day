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
  timeLabel: "12:00 PM",
  venueName: "상록아트홀",
  venueAddress: "서울특별시 강남구 예시로 123, 4층 (placeholder)",
  venueHall: "그랜드홀",
};

export const venueInfo = {
  transit: "지하철 2호선 · 신○역 3번 출구 도보 5분\n버스 간선 000, 지선 0000 · 상록아트홀 정류장 하차",
  parking: "건물 지하 1~3층 주차장 이용 가능 (2시간 무료)\n발렛 파킹 서비스 운영",
  shuttle: "○○역 1번 출구 앞, 11:00 ~ 12:00 · 10분 간격 운행",
};
