# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
