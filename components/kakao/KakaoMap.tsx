"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    kakao: any;
  }
}

let kakaoSdkPromise: Promise<void> | null = null;

function loadKakaoSdk(appKey: string): Promise<void> {
  if (window.kakao?.maps) return Promise.resolve();
  if (kakaoSdkPromise) return kakaoSdkPromise;

  kakaoSdkPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-kakao-sdk]");
    if (existing) {
      existing.addEventListener("load", () => window.kakao.maps.load(() => resolve()));
      existing.addEventListener("error", () => reject(new Error("Kakao Maps SDK script failed to load")));
      return;
    }

    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services`;
    script.async = true;
    script.dataset.kakaoSdk = "true";
    script.onload = () => window.kakao.maps.load(() => resolve());
    script.onerror = () => reject(new Error("Kakao Maps SDK script failed to load"));
    document.head.appendChild(script);
  });

  return kakaoSdkPromise;
}

type KakaoMapProps = {
  address: string;
  placeName: string;
  onStatusChange?: (status: "loading" | "ready" | "error") => void;
};

export default function KakaoMap({ address, placeName, onStatusChange }: KakaoMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  useEffect(() => {
    const appKey = process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY;
    if (!appKey) {
      console.error(
        "[KakaoMap] NEXT_PUBLIC_KAKAO_MAP_APP_KEY가 설정되지 않았습니다. .env.local을 확인하세요."
      );
      setStatus("error");
      return;
    }

    let cancelled = false;

    loadKakaoSdk(appKey)
      .then(() => {
        if (cancelled || !containerRef.current) return;

        const kakao = window.kakao;
        const geocoder = new kakao.maps.services.Geocoder();

        geocoder.addressSearch(address, (result: any[], geocoderStatus: string) => {
          if (cancelled || !containerRef.current) return;

          if (geocoderStatus !== kakao.maps.services.Status.OK || result.length === 0) {
            console.error("[KakaoMap] 주소 검색에 실패했습니다:", address, geocoderStatus);
            setStatus("error");
            return;
          }

          const coords = new kakao.maps.LatLng(Number(result[0].y), Number(result[0].x));
          const map = new kakao.maps.Map(containerRef.current, {
            center: coords,
            level: 3,
          });

          const marker = new kakao.maps.Marker({ position: coords, map });

          const infowindow = new kakao.maps.InfoWindow({
            content: `<div style="padding:6px 10px;font-size:12px;white-space:nowrap;">${placeName}</div>`,
          });
          kakao.maps.event.addListener(marker, "click", () => infowindow.open(map, marker));

          setStatus("ready");
        });
      })
      .catch((error) => {
        console.error("[KakaoMap] SDK 로딩에 실패했습니다:", error);
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [address, placeName]);

  if (status === "error") return null;

  return <div ref={containerRef} className="kakao-map-canvas" aria-label={`${placeName} 지도`} />;
}
