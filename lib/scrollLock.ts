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
    window.scrollTo(0, scrollLockY);
  }
}
