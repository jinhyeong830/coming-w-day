"use client";

import { useEffect, useRef } from "react";
import Reveal from "@/components/ui/Reveal";
import FallbackImage from "@/components/ui/FallbackImage";
import { placeholderImage } from "@/lib/placeholder";
import { storyItems, STORY_TRACK_W as TRACK_W, STORY_TRACK_H as TRACK_H } from "@/data/story";

/**
 * ⚠️ 임시 진단 플래그 (원인 분리 테스트용)
 * iOS Safari에서 "문제가 반복적으로 발생했습니다" + WebContent 종료/재로딩이 발생하는 문제의
 * 원인이 Story의 WebM 재생인지 확인하기 위해, video 렌더링만 잠시 끄고 대신 기존
 * poster/placeholder 이미지를 보여준다.
 *
 * - data/story.ts의 video 경로(2022/2025/2026.webm) 데이터는 그대로 유지된다.
 * - public/images/story/*.webm 파일도 그대로 유지된다.
 * - 카드 위치/크기, 스크롤 매핑(updateStory)은 전혀 영향받지 않는다.
 *
 * 원인이 아닌 것으로 확인되면 이 값을 true로 되돌리면 즉시 이전 동작(video 재생)으로 복귀한다.
 */
const ENABLE_STORY_VIDEO = false;

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
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

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

  // 모바일 성능 최적화: Story의 video는 preload="none"이라 기본적으로 아무것도 받아오지
  // 않는다. 실제로 화면에 보이는(=IntersectionObserver 기준 충분히 보이는) video만
  // play()하고, 벗어나면 pause()한다 — 스크롤 매핑(updateStory)과는 완전히 분리된 별도
  // 로직이라 기존 scroll interaction에는 영향을 주지 않는다.
  // (가로 transform으로 카드가 이동해도 IntersectionObserver는 실제 렌더링된 위치 기준으로
  //  교차를 판정하므로 올바르게 동작한다.)
  useEffect(() => {
    const videos = videoRefs.current.filter((v): v is HTMLVideoElement => v !== null);
    if (videos.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            const playPromise = video.play();
            // 브라우저 autoplay 정책으로 거부되거나(play() Promise rejection),
            // 디코딩이 실패해도 콘솔 에러/페이지 크래시로 이어지지 않도록 조용히 무시한다.
            // (이 경우 video의 poster가 그대로 보여 화면이 깨지지 않는다.)
            if (playPromise !== undefined) {
              playPromise.catch(() => {});
            }
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    videos.forEach((v) => observer.observe(v));
    return () => observer.disconnect();
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
                const isVideo = item.image.toLowerCase().endsWith(".webm");
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
                      {isVideo && ENABLE_STORY_VIDEO ? (
                        <video
                          ref={(el) => {
                            videoRefs.current[i] = el;
                          }}
                          muted
                          loop
                          playsInline
                          preload="none"
                          poster={fallbackSrc}
                          aria-label={item.alt || item.title}
                        >
                          <source src={item.image} type="video/webm" />
                          {item.videoMp4 && <source src={item.videoMp4} type="video/mp4" />}
                        </video>
                      ) : isVideo ? (
                        // 임시 진단: ENABLE_STORY_VIDEO=false인 동안 video 대신
                        // 기존 poster/placeholder 이미지만 그대로 보여준다.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={fallbackSrc}
                          alt={item.alt || item.title}
                          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <FallbackImage
                          src={item.image}
                          fallbackSrc={fallbackSrc}
                          alt={item.alt || item.title}
                          sizes="(min-width: 1024px) 380px, 32vw"
                        />
                      )}
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
