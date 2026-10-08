"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import { showToast } from "@/lib/toast";
import { weddingInfo, venueInfo, venueLinks } from "@/data/wedding";
import KakaoMap, { type KakaoMapCoords } from "@/components/kakao/KakaoMap";

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

  // KakaoMap이 marker에 쓴 것과 동일한 geocoding 결과 좌표. 길찾기 링크에 재사용하고,
  // 새 좌표를 임의로 추측해 넣지 않기 위해 이 값이 준비되기 전에는 장소명 검색 fallback 링크를 쓴다.
  const [venueCoords, setVenueCoords] = useState<KakaoMapCoords | null>(null);
  const handleCoordsReady = useCallback((coords: KakaoMapCoords) => setVenueCoords(coords), []);

  // 네이버지도 nmap:// scheme의 appname에 쓸 "웹 페이지의 URL" (공식 문서 기준). 서버 렌더링 시점엔
  // window가 없으므로 mount 이후에만 채운다.
  const [pageUrl, setPageUrl] = useState("");
  useEffect(() => {
    setPageUrl(window.location.href);
  }, []);

  const kakaoMapHref = venueCoords
    ? `https://map.kakao.com/link/to/${encodeURIComponent(weddingInfo.venueName)},${venueCoords.lat},${venueCoords.lng}`
    : venueLinks.kakaoMapUrl;

  const handleNaverMapClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      // 좌표가 아직 없으면 href(장소명 검색 fallback 링크)의 기본 동작을 그대로 둔다.
      if (!venueCoords) return;

      event.preventDefault();

      const appUrl = `nmap://navigation?dlat=${venueCoords.lat}&dlng=${venueCoords.lng}&dname=${encodeURIComponent(
        weddingInfo.venueName
      )}&appname=${encodeURIComponent(pageUrl || venueLinks.naverMapUrl)}`;
      const fallbackUrl = venueLinks.naverMapUrl;

      // nmap:// 앱 scheme은 앱이 없으면 아무 반응도 없을 수 있어, 일정 시간 안에 화면을 벗어나지
      // 않으면(= 앱이 안 열렸으면) 기존 웹 fallback으로 이동시킨다.
      const timer = window.setTimeout(() => {
        if (document.visibilityState === "visible") {
          window.location.href = fallbackUrl;
        }
      }, 1500);
      const clearFallback = () => window.clearTimeout(timer);
      document.addEventListener("visibilitychange", clearFallback, { once: true });
      window.addEventListener("pagehide", clearFallback, { once: true });

      window.location.href = appUrl;
    },
    [venueCoords, pageUrl]
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
            {weddingInfo.venueHall}
          </Reveal>

          <Reveal as="div" className="venue-cta">
            <button
              className="btn btn-primary"
              id="btnDirections"
              onClick={() => showToast("카카오맵 연동 영역입니다 (실제 서비스에서 API 연결).")}
            >
              카카오맵에서 길찾기 →
            </button>
          </Reveal>

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
              onCoordsReady={handleCoordsReady}
            />
          </Reveal>

          <Reveal as="div" className="map-links">
            <a className="map-link-btn" href={kakaoMapHref}>
              카카오맵 ↗
            </a>
            <a
              className="map-link-btn"
              href={venueLinks.naverMapUrl}
              onClick={handleNaverMapClick}
            >
              네이버지도 ↗
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
