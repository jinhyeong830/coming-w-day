// fullscreen nav와 photo share modal이 공유하는 scroll lock.
// 카운터 기반이라 두 기능이 동시에 열려도 안전하게 동작한다.
let scrollLockCount = 0;
let scrollLockY = 0;

export function lockBodyScroll(): void {
  if (scrollLockCount === 0) {
    scrollLockY = window.scrollY;
    document.body.style.position = "fixed";
    document.body.style.top = `${-scrollLockY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
  }
  scrollLockCount++;
}

export function unlockBodyScroll(): void {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    // 전역 `html { scroll-behavior: smooth }` 때문에 좌표만 넘기는 scrollTo(x, y)는
    // 애니메이션으로 처리된다 — 그 사이 모달이 unmount되며 레이아웃이 바뀌면 스크롤이
    // 중간에 끊겨 엉뚱한 위치에 멈춘다(특히 iOS Safari). behavior: "instant"로 즉시 복원한다.
    // body가 fixed→static으로 막 바뀐 직후라 레이아웃이 아직 반영되기 전일 수 있어
    // 한 프레임 뒤로 미뤄 실제 문서 높이가 복원된 상태에서 스크롤을 맞춘다.
    requestAnimationFrame(() => {
      window.scrollTo({ top: scrollLockY, left: 0, behavior: "instant" });
    });
  }
}
