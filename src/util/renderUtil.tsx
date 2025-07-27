import { FloatButton } from "antd";
import React, { useState, useEffect } from "react";

interface EnhancedGoToTopButtonProps {
    onGoToList?: () => void;
    showListButton?: boolean;
}

export const EnhancedGoToTopButton: React.FC<EnhancedGoToTopButtonProps> = ({
    onGoToList,
    showListButton = true
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            // 스크롤이 300px 이상일 때만 표시
            if (window.pageYOffset > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const handleGoToList = () => {
        if (onGoToList) {
            onGoToList();
        } else {
            // 기본 동작: 게시글 목록으로 이동
            const searchParams = new URLSearchParams(window.location.search);
            if (searchParams.get('from') && searchParams.get('from') === 'myPosts') {
                window.location.href = "/question/my/boards";
            } else {
                window.location.href = "/question/boards";
            }
        }
    };

    // Safe area 계산을 위한 스타일 생성 함수
    const getSafeAreaStyles = () => {
        // CSS 환경변수를 사용하여 safe area 값 계산
        const safeAreaBottom = 'env(safe-area-inset-bottom, 0px)';
        const safeAreaRight = 'env(safe-area-inset-right, 0px)';

        return {
            // 위로 가기 버튼 스타일
            backTopButton: {
                right: `calc(24px + ${safeAreaRight})`,
                bottom: showListButton
                    ? `calc(90px + ${safeAreaBottom})`
                    : `calc(24px + ${safeAreaBottom})`,
                width: 48,
                height: 48,
                backgroundColor: '#ffffff',
                border: '1px solid #e8e8e8',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            },
            // 목록으로 가기 버튼 스타일
            listButton: {
                right: `calc(24px + ${safeAreaRight})`,
                bottom: `calc(24px + ${safeAreaBottom})`,
                width: 48,
                height: 48,
                backgroundColor: '#ffffff',
                border: '1px solid #e8e8e8',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }
        };
    };

    if (!isVisible) return null;

    const styles = getSafeAreaStyles();

    return (
        <div style={{ position: 'relative' }}>
            {/* 위로 가기 버튼 */}
            <FloatButton.BackTop
                visibilityHeight={0}
                style={styles.backTopButton}
                icon={
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        style={{ color: '#666666' }}
                    >
                        <path
                            d="M7 14L12 9L17 14"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                }
            />

            {/* 목록으로 가기 버튼 */}
            {showListButton && (
                <FloatButton
                    onClick={handleGoToList}
                    style={styles.listButton}
                    icon={
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            style={{ color: '#666666' }}
                        >
                            <path
                                d="M3 12L21 12M3 6L21 6M3 18L21 18"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    }
                    tooltip="목록으로"
                />
            )}
        </div>
    );
};

export const GoToTopButton = () => {
    return (
        <FloatButton.BackTop
            visibilityHeight={0}
        />
    );
};
