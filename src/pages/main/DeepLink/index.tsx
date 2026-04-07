import { useEffect, useState } from 'react';

const DEEP_LINK_CONFIG = {
    scheme: 'hoppang',
    androidPackage: 'store.hoppang.app',
    webUrl: 'https://hoppang.store',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=store.hoppang.app',
    appStoreUrl: 'https://apps.apple.com/kr/app/id6737535725',
};

const DEEP_LINK_STATISTICS_API = 'https://hoppang.store/api/statistics/pages/deeplink/user-inbound';

const DeepLink = () => {
    const [status, setStatus] = useState<'loading' | 'redirecting'>('loading');

    const getKorNow = () => {
        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
        const koreaTimeDiff = 9 * 60 * 60 * 1000;
        return new Date(utc + koreaTimeDiff);
    };

    const getBrowser = () => {
        const browsers = [
            'Chrome', 'Opera', 'WebTV', 'Whale',
            'Beonex', 'Chimera', 'NetPositive', 'Phoenix',
            'Firefox', 'Safari', 'SkipStone', 'Netscape', 'Mozilla',
        ];

        const userAgent = window.navigator.userAgent.toLowerCase();

        if (userAgent.includes("edg")) {
            return "Edge";
        }

        if (userAgent.includes("trident") || userAgent.includes("msie")) {
            return "Internet Explorer";
        }

        return browsers.find((browser) => userAgent.includes(browser.toLowerCase())) || 'Unknown';
    };

    const formatDateTime = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    // 페이지 진입 시 바로 통계 전송
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const targetPath = urlParams.get('path') || '';
        const browser = getBrowser();
        const formattedVisitedAt = formatDateTime(getKorNow());

        const userAgent = navigator.userAgent.toLowerCase();
        const isIOS = /iphone|ipad|ipod/.test(userAgent);
        const isAndroid = /android/.test(userAgent);
        const deviceType = isAndroid ? 'android' : isIOS ? 'ios' : 'pc';

        const data = {
            referrer: targetPath,
            browser,
            deviceType,
            stayDuration: 0,
            visitedAt: formattedVisitedAt
        };

        fetch(DEEP_LINK_STATISTICS_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data),
            keepalive: true
        }).catch(() => {});
    }, []);

    useEffect(() => {
        const userAgent = navigator.userAgent.toLowerCase();
        const isIOS = /iphone|ipad|ipod/.test(userAgent);
        const isAndroid = /android/.test(userAgent);
        const isMobile = isIOS || isAndroid;

        const urlParams = new URLSearchParams(window.location.search);
        const targetPath = urlParams.get('path') || '';
        const deepLinkUrl = `${DEEP_LINK_CONFIG.scheme}://${targetPath}`;

        // PC인 경우 웹으로 리다이렉트
        if (!isMobile) {
            const webUrl = targetPath
                ? `${DEEP_LINK_CONFIG.webUrl}${targetPath}`
                : DEEP_LINK_CONFIG.webUrl;
            window.location.href = webUrl;
            return;
        }

        setStatus('redirecting');

        if (isAndroid) {
            // Android: Intent 방식 사용
            const intentUrl = `intent://${targetPath}#Intent;scheme=${DEEP_LINK_CONFIG.scheme};package=${DEEP_LINK_CONFIG.androidPackage};S.browser_fallback_url=${encodeURIComponent(DEEP_LINK_CONFIG.playStoreUrl)};end`;
            window.location.href = intentUrl;
        }

        if (isIOS) {
            // iOS: Custom scheme 시도
            let fallbackTimer: ReturnType<typeof setTimeout>;

            const handleVisibilityChange = () => {
                if (!document.hidden) {
                    clearTimeout(fallbackTimer);
                }
            };

            const handlePageHide = () => {
                clearTimeout(fallbackTimer);
            };

            // App Store fallback
            fallbackTimer = setTimeout(() => {
                window.location.href = DEEP_LINK_CONFIG.appStoreUrl;
            }, 2000);

            // Custom scheme 시도
            window.location.href = deepLinkUrl;

            // 앱이 열리면 fallback 취소
            document.addEventListener('visibilitychange', handleVisibilityChange);
            window.addEventListener('pagehide', handlePageHide);

            return () => {
                document.removeEventListener('visibilitychange', handleVisibilityChange);
                window.removeEventListener('pagehide', handlePageHide);
                clearTimeout(fallbackTimer);
            };
        }
    }, []);

    return (
        <div style={styles.container}>
            <div style={styles.content}>
                <img
                    src="https://hoppang-public-assets.s3.ap-southeast-2.amazonaws.com/hoppang-character.png"
                    alt="호빵"
                    style={styles.logo}
                />
                <h1 style={styles.title}>호빵</h1>
                <p style={styles.message}>
                    {status === 'loading'
                        ? '앱으로 이동 중...'
                        : '앱이 설치되어 있지 않으면 스토어로 이동합니다'}
                </p>
                <div style={styles.spinner} />
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#ffffff',
        padding: '20px',
    },
    content: {
        textAlign: 'center',
        color: '#333333',
    },
    logo: {
        width: '100px',
        height: '100px',
        marginBottom: '16px',
    },
    title: {
        fontSize: '32px',
        fontWeight: 'bold',
        marginBottom: '16px',
        margin: 0,
    },
    message: {
        fontSize: '16px',
        opacity: 0.8,
        marginBottom: '24px',
        lineHeight: 1.5,
    },
    spinner: {
        width: '40px',
        height: '40px',
        border: '3px solid rgba(0, 0, 0, 0.1)',
        borderTop: '3px solid #FF6B35',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        margin: '0 auto',
    },
};

// CSS 애니메이션 주입
const styleSheet = document.createElement('style');
styleSheet.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(styleSheet);

export default DeepLink;
