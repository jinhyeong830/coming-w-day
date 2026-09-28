// fullscreen nav와 photo share modal이 공유하는 scroll lock.
// 카운터 기반이라 두 기능이 동시에 열려도 안전하게 동작한다.
let scrollLockCount = 0;
let scrollLockY = 0;
// 잠금을 풀 때 "열기 직전 위치"가 아니라 다른 곳(예: 방금 클릭한 메뉴 section)으로
// 이동해야 하는 경우를 위한 예약값. FixedNav의 메뉴 링크 클릭처럼, 닫는 동작과
// 동시에 다음 스크롤 위치가 정해지는 케이스에서만 사용한다.
let pendingUnlockTarget: HTMLElement | null = null;

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

/** 다음 unlockBodyScroll() 호출 시, scrollLockY 대신 이 element로 스크롤 이동하도록 예약한다. */
export function scheduleUnlockScrollTo(el: HTMLElement): void {
  pendingUnlockTarget = el;
}

export function unlockBodyScroll(): void {
  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0) {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";

    const target = pendingUnlockTarget;
    pendingUnlockTarget = null;

    // body가 fixed→static으로 막 바뀐 직후라 레이아웃이 아직 반영되기 전일 수 있어
    // 한 프레임 뒤로 미뤄 실제 문서 높이가 복원된 상태에서 스크롤을 맞춘다.
    requestAnimationFrame(() => {
      if (target) {
        // block:"start" + 각 .section의 scroll-margin-top(헤더 높이)을 그대로 활용해
        // 헤더에 가리지 않는 정확한 위치로 이동한다. behavior는 "auto"로 두어 전역
        // `html { scroll-behavior: smooth }`(및 prefers-reduced-motion 오버라이드)를 따른다.
        target.scrollIntoView({ behavior: "auto", block: "start" });
        return;
      }
      // 전역 `html { scroll-behavior: smooth }` 때문에 좌표만 넘기는 scrollTo(x, y)는
      // 애니메이션으로 처리된다 — 그 사이 모달이 unmount되며 레이아웃이 바뀌면 스크롤이
      // 중간에 끊겨 엉뚱한 위치에 멈춘다(특히 iOS Safari). behavior: "instant"로 즉시 복원한다.
      window.scrollTo({ top: scrollLockY, left: 0, behavior: "instant" });
    });
  }
}
