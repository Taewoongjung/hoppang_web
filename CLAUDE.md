# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 위키 참조 (LLM Wiki)

이 프로젝트의 모든 디자인, 아키텍처, 사업 결정은 아래 위키에 정리되어 있다.
코드 수정 전 반드시 관련 위키 페이지를 읽고 일관성을 유지할 것.

- **위키 경로:** `/Users/jeongtaeung/Desktop/LLM wiki/wiki/`
- **디자인 결정:** `wiki/decision_호빵_디자인_방향.md` — 컬러, UI 원칙, 타이포그래피
- **사업 결정:** `wiki/decision_호빵_확정_및_미정_사항.md` — 확정/미정 항목
- **호빵 엔티티:** `wiki/entity_호빵.md` — 기능, 아키텍처, 수익 구조 전체
- **인덱스:** `wiki/index.md` — 전체 위키 페이지 카탈로그

### 핵심 디자인 토큰 (decision_호빵_디자인_방향 기준)

| 항목 | 값 | 비고 |
|---|---|---|
| Primary | `#FF6A4D` | 코랄 오렌지 (따뜻함) |
| Primary hover | `#FF8266` | |
| Primary light | `#FFF1ED` | 배경/태그용 |
| Primary dark | `#E85535` | |
| Secondary | `#2D3748` | 딥 네이비 (신뢰) |
| Background | `#FFFBF7` | 웜 크림 (순백 대신) |
| Accent | `#48BB78` | 긍정 피드백 |
| Border radius | 12~16px | 부드러운 느낌 |
| 버튼 형태 | pill (둥근 끝) | 사각형 금지 |

UI/디자인 관련 작업 시 반드시 `decision_호빵_디자인_방향.md`를 먼저 읽을 것.
Ant Design ConfigProvider 테마 오버라이드로 전체 테마 관리.

## Project Overview

"호빵" (Hoppang) is a Korean web application for window sash (샷시) price estimation. Users can input sash type and dimensions to get fair price estimates. The app also includes OAuth login, community features, and an admin panel.

## Commands

```bash
npm start          # Start development server (port 3000)
npm run build      # Production build with sitemap generation
npm test           # Run tests with Jest
```

## Architecture

### Directory Structure
- `src/pages/` - Page components organized by domain
  - `main/` - User-facing pages (calculator, login, mypage, etc.)
  - `admin/` - Admin panel pages (statistics, database management)
  - `landingPage/` - Marketing landing page
- `src/component/` - Reusable components
  - `V2/` - Current version components
  - `admin/` - Admin-specific components
  - `Banner/`, `Loading/` - Shared UI components
- `src/definition/` - Constants, types, API paths
- `src/util/` - Utilities including API fetchers
- `src/layouts/App/App.tsx` - Main routing configuration

### Key Technologies
- React 18 with TypeScript
- React Router DOM v5 (Switch-based routing)
- styled-components for CSS
- antd (Ant Design) for UI components
- @loadable/component for code splitting
- SWR for data fetching
- axios for HTTP requests
- react-snap for pre-rendering (SEO)

### API Layer
- API paths defined in `src/definition/apiPath.tsx`
- Main fetcher: `src/util/fetcher.ts` (SWR-compatible)
- Admin fetcher: `src/util/adminFetcher.ts`
- Authentication via localStorage token (`hoppang-token`)
- OAuth providers: Kakao, Apple, Google

### Authentication Flow
- Tokens stored in localStorage with key `hoppang-token`
- OAuth type stored as `hoppang-login-oauthType` (KKO/APL/GLE)
- Auto token refresh on 403 errors via refresh endpoints
- Redirect to `/v2/login` on auth failures

### Route Structure
- Main calculator: `/chassis/calculator`, `/calculator/*`
- Simple calculation wizard: `/calculator/simple/step0` through `step5`
- User pages: `/v2/login`, `/v2/mypage/*`
- Admin: `/admin/*` routes
- Guides: `/v2/guide/*`
- Community: `/question/boards/*`

### Styling Convention
- Uses styled-components (v6)
- antd components for forms, tables, modals
- Mobile-first responsive design

## Deployment
- Docker multi-stage build (Node 16 builder, nginx alpine)
- nginx configuration at `nginx/nginx.conf`
- Production URL: https://hoppang.store
