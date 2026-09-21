// 이미지가 비어 있을 때 자동으로 생성되는 on-brand placeholder (외부 네트워크 요청 없음).
// 실제 사진으로 교체하면(각 data/*.ts의 src/image/parentPhoto 필드) 이 함수는 더 이상 호출되지 않는다.
const PALETTES: [string, string][] = [
  ["#403c37", "#1c1a17"],
  ["#cdc6b8", "#a39a89"],
  ["#8a7f6f", "#332f29"],
  ["#e3ded3", "#b9ae9b"],
  ["#5c554a", "#231f1a"],
  ["#b7ac97", "#726b59"],
];

export function placeholderImage(seed: number, label: string): string {
  const c = PALETTES[Math.abs(seed) % PALETTES.length];
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="640">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
    `<stop offset="0" stop-color="${c[0]}"/><stop offset="1" stop-color="${c[1]}"/>` +
    "</linearGradient></defs>" +
    '<rect width="480" height="640" fill="url(#g)"/>' +
    `<text x="50%" y="53%" font-family="Georgia, serif" font-size="42" fill="rgba(246,244,239,.5)" text-anchor="middle">${label}</text>` +
    "</svg>";
  return "data:image/svg+xml," + encodeURIComponent(svg);
}
