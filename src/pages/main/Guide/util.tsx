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

export const shareToKakao = (title: string, description?: string, imageUrl?: string) => {
    const currentUrl = window.location.href;
    const path = currentUrl.replace('https://hoppang.store', '');

    if (typeof window.Kakao !== 'undefined' && window.Kakao.Share) {
        window.Kakao.Share.sendDefault({
            objectType: 'feed',
            content: {
                title: title,
                description: description || '호빵에서 확인해보세요.',
                imageUrl: imageUrl || 'https://hoppang-public-assets.s3.ap-southeast-2.amazonaws.com/hoppang-character.png',
                link: {
                    mobileWebUrl: currentUrl,
                    webUrl: currentUrl,
                    androidExecutionParams: path,
                    iosExecutionParams: path,
                },
            },
            buttons: [
                {
                    title: '앱에서 보기',
                    link: {
                        mobileWebUrl: currentUrl,
                        webUrl: currentUrl,
                        androidExecutionParams: path,
                        iosExecutionParams: path,
                    },
                },
            ],
        });
        return true;
    }
    return false;
};

export const handleShare = async (title: string, description?: string, imageUrl?: string) => {
    const currentUrl = window.location.href;

    // 카카오톡 공유 시도
    if (shareToKakao(title, description, imageUrl)) {
        return;
    }

    // Web Share API 사용 (지원하는 경우)
    if (navigator.share) {
        try {
            await navigator.share({
                title: title,
                url: currentUrl
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
        await navigator.clipboard.writeText(currentUrl);
        alert('링크가 복사되었습니다.');
    } catch {
        // 구형 브라우저 폴백
        const textarea = document.createElement('textarea');
        textarea.value = currentUrl;
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
