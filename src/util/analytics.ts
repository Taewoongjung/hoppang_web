// GA4 Analytics Utility with Platform Detection

type Platform = 'web' | 'ios' | 'android';

const PLATFORM_STORAGE_KEY = 'hoppang-platform';

/**
 * User-Agent 기반 플랫폼 감지
 * - iOS 디바이스 (iPhone, iPad, iPod) → ios
 * - Android 디바이스 → android
 * - 그 외 → web
 */
function detectPlatformByUserAgent(): Platform {
    const userAgent = navigator.userAgent;

    // iOS 디바이스 체크 (iPadOS 13+ 데스크탑 모드 대응)
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (isIOS) {
        return 'ios';
    }

    // Android 디바이스 체크
    if (/Android/i.test(userAgent)) {
        return 'android';
    }

    return 'web';
}

/**
 * URL source 파라미터에서 플랫폼 추출
 */
function getPlatformFromUrl(): Platform | null {
    const urlParams = new URLSearchParams(window.location.search);
    const sourceParam = urlParams.get('source');

    if (sourceParam === 'ios' || sourceParam === 'android') {
        return sourceParam;
    }

    return null;
}

/**
 * 현재 플랫폼 반환 (저장하지 않음)
 * 우선순위: URL 파라미터 > localStorage > User-Agent
 */
export function getPlatform(): Platform {
    // 1. URL 파라미터 확인
    const urlPlatform = getPlatformFromUrl();
    if (urlPlatform) {
        return urlPlatform;
    }

    // 2. localStorage 확인
    const storedPlatform = localStorage.getItem(PLATFORM_STORAGE_KEY);
    if (storedPlatform === 'ios' || storedPlatform === 'android') {
        return storedPlatform;
    }

    // 3. User-Agent 감지
    return detectPlatformByUserAgent();
}

/**
 * 플랫폼 감지 후 localStorage에 저장
 * 앱 진입 시 1회 호출 권장
 * 우선순위: URL 파라미터 > localStorage > User-Agent
 */
export function detectAndStorePlatform(): Platform {
    const platform = getPlatform();

    // web이 아닐 때만 저장 (앱에서 온 경우)
    if (platform !== 'web') {
        localStorage.setItem(PLATFORM_STORAGE_KEY, platform);
    }

    return platform;
}

/**
 * GA4 이벤트 전송 (플랫폼 정보 자동 포함)
 */
export function trackEvent(eventName: string, eventParams: Record<string, any> = {}) {
    const platform = getPlatform();

    const enhancedParams = {
        ...eventParams,
        platform,
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
