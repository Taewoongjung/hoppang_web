# base image 설정(as build 로 완료된 파일을 밑에서 사용할 수 있다.)
FROM node:16-alpine as builder

# 컨테이너 내부 작업 디렉토리 설정
WORKDIR /app

# Puppeteer/Chromium 의존성 설치 (react-snap을 위해)
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Puppeteer가 chromium을 찾을 수 있도록 환경 변수 설정
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browse

# app dependencies
# 컨테이너 내부로 package.json 파일들을 복사
COPY package*.json ./

# package.json 및 package-lock.json 파일에 명시된 의존성 패키지들을 설치
RUN npm install --force

# 호스트 머신의 현재 디렉토리 파일들을 컨테이너 내부로 전부 복사
COPY . .

# npm build
RUN npm run build

# prod environment
FROM nginx:stable-alpine

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# 이전 빌드 단계에서 빌드한 결과물을 /usr/share/nginx/html 으로 복사한다.
COPY --from=builder /app/build /usr/share/nginx/html

# 컨테이너의 10244번 포트를 열어준다.
EXPOSE 10244

# .env 파일을 환경 변수로 전달
# Docker 컨테이너를 실행할 때 이 부분을 환경 변수에 맞게 수정해주세요
ENV REACT_HOPPANG_APP_REQUEST_API_URL=https://hoppang.store/

# nginx 서버를 실행하고 백그라운드로 동작하도록 한다.
CMD ["nginx", "-g", "daemon off;"]
