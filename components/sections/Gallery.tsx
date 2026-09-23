"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, MotionConfig, type PanInfo } from "framer-motion";
import Reveal from "@/components/ui/Reveal";
import FallbackImage from "@/components/ui/FallbackImage";
import { placeholderImage } from "@/lib/placeholder";
import { lockBodyScroll, unlockBodyScroll } from "@/lib/scrollLock";
import { galleryImages, GALLERY_LAYOUT, GALLERY_PREVIEW_COUNT } from "@/data/gallery";

const EASE = [0.16, 0.84, 0.44, 1] as const;

// 아래로 swipe해서 lightbox를 닫는 기준(px). 좌우 전환은 아래 drag 제스처가 담당한다.
const SWIPE_THRESHOLD_Y_CLOSE = 90;
// 좌우 swipe 판정: 거리 × 속도 조합 (Framer Motion 공식 예제의 공식을 그대로 사용)
const SWIPE_CONFIDENCE_THRESHOLD = 10000;
function swipePower(offset: number, velocity: number) {
  return Math.abs(offset) * velocity;
}

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

      {/* AnimatePresence가 lightboxIndex===null로 바뀌어도 exit 애니메이션이 끝날 때까지
          GalleryLightbox를 실제로 unmount하지 않는다 — close fade가 항상 끝까지 재생된다.
          MotionConfig reducedMotion="user"는 OS의 "동작 줄이기" 설정을 자동으로 존중한다. */}
      <MotionConfig reducedMotion="user">
        <AnimatePresence>
          {lightboxIndex !== null && (
            <GalleryLightbox key="lightbox" initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
          )}
        </AnimatePresence>
      </MotionConfig>
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
  const [direction, setDirection] = useState<1 | -1>(1);
  const total = galleryImages.length;

  function paginate(dir: 1 | -1) {
    setDirection(dir);
    setIndex((i) => (i + dir + total) % total);
  }
  const nextImage = () => paginate(1);
  const prevImage = () => paginate(-1);

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

  // 세로(아래로) swipe로 닫기만 여기서 직접 처리한다. 좌우 전환은 사진 레이어의
  // drag="x" + onDragEnd(아래)가 손가락을 실시간으로 따라가며 담당한다.
  let touchStartY: number | null = null;
  function handleTouchStart(e: React.TouchEvent) {
    touchStartY = e.touches[0].clientY;
  }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartY === null) return;
    const dy = e.changedTouches[0].clientY - touchStartY;
    touchStartY = null;
    if (dy > SWIPE_THRESHOLD_Y_CLOSE) onClose();
  }

  function handleDragEnd(_e: unknown, info: PanInfo) {
    const swipe = swipePower(info.offset.x, info.velocity.x);
    if (swipe < -SWIPE_CONFIDENCE_THRESHOLD) {
      nextImage();
    } else if (swipe > SWIPE_CONFIDENCE_THRESHOLD) {
      prevImage();
    }
  }

  const img = galleryImages[index];

  return createPortal(
    <motion.div
      className="lightbox"
      aria-hidden="false"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.32, ease: EASE }}
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
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            className="lightbox-ph-layer"
            initial={{ x: direction === 1 ? "100%" : "-100%" }}
            animate={{ x: "0%" }}
            exit={{ x: direction === 1 ? "-100%" : "100%" }}
            transition={{ duration: 0.38, ease: EASE }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
          >
            <FallbackImage
              className="lightbox-ph"
              src={img.src}
              fallbackSrc={galleryFallback(index)}
              alt={img.alt}
              sizes="(min-width: 640px) 560px, 92vw"
            />
          </motion.div>
        </AnimatePresence>
        <span className="lightbox-cap">Photograph {String(index + 1).padStart(2, "0")}</span>
      </div>
      <button className="lightbox-nav lightbox-next" aria-label="다음 사진" onClick={nextImage}>
        ›
      </button>
      <span className="lightbox-count">
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>
    </motion.div>,
    document.body
  );
}
