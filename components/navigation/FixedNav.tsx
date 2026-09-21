"use client";

import { useEffect, useRef, useState } from "react";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/scrollLock";
import { weddingInfo } from "@/data/wedding";

const NAV_LINKS = [
  { index: "01", label: "Our Story", section: "story" },
  { index: "02", label: "Invitation", section: "invitation" },
  { index: "03", label: "Wedding", section: "wedding" },
  { index: "04", label: "Venue", section: "venue" },
  { index: "05", label: "Gallery", section: "gallery" },
  { index: "06", label: "Account", section: "account" },
  { index: "07", label: "Guestbook", section: "guestbook" },
];

/**
 * 헤더(S&J / MENU) + 풀스크린 메뉴 + 현재 section 강조 + light/dark 테마 전환.
 * 원본 mockup처럼 `.section[data-theme]` 전체를 querySelectorAll로 관찰해
 * 헤더 테마와 nav 활성 링크를 함께 갱신한다.
 */
export default function FixedNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 12);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const navSectionIds = NAV_LINKS.map((l) => l.section);
    const themedSections = Array.from(document.querySelectorAll<HTMLElement>(".section[data-theme]"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const sectionTheme = entry.target.getAttribute("data-theme");
          if (sectionTheme === "dark" || sectionTheme === "light") {
            setTheme(sectionTheme);
          }
          const id = entry.target.id;
          if (navSectionIds.includes(id)) {
            setActiveSection(id);
          }
        });
      },
      { rootMargin: "-48% 0px -48% 0px", threshold: 0 }
    );
    themedSections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isOpen) {
      lockBodyScroll();
      document.documentElement.classList.add("nav-is-open");
    } else {
      document.documentElement.classList.remove("nav-is-open");
    }
    return () => {
      if (isOpen) unlockBodyScroll();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) setIsOpen(false);
    }
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [isOpen]);

  const closeNav = () => setIsOpen(false);

  return (
    <>
      <header
        className={`site-header${isScrolled ? " is-scrolled" : ""}`}
        id="siteHeader"
        data-theme={theme}
      >
        <div className="header-inner">
          <a href="#opening" className="logo">
            S&amp;J
          </a>
          <button
            className="menu-toggle"
            id="menuToggle"
            aria-label="메뉴 열기"
            aria-expanded={isOpen}
            aria-controls="fullscreenNav"
            onClick={() => setIsOpen((v) => !v)}
          >
            <span className="menu-toggle-text">MENU</span>
            <span className="menu-toggle-icon">
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </header>

      <nav className="fullscreen-nav" id="fullscreenNav" aria-hidden={!isOpen}>
        <div className="nav-inner">
          <div className="nav-top">
            <span className="logo nav-logo">S&amp;J</span>
            <button className="nav-close" id="navClose" aria-label="메뉴 닫기" onClick={closeNav}>
              CLOSE ✕
            </button>
          </div>
          <ol className="nav-list">
            {NAV_LINKS.map((link) => (
              <li key={link.section}>
                <a
                  href={`#${link.section}`}
                  data-section={link.section}
                  className={activeSection === link.section ? "is-active" : undefined}
                  onClick={closeNav}
                >
                  <span className="nav-index">{link.index}</span>
                  <span className="nav-label">{link.label}</span>
                </a>
              </li>
            ))}
          </ol>
          <div className="nav-bottom">
            <span>
              {weddingInfo.dateLabelNav} {weddingInfo.dowLabel}
            </span>
            <span>{weddingInfo.venueName}</span>
          </div>
        </div>
      </nav>
    </>
  );
}
