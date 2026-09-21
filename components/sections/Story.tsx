"use client";

import { useEffect, useRef } from "react";
import Reveal from "@/components/ui/Reveal";
import FallbackImage from "@/components/ui/FallbackImage";
import { placeholderImage } from "@/lib/placeholder";
import { storyItems, STORY_TRACK_W as TRACK_W, STORY_TRACK_H as TRACK_H } from "@/data/story";

/**
 * OUR STORY — scroll-driven horizontal storytelling.
 * 원본 mockup의 sticky + horizontal-track + SVG path 합류 연출을 그대로 이식했다.
 * (좌표 시스템은 data/story.ts의 storyItems x/y, TRACK_W/TRACK_H와 1:1로 대응)
 */
export default function Story() {
  const pinWrapRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const yearGhostRef = useRef<HTMLSpanElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const dotRefs = useRef<(HTMLElement | null)[]>([]);

  // 신부/신랑 라인이 합류하는 지점 — storyItems[2] (2020, lane: "merge")
  const mergeItem = storyItems[2];
  const mergeX = mergeItem.x;
  const mergeY = mergeItem.y;

  const pathBrideD = `M140,80 L${mergeX - 260},80 C${mergeX - 140},80 ${mergeX - 60},${mergeY} ${mergeX},${mergeY}`;
  const pathGroomD = `M140,320 L${mergeX - 260},320 C${mergeX - 140},320 ${mergeX - 60},${mergeY} ${mergeX},${mergeY}`;
  const pathMergedD = `M${mergeX},${mergeY} L${TRACK_W - 220},${mergeY}`;

  useEffect(() => {
    const pinWrap = pinWrapRef.current;
    const pin = pinRef.current;
    const track = trackRef.current;
    const yearGhost = yearGhostRef.current;
    const progressFill = progressFillRef.current;
    if (!pinWrap || !pin || !track || !yearGhost || !progressFill) return;

    let rafPending = false;

    function updateStory() {
      rafPending = false;
      if (!pinWrap || !pin || !track || !yearGhost || !progressFill) return;

      const rect = pinWrap.getBoundingClientRect();
      const total = pinWrap.offsetHeight - window.innerHeight;
      let progress = total > 0 ? -rect.top / total : 0;
      progress = Math.min(Math.max(progress, 0), 1);

      const viewport = pin.clientWidth;
      const maxTranslate = Math.max(TRACK_W - viewport, 0);
      const translateX = progress * maxTranslate;
      track.style.transform = `translateX(-${translateX}px)`;

      const centerX = translateX + viewport / 2;
      let closestIndex = 0;
      let closestDist = Infinity;
      storyItems.forEach((item, i) => {
        const d = Math.abs(item.x - centerX);
        const active = d < 260;
        cardRefs.current[i]?.classList.toggle("is-active", active);
        dotRefs.current[i]?.classList.toggle("is-active", active);
        if (d < closestDist) {
          closestDist = d;
          closestIndex = i;
        }
      });
      const yr = storyItems[closestIndex].year;
      if (yearGhost.textContent !== yr) yearGhost.textContent = yr;
      progressFill.style.width = `${progress * 100}%`;
    }

    function onScroll() {
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(updateStory);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateStory);
    updateStory();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateStory);
    };
  }, []);

  return (
    <section id="story" className="section story" data-theme="dark">
      <div className="story-intro">
        <Reveal as="h2">
          Two lives,
          <br />
          one timeline.
        </Reveal>
        <Reveal as="p" className="story-hint">
          Scroll to continue ↓
        </Reveal>
      </div>
      <div className="story-pin-wrap" id="storyPinWrap" ref={pinWrapRef}>
        <div className="story-pin" ref={pinRef}>
          <span className="story-year-ghost" id="storyYearGhost" ref={yearGhostRef}>
            {storyItems[0].year}
          </span>
          <div className="story-track" id="storyTrack" ref={trackRef} style={{ width: TRACK_W }}>
            <div className="story-cards" id="storyCards">
              {storyItems.map((item, i) => {
                const fallbackSrc = placeholderImage(i, item.year);
                return (
                  <figure
                    key={item.year}
                    ref={(el) => {
                      cardRefs.current[i] = el;
                    }}
                    className={`story-card lane-${item.lane}${item.big ? " is-big" : ""}`}
                    style={{ left: item.x }}
                  >
                    <span className="story-card-media">
                      <FallbackImage
                        src={item.image}
                        fallbackSrc={fallbackSrc}
                        alt={item.alt || item.title}
                        loading="lazy"
                      />
                    </span>
                    <figcaption>
                      <span className="story-card-year">{item.year}</span>
                      <span className="story-card-title">{item.title}</span>
                    </figcaption>
                  </figure>
                );
              })}
            </div>
            <div className="story-spine" id="storySpine">
              <svg
                className="story-lines"
                id="storyLines"
                viewBox={`0 0 ${TRACK_W} ${TRACK_H}`}
                preserveAspectRatio="none"
                style={{ width: TRACK_W }}
              >
                <path className="line-bride" d={pathBrideD} />
                <path className="line-groom" d={pathGroomD} />
                <path className="line-merged" d={pathMergedD} />
              </svg>
              {storyItems.map((item, i) => (
                <span
                  key={item.year}
                  ref={(el) => {
                    dotRefs.current[i] = el;
                  }}
                  className={`spine-dot lane-${item.lane}`}
                  style={{ left: item.x, top: `${(item.y / TRACK_H) * 100}%` }}
                />
              ))}
            </div>
          </div>
          <div className="story-progress">
            <div className="story-progress-track">
              <div className="story-progress-fill" id="storyProgressFill" ref={progressFillRef} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
