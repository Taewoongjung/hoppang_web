/**
 * 보안 관련 유틸리티 함수들
 */

/** 허용된 리다이렉트 도메인 목록 */
const ALLOWED_DOMAINS = [
    'hoppang.store',
    'www.hoppang.store',
    'localhost:3000', // 개발 환경
    '127.0.0.1:3000', // 개발 환경
];

/** 허용된 내부 경로 prefix 목록 */
const ALLOWED_PATH_PREFIXES = [
    '/admin/',
    '/v2/',
    '/calculator/',
    '/chassis/',
    '/question/',
    '/policy/',
];

/**
 * URL이 안전한지 검증 (오픈 리다이렉트 방지)
 * @param url 검증할 URL
 * @returns 안전한 URL인지 여부
 */
export const isValidRedirectUrl = (url: string): boolean => {
    if (!url || typeof url !== 'string') {
        return false;
    }

    // 빈 문자열이거나 상대 경로인 경우 검증
    if (url === '' || url.startsWith('/')) {
        // 상대 경로는 내부 경로인지 확인
        return ALLOWED_PATH_PREFIXES.some(prefix => url.startsWith(prefix)) || url === '/';
    }

    try {
        const parsedUrl = new URL(url);

        // 프로토콜 검증 (http, https만 허용)
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
            return false;
        }

        // 도메인 검증
        const isAllowedDomain = ALLOWED_DOMAINS.some(
            domain => parsedUrl.host === domain || parsedUrl.host.endsWith('.' + domain)
        );

        return isAllowedDomain;
    } catch {
        // URL 파싱 실패 시 안전하지 않음
        return false;
    }
};

/**
 * 안전한 리다이렉트 URL 반환
 * @param url 이동할 URL
 * @param fallbackUrl 검증 실패 시 이동할 기본 URL
 * @returns 검증된 안전한 URL
 */
export const getSafeRedirectUrl = (url: string, fallbackUrl: string = '/'): string => {
    if (isValidRedirectUrl(url)) {
        return url;
    }
    return fallbackUrl;
};

/**
 * 문자열에서 HTML 엔티티 이스케이프 (XSS 방지)
 * @param str 이스케이프할 문자열
 * @returns 이스케이프된 문자열
 */
export const escapeHtml = (str: string): string => {
    if (!str || typeof str !== 'string') {
        return '';
    }

    const htmlEntities: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;',
    };

    return str.replace(/[&<>"'`=/]/g, (char) => htmlEntities[char] || char);
};

/**
 * localStorage에서 안전하게 토큰 가져오기
 * @param key localStorage 키
 * @returns 토큰 값 또는 null
 */
export const getSafeToken = (key: string): string | null => {
    try {
        const token = localStorage.getItem(key);

        // null, undefined, 빈 문자열 체크
        if (!token || token === 'undefined' || token === 'null' || token.trim() === '') {
            return null;
        }

        return token;
    } catch (error) {
        console.warn('localStorage 접근 실패:', error);
        return null;
    }
};

/**
 * localStorage에 안전하게 토큰 저장
 * @param key localStorage 키
 * @param value 저장할 값
 * @returns 저장 성공 여부
 */
export const setSafeToken = (key: string, value: string): boolean => {
    try {
        if (!value || value === 'undefined' || value === 'null') {
            return false;
        }
        localStorage.setItem(key, value);
        return true;
    } catch (error) {
        console.warn('localStorage 저장 실패:', error);
        return false;
    }
};

/**
 * localStorage에서 안전하게 토큰 제거
 * @param key localStorage 키
 */
export const removeSafeToken = (key: string): void => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.warn('localStorage 제거 실패:', error);
    }
};

/**
 * OAuth 타입 검증
 */
export const isValidOAuthType = (type: string | null): type is 'KKO' | 'APL' | 'GLE' => {
    return type !== null && ['KKO', 'APL', 'GLE'].includes(type);
};

/**
 * 입력 문자열 sanitize (사용자 입력 정제)
 * @param input 정제할 입력값
 * @param maxLength 최대 길이 (기본값: 1000)
 * @returns 정제된 문자열
 */
export const sanitizeInput = (input: string, maxLength: number = 1000): string => {
    if (!input || typeof input !== 'string') {
        return '';
    }

    // 앞뒤 공백 제거
    let sanitized = input.trim();

    // 최대 길이 제한
    if (sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
    }

    // 제어 문자 제거
    sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');

    return sanitized;
};
