export const goToQuote = () => {
    window.location.href = '/calculator';
}

export const goToCommunity = () => {
    window.location.href = '/question/boards';
}

export const kakaoInquiry = () => {
    const kakaoWebLink = 'https://pf.kakao.com/_dbxezn/chat';
    const kakaoAppLink = 'kakaotalk://plusfriend/chat/_dbxezn';
    const userAgent = navigator.userAgent.toLowerCase();

    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
        setTimeout(() => {
            window.location.href = kakaoWebLink;
        }, 500);
        window.location.href = kakaoAppLink;
    } else {
        window.open(kakaoWebLink, '_blank');
    }
}

export const handleShare = async (title: string) => {
    const userAgent = navigator.userAgent.toLowerCase();
    const currentUrl = window.location.href;

    // 스토어 URL
    const APP_STORE_URL = 'https://apps.apple.com/kr/app/id6741290731';
    const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=store.hoppang.app';

    let shareUrl: string;
    let shareTitle: string;

    // 디바이스별 URL 결정
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
        // iOS: 앱스토어
        shareUrl = APP_STORE_URL;
        shareTitle = '호빵 - 샷시 견적 앱';
    } else if (userAgent.includes('android')) {
        // Android: 플레이스토어
        shareUrl = PLAY_STORE_URL;
        shareTitle = '호빵 - 샷시 견적 앱';
    } else {
        // 데스크톱: 현재 URL
        shareUrl = currentUrl;
        shareTitle = title;
    }

    // Web Share API 사용 (지원하는 경우)
    if (navigator.share) {
        try {
            await navigator.share({
                title: shareTitle,
                url: shareUrl
            });
            return;
        } catch (error) {
            // 사용자 취소는 무시
            if ((error as Error).name !== 'AbortError') {
                console.log('공유 에러:', error);
            }
            return;
        }
    }

    // 폴백: 클립보드에 복사
    try {
        await navigator.clipboard.writeText(shareUrl);
        alert('링크가 복사되었습니다.');
    } catch {
        // 구형 브라우저 폴백
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        textarea.setSelectionRange(0, 9999);
        document.execCommand('copy');
        document.body.removeChild(textarea);
        alert('링크가 복사되었습니다.');
    }
};
