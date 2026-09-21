// 전역 토스트. 여러 section(Venue/Account/Guestbook/PhotoShare/KakaoFab)이
// 하나의 <Toast /> 컴포넌트(components/ui/Toast.tsx, page.tsx에 한 번만 마운트)를 공유한다.
export const TOAST_EVENT = "app:toast";

export function showToast(message: string): void {
  window.dispatchEvent(new CustomEvent<string>(TOAST_EVENT, { detail: message }));
}
