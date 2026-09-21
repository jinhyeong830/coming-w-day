"use client";

import { useEffect, useState } from "react";
import { showToast } from "@/lib/toast";

export default function KakaoFab() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > window.innerHeight * 0.6);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <button
      className={`kakao-fab${visible ? " is-visible" : ""}`}
      type="button"
      aria-label="카카오톡 공유"
      onClick={() => showToast("카카오톡 공유는 실제 서비스 연동 시 제공됩니다.")}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 12a8 5.6 0 1 1 6.6 9.4L4 22l1.4-3.8A5.6 5.6 0 0 1 4 12Z" />
      </svg>
    </button>
  );
}
