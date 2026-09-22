"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import Reveal from "@/components/ui/Reveal";
import FallbackImage from "@/components/ui/FallbackImage";
import { placeholderImage } from "@/lib/placeholder";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/scrollLock";
import { galleryImages, GALLERY_LAYOUT, GALLERY_PREVIEW_COUNT } from "@/data/gallery";

// 스와이프 제스처 판정 기준(px). 짧은 탭이나 단순 클릭은 이 값을 넘지 않아 무시된다.
const SWIPE_THRESHOLD_X = 50; // 좌우 — 사진 전환
const SWIPE_THRESHOLD_Y_CLOSE = 90; // 아래로 — lightbox 닫기 (전환보다 더 확실한 제스처를 요구)

// 실제 파일이 아직 없는 슬롯(404)은 자동으로 이 placeholder로 대체된다.
function galleryFallback(index: number): string {
  return placeholderImage(index, String(index + 1).padStart(2, "0"));
}

// 모바일/데스크톱 배치 순서를 CSS 커스텀 프로퍼티로 넘긴다 (app/globals.css의
// .g-item { order: var(--order-mobile, 0); display: var(--d-mobile, block); } 와 짝을 이룬다).
type GalleryItemStyle = CSSProperties & {
  "--order-desktop"?: number;
  "--order-mobile"?: number;
  "--d-mobile"?: string;
};

export default function Gallery() {
  const previewImages = galleryImages.slice(0, GALLERY_PREVIEW_COUNT);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <section id="gallery" className="section gallery section-pad" data-theme="light">
      <div className="gallery-head">
        <Reveal as="p" className="eyebrow">
          05 — Gallery
        </Reveal>
        <Reveal as="h2">In Frame</Reveal>
      </div>
      <Reveal as="div" className="gallery-grid" id="galleryGrid">
        {previewImages.map((img, i) => {
          const slot = GALLERY_LAYOUT[i];
          const style: GalleryItemStyle = { "--order-desktop": i + 1 };
          if (slot.mobileOrder) {
            style["--order-mobile"] = slot.mobileOrder;
          } else {
            style["--d-mobile"] = "none";
          }
          return (
            <button
              key={img.alt}
              type="button"
              className={`g-item ${slot.type}`}
              style={style}
              onClick={() => setLightboxIndex(i)}
            >
              <span className="g-ph">
                <FallbackImage
                  src={img.src}
                  fallbackSrc={galleryFallback(i)}
                  alt={img.alt}
                  sizes="(min-width: 1280px) 33vw, (min-width: 768px) 40vw, 90vw"
                />
              </span>
              <span className="g-cap">{String(i + 1).padStart(2, "0")}</span>
            </button>
          );
        })}
      </Reveal>

      {lightboxIndex !== null && (
        <GalleryLightbox initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}
    </section>
  );
}

function GalleryLightbox({
  initialIndex,
  onClose,
}: {
  initialIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const total = galleryImages.length;

  const nextImage = () => setIndex((i) => (i + 1) % total);
  const prevImage = () => setIndex((i) => (i - 1 + total) % total);

  useEffect(() => {
    function handleKeydown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    }
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose]);

  // lightbox가 열려 있는 동안 배경 페이지가 스크롤되지 않도록 한다 — 이게 없으면
  // 모바일에서 스와이프 제스처가 배경 스크롤과 경합해 사진 전환/닫기가 씹히는 원인이 된다.
  useEffect(() => {
    lockBodyScroll();
    return () => unlockBodyScroll();
  }, []);

  // touchstart/touchend만으로 좌우(사진 전환)와 아래 방향(닫기)을 구분한다.
  // - 가로 이동이 더 크면(horizontal dominant) 좌우 스와이프로 판단
  // - 세로 이동이 더 크고 아래 방향이며 threshold 이상이면 닫기
  // - 둘 다 threshold 미만이면(짧은 탭/클릭) 아무 동작 없음
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  }
  function handleTouchEnd(e: React.TouchEvent) {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;

    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > SWIPE_THRESHOLD_X) {
        dx < 0 ? nextImage() : prevImage();
      }
    } else if (dy > SWIPE_THRESHOLD_Y_CLOSE) {
      onClose();
    }
  }

  const img = galleryImages[index];

  return createPortal(
    <div
      className="lightbox is-open"
      aria-hidden="false"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button className="lightbox-close" onClick={onClose}>
        CLOSE ✕
      </button>
      <button className="lightbox-nav lightbox-prev" aria-label="이전 사진" onClick={prevImage}>
        ‹
      </button>
      <div className="lightbox-stage">
        <FallbackImage
          className="lightbox-ph"
          src={img.src}
          fallbackSrc={galleryFallback(index)}
          alt={img.alt}
          sizes="(min-width: 640px) 560px, 92vw"
          priority
        />
        <span className="lightbox-cap">Photograph {String(index + 1).padStart(2, "0")}</span>
      </div>
      <button className="lightbox-nav lightbox-next" aria-label="다음 사진" onClick={nextImage}>
        ›
      </button>
      <span className="lightbox-count">
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>
    </div>,
    document.body
  );
}
