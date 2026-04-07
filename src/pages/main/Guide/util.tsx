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
    const currentPath = window.location.pathname;
    const baseUrl = 'https://hoppang.store';
    // 딥링크 페이지를 통해서 공유
    const shareUrl = `${baseUrl}/open?path=${encodeURIComponent(currentPath)}`;

    // Web Share API 사용 (지원하는 경우)
    if (navigator.share) {
        try {
            await navigator.share({
                title: title,
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
