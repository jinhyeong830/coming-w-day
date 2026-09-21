"use client";

import { useState, type CSSProperties } from "react";
import Image from "next/image";

interface FallbackImageProps {
  src: string;
  fallbackSrc: string;
  alt: string;
  /** next/image가 뷰포트별로 적절한 크기를 내려받도록 주는 힌트. fill 모드에서 필수. */
  sizes: string;
  className?: string;
  priority?: boolean;
}

const objectCoverStyle: CSSProperties = { objectFit: "cover" };
const fallbackStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

/**
 * 지정한 경로(예: /images/gallery/01.jpg)의 실제 파일이 아직 없거나 로드에 실패하면
 * 자동으로 placeholder로 대체한다. data/*.ts에는 "규칙대로" 정해진 경로를 미리 채워두고,
 * 실제 사진 파일을 해당 경로에 넣기만 하면 코드 수정 없이 즉시 반영되는 구조를 위한 컴포넌트.
 *
 * 실제 사진(성공 경로)은 next/image로 렌더링해 뷰포트에 맞는 크기/포맷으로 자동 최적화된다
 * (원본이 수 MB짜리 카메라 원본이어도 실제로는 리사이즈된 파일만 전송된다).
 * fallback(placeholder)은 이미 매우 가벼운 inline SVG라 최적화가 필요 없어 일반 <img>로 렌더링한다.
 *
 * 부모 요소는 position이 relative/absolute여야 한다(next/image의 fill 모드 요구사항).
 */
export default function FallbackImage({ src, fallbackSrc, alt, sizes, className, priority }: FallbackImageProps) {
  const [failed, setFailed] = useState(false);
  // src가 바뀌면(예: 라이트박스 prev/next) 이전 이미지의 실패 상태를 들고 있지 않도록 리셋한다.
  // (렌더 중 state를 갱신하는 React 공식 패턴 — useEffect보다 한 프레임 빠르게 반영된다)
  const [trackedSrc, setTrackedSrc] = useState(src);
  if (src !== trackedSrc) {
    setTrackedSrc(src);
    setFailed(false);
  }

  if (failed) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={fallbackSrc} alt={alt} className={className} style={fallbackStyle} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className={className}
      style={objectCoverStyle}
      priority={priority}
      onError={() => setFailed(true)}
    />
  );
}
