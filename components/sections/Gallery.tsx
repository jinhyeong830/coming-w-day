"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import Reveal from "@/components/ui/Reveal";
import FallbackImage from "@/components/ui/FallbackImage";
import { placeholderImage } from "@/lib/placeholder";
import { galleryImages, GALLERY_LAYOUT, GALLERY_PREVIEW_COUNT } from "@/data/gallery";

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
                <FallbackImage src={img.src} fallbackSrc={galleryFallback(i)} alt={img.alt} loading="lazy" />
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

  let touchStartX: number | null = null;
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX = e.touches[0].clientX;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) {
      dx < 0 ? nextImage() : prevImage();
    }
    touchStartX = null;
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
