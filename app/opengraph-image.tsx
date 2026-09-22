import { ImageResponse } from "next/og";
import { weddingInfo } from "@/data/wedding";

// 내용이 고정(static)이라 edge runtime 없이도 build 시 정적으로 생성된다.
export const alt = "SANGWOO & JINHYEONG Wedding";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 실제 사진이 준비되기 전까지 사이트 톤(dark ink / warm off-white / accent)을 그대로 사용한
// 텍스트 기반 카드로 og:image를 생성한다. 사진이 정해지면 이 파일만 교체하면 된다.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#121110",
          color: "#F6F4EF",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            fontSize: 24,
            letterSpacing: 10,
            textTransform: "uppercase",
            color: "#A8A296",
          }}
        >
          Wedding Invitation
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 28,
            marginTop: 32,
            fontSize: 104,
          }}
        >
          <span>{weddingInfo.groomNameEn}</span>
          <span style={{ color: "#A8462E", fontStyle: "italic", fontSize: 68 }}>&amp;</span>
          <span>{weddingInfo.brideNameEn}</span>
        </div>
        <div
          style={{
            marginTop: 36,
            fontSize: 30,
            letterSpacing: 6,
            color: "#A8A296",
          }}
        >
          {weddingInfo.dateLabelSpaced}
        </div>
      </div>
    ),
    { ...size }
  );
}
