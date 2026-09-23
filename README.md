# S&J Wedding Invitation

모바일 우선 인터랙티브 청첩장. Next.js(App Router) + TypeScript + Tailwind CSS.

**배포 도메인**: [https://www.weddingcomingdy.my](https://www.weddingcomingdy.my)

## 기술 스택

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- pnpm

## 시작하기

```bash
pnpm install
pnpm dev       # http://localhost:3000
```

## 빌드

```bash
pnpm build
pnpm lint
```

## 디자인 기준

`mockup/index.html`이 디자인/인터랙션의 원본 기준입니다. 수정 시 `CLAUDE.md` 규칙을 따릅니다.

## 프로젝트 구조

```
app/            App Router 페이지, layout, 전역 CSS
components/     section·navigation·ui 컴포넌트
data/           콘텐츠 데이터 (스토리, 갤러리, 청첩 정보 등)
lib/            공용 유틸 (scroll lock, toast, placeholder 등)
public/images/  실제 사진 (parents / story / gallery)
mockup/         디자인 기준 원본 HTML (참고용, 수정 금지)
```
