// 새 날짜 라이브러리를 추가하지 않고, 브라우저/Node에 내장된 Intl.DateTimeFormat의
// timeZone 옵션으로 지정한 시간대 기준 날짜를 계산한다 — 사용자 기기의 로컬 timezone
// 설정에 좌우되지 않는다.
export function formatDateKST(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "";

  // en-CA 로케일은 formatToParts에서 항상 year/month/day 순서를 보장해 파싱이 안전하다.
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((p) => p.type === "year")?.value ?? "";
  const month = parts.find((p) => p.type === "month")?.value ?? "";
  const day = parts.find((p) => p.type === "day")?.value ?? "";
  if (!year || !month || !day) return "";

  return `${year}.${month}.${day}`;
}
