"use client";

import { useCallback, useRef, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import { showToast } from "@/lib/toast";
import { weddingInfo, venueInfo, venueLinks } from "@/data/wedding";
import KakaoMap from "@/components/kakao/KakaoMap";

const ACCORDION_ITEMS = [
  { key: "transit", title: "대중교통", body: venueInfo.transit },
  { key: "parking", title: "주차 안내", body: venueInfo.parking },
  { key: "shuttle", title: "셔틀버스", body: venueInfo.shuttle },
] as const;

export default function Venue() {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const panelRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [mapStatus, setMapStatus] = useState<"loading" | "ready" | "error">("loading");
  const handleMapStatusChange = useCallback(
    (status: "loading" | "ready" | "error") => setMapStatus(status),
    []
  );

  // 원본 mockup과 동일하게 max-height를 직접 읽어서(scrollHeight) 펼치고,
  // 닫을 때는 인라인 스타일을 제거해 CSS 기본값(0)으로 되돌린다.
  function toggle(key: string) {
    const nextOpen = openKey === key ? null : key;
    if (openKey && panelRefs.current[openKey]) {
      panelRefs.current[openKey]!.style.maxHeight = "";
    }
    if (nextOpen && panelRefs.current[nextOpen]) {
      const panel = panelRefs.current[nextOpen]!;
      panel.style.maxHeight = `${panel.scrollHeight}px`;
    }
    setOpenKey(nextOpen);
  }

  return (
    <section id="venue" className="section venue section-pad" data-theme="light">
      <div className="venue-body">
        <div className="venue-info-col">
          <Reveal as="p" className="eyebrow">
            04 — Venue
          </Reveal>
          <Reveal as="h2" className="venue-name">
            {weddingInfo.venueName}
          </Reveal>
          <Reveal as="p" className="venue-address">
            {weddingInfo.venueAddress}
          </Reveal>
          <Reveal as="p" className="venue-hall">
            <b className="font-semibold">{weddingInfo.venueHall}</b>
          </Reveal>

          {/* <Reveal as="div" className="venue-cta">
            <button
              className="btn btn-primary"
              id="btnDirections"
              onClick={() => showToast("카카오맵 연동 영역입니다 (실제 서비스에서 API 연결).")}
            >
              카카오맵에서 길찾기 →
            </button>
          </Reveal> */}

          <Reveal as="div" className="accordion" id="venueAccordion">
            {ACCORDION_ITEMS.map((item) => {
              const isOpen = openKey === item.key;
              return (
                <div className={`accordion-item${isOpen ? " is-open" : ""}`} key={item.key}>
                  <button className="accordion-trigger" onClick={() => toggle(item.key)}>
                    {item.title}
                    <span>+</span>
                  </button>
                  <div
                    className="accordion-panel"
                    ref={(el) => {
                      panelRefs.current[item.key] = el;
                    }}
                  >
                    <div className="accordion-panel-inner">
                      {item.body.split("\n").map((line, i, arr) => (
                        <span key={`${line+i}`}>
                          {line}
                          {i < arr.length - 1 && <br />}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </Reveal>
        </div>

        <div className="venue-map-col">
          <Reveal
            as="div"
            className={`map-placeholder${mapStatus === "ready" ? " is-live" : ""}`}
          >
            <div className="map-grid" aria-hidden="true"></div>
            <p className="map-label">KAKAO MAP</p>
            <p className="map-sub">{weddingInfo.venueName}</p>
            <KakaoMap
              address={weddingInfo.venueAddress}
              placeName={weddingInfo.venueName}
              onStatusChange={handleMapStatusChange}
            />
          </Reveal>

          <Reveal as="div" className="map-links">
            <a
              className="map-link-btn"
              href={venueLinks.kakaoMapUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              카카오맵 ↗
            </a>
            <a
              className="map-link-btn"
              href={venueLinks.naverMapUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              네이버지도 ↗
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
