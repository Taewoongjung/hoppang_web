// GA4 Analytics Utility with Platform Detection

type Platform = 'web' | 'ios' | 'android';

const PLATFORM_STORAGE_KEY = 'hoppang-platform';

/**
 * 모바일 디바이스 + 브라우저 기반 플랫폼 감지
 * - 모바일 + Safari → ios
 * - 모바일 + Chrome → android
 * - 그 외 → web
 */
function detectPlatformByUserAgent(): Platform {
    const userAgent = navigator.userAgent;

    // 모바일 디바이스 체크
    const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent);

    if (!isMobile) {
        return 'web';
    }

    // 모바일인 경우 브라우저로 구분
    // iOS Safari: Safari 있고 Chrome/CriOS 없음
    // Android Chrome: Chrome 있고 Safari 없거나 Mobile Safari
    const isSafari = /Safari/i.test(userAgent) && !/Chrome|CriOS/i.test(userAgent);
    const isChrome = /Chrome/i.test(userAgent) || /CriOS/i.test(userAgent);

    if (isSafari) {
        return 'ios';
    }

    if (isChrome) {
        return 'android';
    }

    // 모바일이지만 Safari/Chrome 둘 다 아니면 web
    return 'web';
}

/**
 * 플랫폼 감지
 * 우선순위: URL 파라미터 > User-Agent(브라우저 감지)
 */
export function detectAndStorePlatform(): Platform {
    // 1. URL 파라미터 확인 (앱에서 명시적으로 전달한 경우)
    const urlParams = new URLSearchParams(window.location.search);
    const sourceParam = urlParams.get('source');

    if (sourceParam === 'ios' || sourceParam === 'android') {
        localStorage.setItem(PLATFORM_STORAGE_KEY, sourceParam);
        return sourceParam;
    }

    // 2. User-Agent로 감지
    return detectPlatformByUserAgent();
}

/**
 * 현재 플랫폼 반환
 */
export function getPlatform(): Platform {
    // 1. URL 파라미터로 저장된 값 확인
    const storedPlatform = localStorage.getItem(PLATFORM_STORAGE_KEY);
    if (storedPlatform === 'ios' || storedPlatform === 'android') {
        return storedPlatform;
    }

    // 2. User-Agent로 감지
    return detectPlatformByUserAgent();
}

/**
 * GA4 이벤트 전송 (플랫폼 정보 자동 포함)
 */
export function trackEvent(eventName: string, eventParams: Record<string, any> = {}) {
    const platform = getPlatform();

    const enhancedParams = {
        ...eventParams,
        platform, // web | ios | android
        app_source: platform === 'web' ? 'web' : 'app',
    };

    if (window.gtag) {
        window.gtag('event', eventName, enhancedParams);
    }
}

/**
 * 페이지뷰 전송 (플랫폼 정보 자동 포함)
 */
export function trackPageView(pagePath: string, pageTitle?: string) {
    const platform = getPlatform();

    if (window.gtag) {
        window.gtag('event', 'page_view', {
            page_path: pagePath,
            page_title: pageTitle || document.title,
            platform,
            app_source: platform === 'web' ? 'web' : 'app',
        });
    }
}

// 앱 진입 시 플랫폼 감지 실행
detectAndStorePlatform();

// 개발용: 콘솔에서 테스트 가능하도록 window에 노출
(window as any).getHoppangPlatform = getPlatform;
