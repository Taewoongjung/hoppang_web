export const goToQuote = () => {
    window.location.href = '/calculator/agreement';
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
    // navigator.clipboard.writeText(window.location.href)
    //     .then(() => alert('링크가 복사되었습니다'))
    //     .catch(() => alert('복사 실패'));

    if (navigator.share) {
        try {
            await navigator.share({
                title: title,
                url: window.location.href
            });
        } catch (error) {
            console.log('에러 발생');
        }
    }
};
