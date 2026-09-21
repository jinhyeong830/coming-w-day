"use client";

import { useState, type ImgHTMLAttributes } from "react";

interface FallbackImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string;
  fallbackSrc: string;
}

/**
 * 지정한 경로(예: /images/gallery/01.jpg)의 실제 파일이 아직 없거나 로드에 실패하면
 * 자동으로 placeholder로 대체한다. data/*.ts에는 "규칙대로" 정해진 경로를 미리 채워두고,
 * 실제 사진 파일을 해당 경로에 넣기만 하면 코드 수정 없이 즉시 반영되는 구조를 위한 컴포넌트.
 */
export default function FallbackImage({ src, fallbackSrc, alt, ...rest }: FallbackImageProps) {
  const [failed, setFailed] = useState(false);
  // src가 바뀌면(예: 라이트박스 prev/next) 이전 이미지의 실패 상태를 들고 있지 않도록 리셋한다.
  // (렌더 중 state를 갱신하는 React 공식 패턴 — useEffect보다 한 프레임 빠르게 반영된다)
  const [trackedSrc, setTrackedSrc] = useState(src);
  if (src !== trackedSrc) {
    setTrackedSrc(src);
    setFailed(false);
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={failed ? fallbackSrc : src}
      alt={alt}
      onError={() => setFailed(true)}
      {...rest}
    />
  );
}
