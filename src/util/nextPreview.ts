const NEXT_PREVIEW_COOKIE_NAME = 'hoppang_next_preview';
const NEXT_PREVIEW_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;
const NEXT_PREVIEW_TESTER_USER_IDS = new Set(['1208', '1221']);

const getPreviewCookieAttributes = (): string => {
    const attributes = [
        'Path=/',
        `Max-Age=${NEXT_PREVIEW_COOKIE_MAX_AGE_SECONDS}`,
        'SameSite=Lax',
    ];

    if (window.location.protocol === 'https:') {
        attributes.push('Secure');
    }

    if (window.location.hostname === 'hoppang.store' || window.location.hostname.endsWith('.hoppang.store')) {
        attributes.push('Domain=.hoppang.store');
    }

    return attributes.join('; ');
};

export const isNextPreviewTester = (userId?: string | number | null): boolean => {
    if (userId === undefined || userId === null) return false;
    return NEXT_PREVIEW_TESTER_USER_IDS.has(String(userId));
};

export const enableNextPreview = (): void => {
    document.cookie = `${NEXT_PREVIEW_COOKIE_NAME}=1; ${getPreviewCookieAttributes()}`;
    window.location.assign(`${window.location.pathname}${window.location.search}${window.location.hash}`);
};
