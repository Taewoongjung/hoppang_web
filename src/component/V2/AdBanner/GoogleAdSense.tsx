import React, { useEffect, useRef } from 'react';
import './styles.css';

interface GoogleAdSenseProps {
    adSlot: string;
    adFormat?: string;
    fullWidthResponsive?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Google AdSense 배너 컴포넌트
 *
 * 사용법:
 * 1. Google AdSense 계정에서 광고 단위(ad-slot)를 생성하세요
 * 2. data-ad-client 속성에 본인의 AdSense 클라이언트 ID를 입력하세요 (예: ca-pub-xxxxxxxxxxxxxxxx)
 * 3. 사용할 때 adSlot prop에 광고 단위 ID를 전달하세요
 *
 * 참고: 실제 광고가 표시되려면 도메인이 AdSense에 승인되어야 함
 */
const GoogleAdSense: React.FC<GoogleAdSenseProps> = ({
    adSlot,
    adFormat = 'auto',
    fullWidthResponsive = true,
    className = '',
    style
}) => {
    const adContainerRef = useRef<HTMLModElement>(null);

    useEffect(() => {
        // AdSense 스크립트가 이미 로드되었는지 확인
        const existingScript = document.querySelector('script[src*="pagead2.googlesyndication.com"]');

        if (!existingScript) {
            // Adense 스크립트 동적 로드
            const script = document.createElement('script');
            script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3635160426496438';
            script.async = true;
            script.crossOrigin = 'anonymous';

            script.onerror = () => {
                console.error('AdSense 스크립트 로드 실패');
            };

            document.head.appendChild(script);
        }

        // 광고 푸시 (이미 로드된 경우)
        try {
            if (window.adsbygoogle) {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (error) {
            console.error('AdSense 광고 로드 중 오류:', error);
        }
    }, [adSlot]);

    return (
        <div className={`google-adSense-container ${className}`} style={style}>
            <ins
                ref={adContainerRef}
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-3635160426496438"
                data-ad-slot={adSlot}
                data-ad-format={adFormat}
                data-full-width-responsive={fullWidthResponsive.toString()}
            />
        </div>
    );
};

export default GoogleAdSense;
