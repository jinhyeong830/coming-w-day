import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteTitle = "SANGWOO & JINHYEONG — Wedding";
const siteDescription = "상우 & 진형의 결혼식에 초대합니다.";

// og:image 등 절대 URL을 만들 때 쓰이는 기준 도메인.
// Vercel은 VERCEL_URL(및 프로덕션 배포 시 VERCEL_PROJECT_PRODUCTION_URL)을 자동으로 심어주므로
// 별도 환경변수 설정 없이도 배포 즉시 올바른 도메인으로 채워진다. 로컬에서는 localhost로 대체된다.
const siteUrl =
  process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL ?? "localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(`http${siteUrl.startsWith("localhost") ? "" : "s"}://${siteUrl}`),
  title: siteTitle,
  description: siteDescription,
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: "website",
    locale: "ko_KR",
    // og:image는 app/opengraph-image.tsx에서 자동 생성되어 별도 지정 없이도 포함된다.
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        {/* 원본 mockup과 동일한 폰트 소스를 그대로 유지한다 (임의 변경 금지) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
