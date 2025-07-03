import React, { useState, useEffect, useCallback, useRef } from 'react';

import './styles.css';
import '../versatile-styles.css';

import BottomNavigator from "../../../component/V2/BottomNavigator";
import useSWR from "swr";
import {callMeData} from "../../../definition/apiPath";
import fetcher from "../../../util/fetcher";
import {useHistory} from "react-router-dom";
import Hammer from 'hammerjs';

// Cordova 타입 정의
declare global {
    interface Window {
        device?: any;
        cordova?: any;
    }
}

const Initial = () => {
    const history = useHistory();

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        // 기존 코드는 유지하고 추가
        // 더 강력한 터치 이벤트 차단
        let startX = 0;
        let startY = 0;
        let startTime = 0;
        let isSwipeBlocked = false;

        const handleTouchStart = (e: TouchEvent) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = Date.now();
            isSwipeBlocked = false;
        };

        const handleTouchMove = (e: TouchEvent) => {
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const deltaX = currentX - startX;
            const deltaY = currentY - startY;
            const absDeltaX = Math.abs(deltaX);
            const absDeltaY = Math.abs(deltaY);

            // 수평 스와이프 감지 (뒤로가기 제스처)
            if (absDeltaX > absDeltaY && absDeltaX > 10) {
                isSwipeBlocked = true;
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                // 히스토리 보호
                window.history.pushState(null, '', window.location.href);
            }
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (isSwipeBlocked) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();

                // 강제로 현재 페이지 유지
                window.history.pushState(null, '', window.location.href);
            }
        };

        // 이벤트 리스너 등록 (passive: false로 설정하여 preventDefault 가능하게)
        document.addEventListener('touchstart', handleTouchStart, { passive: false, capture: true });
        document.addEventListener('touchmove', handleTouchMove, { passive: false, capture: true });
        document.addEventListener('touchend', handleTouchEnd, { passive: false, capture: true });

        // 추가: 마우스 이벤트도 차단 (데스크톱에서 테스트용)
        let mouseStartX = 0;
        const handleMouseDown = (e: MouseEvent) => {
            mouseStartX = e.clientX;
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (e.buttons === 1) { // 마우스 버튼이 눌린 상태
                const deltaX = Math.abs(e.clientX - mouseStartX);
                if (deltaX > 50) {
                    e.preventDefault();
                    e.stopPropagation();
                    window.history.pushState(null, '', window.location.href);
                }
            }
        };

        document.addEventListener('mousedown', handleMouseDown, { passive: false, capture: true });
        document.addEventListener('mousemove', handleMouseMove, { passive: false, capture: true });

        return () => {
            document.removeEventListener('touchstart', handleTouchStart, { capture: true });
            document.removeEventListener('touchmove', handleTouchMove, { capture: true });
            document.removeEventListener('touchend', handleTouchEnd, { capture: true });
            document.removeEventListener('mousedown', handleMouseDown, { capture: true });
            document.removeEventListener('mousemove', handleMouseMove, { capture: true });
        };
    }, []);

    useEffect(() => {
        // 위의 터치 이벤트 코드 + 아래 추가

        // CSS로 터치 액션 차단
        const style = document.createElement('style');
        style.textContent = `
        * {
            touch-action: pan-y !important;
            -webkit-touch-callout: none !important;
            -webkit-user-select: none !important;
            -khtml-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            user-select: none !important;
        }
        
        body {
            overscroll-behavior-x: none !important;
            overscroll-behavior-y: auto !important;
        }
    `;
        document.head.appendChild(style);

        // 더 공격적인 히스토리 보호
        const createHistoryBarrier = () => {
            for (let i = 0; i < 50; i++) {
                window.history.pushState(
                    { preventBack: true, index: i, timestamp: Date.now() },
                    '',
                    window.location.href
                );
            }
        };

        createHistoryBarrier();

        // 주기적으로 히스토리 보호 (더 자주)
        const historyInterval = setInterval(() => {
            createHistoryBarrier();
        }, 50);

        return () => {
            // 기존 cleanup + 추가
            document.head.removeChild(style);
            clearInterval(historyInterval);
        };
    }, []);

    const { data: userData, error, mutate } = useSWR(callMeData, fetcher, {
        dedupingInterval: 2000
    });

    const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
    const [isFooterVisible, setIsFooterVisible] = useState(false);
    const [lastScrollY, setLastScrollY] = useState(0);

    // 디바운싱을 위한 타이머 ref
    const scrollTimer = useRef<NodeJS.Timeout | null>(null);
    const ticking = useRef(false);

    // 개선된 스크롤 이벤트 핸들러
    const handleScroll = useCallback(() => {
        if (!ticking.current) {
            requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;
                const documentHeight = document.documentElement.scrollHeight;
                const windowHeight = window.innerHeight;
                const scrollableHeight = documentHeight - windowHeight;
                const scrollPercent = scrollableHeight > 0 ? (currentScrollY / scrollableHeight) * 100 : 0;

                // 스크롤 임계값 설정
                const scrollThreshold = 150; // 150px 이상 스크롤하면 숨김
                const showThreshold = 50; // 50px 이상 위로 스크롤하면 다시 표시
                const footerThreshold = 70; // 스크롤 70% 지점에서 Footer 표시
                const bottomThreshold = 95; // 95% 이상에서는 무조건 Footer 표시

                // 스크롤 방향 및 속도 감지
                const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
                const scrollDelta = Math.abs(currentScrollY - lastScrollY);

                // Footer 표시 로직
                if (scrollPercent >= bottomThreshold ||
                    (scrollPercent >= footerThreshold && currentScrollY > scrollableHeight - 200)) {
                    setIsFooterVisible(true);
                    setIsBottomNavVisible(false);
                }
                // 페이지 상단 근처에서는 Footer 숨김, BottomNav 표시
                else if (currentScrollY < 100) {
                    setIsFooterVisible(false);
                    setIsBottomNavVisible(true);
                }
                // 중간 영역에서의 BottomNav 표시/숨김 로직
                else {
                    setIsFooterVisible(false);

                    // 아래로 빠르게 스크롤할 때
                    if (scrollDirection === 'down' &&
                        currentScrollY > scrollThreshold &&
                        scrollDelta > 5) {
                        setIsBottomNavVisible(false);
                    }
                    // 위로 스크롤할 때
                    else if (scrollDirection === 'up' && scrollDelta > showThreshold) {
                        setIsBottomNavVisible(true);
                    }
                }

                setLastScrollY(currentScrollY);
                ticking.current = false;
            });
            ticking.current = true;
        }
    }, [lastScrollY]);

    // 디바운스된 스크롤 이벤트 등록
    useEffect(() => {
        const debouncedHandleScroll = () => {
            if (scrollTimer.current) {
                clearTimeout(scrollTimer.current);
            }

            scrollTimer.current = setTimeout(handleScroll, 10);
        };

        window.addEventListener('scroll', debouncedHandleScroll, {
            passive: true,
            capture: false
        });

        // 초기 상태 설정
        handleScroll();

        return () => {
            window.removeEventListener('scroll', debouncedHandleScroll);
            if (scrollTimer.current) {
                clearTimeout(scrollTimer.current);
            }
        };
    }, [handleScroll]);

    const services = [
        {
            id: 1,
            icon: '🏠',
            title: '샷시 견적',
            description: '맞춤형 견적을 받아보세요',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            highlight: false
        },
        {
            id: 2,
            icon: '🪟',
            title: '샷시 지식인',
            description: '궁금한 것을 물어보세요',
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            highlight: true
        },
    ];

    const handleServiceClick = (serviceTitle: string) => {
        if (serviceTitle === '샷시 견적') {
            history.push('/calculator/agreement');
        } else if (serviceTitle === '샷시 지식인') {
            history.push('/question/board');
        }
    };

    const recentQuestions = [
        { id: 1, question: '이중창 설치 비용이 궁금해요', category: '설치', time: '2시간 전' },
        { id: 2, question: '샷시 교체 시기는 언제인가요?', category: '교체', time: '4시간 전' },
        { id: 3, question: '결로 현상 해결 방법', category: '수리', time: '6시간 전' },
    ];

    const quickTips = [
        { title: '창호 교체 시기', content: '10-15년마다 교체하는 것이 좋습니다', icon: '📅' },
        { title: '단열 효과', content: '이중창으로 난방비를 30% 절약하세요', icon: '🔥' },
        { title: '방음 효과', content: '소음을 50% 이상 차단할 수 있습니다', icon: '🔇' }
    ];

    return (
        <div className="app-container">
            {/* Header */}
            <header className="app-header">
                <div className="header-content">
                    <div className="logo-container">
                        <img src="/assets/hoppang-character.png" alt="Hoppang Logo" className="logo-img" />
                        <span className="logo-text">호빵</span>
                    </div>
                    <div className="header-greeting">
                        {userData ? (
                            <span className="user-greeting">안녕하세요, <strong>{userData.name}</strong>님! 👋🏻</span>
                        ) : (
                            <button
                                className="login-btn"
                                onClick={() => window.location.href = '/v2/login'}
                            >
                                로그인
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="main-content">
                {/* Hero Section */}
                <section className="hero-section">
                    <div className="hero-content">
                        <div className="hero-text">
                            <h2 className="hero-title">샷시 전문가와 함께하세요</h2>
                            <p className="hero-subtitle">견적부터 설치까지, 모든 과정을 도와드립니다</p>
                            <button
                                className="cta-button"
                                onClick={() => {
                                    history.push("/question/register");
                                }}
                            >
                                <span className="cta-icon">💬&nbsp;</span>
                                전문가에게 질문하기
                            </button>
                        </div>
                        <div className="hero-illustration">
                            <div className="window-icon">🪟</div>
                            <div className="floating-elements">
                                <span className="float-element" style={{animationDelay: '0s'}}>✨</span>
                                <span className="float-element" style={{animationDelay: '1s'}}>🏠</span>
                                <span className="float-element" style={{animationDelay: '2s'}}>💡</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Services Grid */}
                <section className="services-section">
                    <div className="section-header">
                        <h3 className="section-title">
                            서비스
                        </h3>
                    </div>
                    <div className="services-grid">
                        {services.map((service) => (
                            <div
                                key={service.id}
                                className={`service-card ${service.highlight ? 'highlight' : ''}`}
                                style={{ background: service.gradient }}
                                onClick={() => handleServiceClick(service.title)}
                            >
                                <div className="service-content">
                                    <div className="service-icon">{service.icon}</div>
                                    <h4 className="service-title">{service.title}</h4>
                                    <p className="service-description">{service.description}</p>
                                    {service.highlight && <div className="highlight-badge">NEW</div>}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Quick Tips Section */}
                <section className="tips-section">
                    <div className="section-header">
                        <h3 className="section-title">
                            <span className="title-icon">💡</span>
                            알아두면 좋은 팁
                        </h3>
                    </div>
                    <div className="tips-grid">
                        {quickTips.map((tip, index) => (
                            <div key={index} className="tip-card">
                                <div className="tip-icon">{tip.icon}</div>
                                <h4 className="tip-title">{tip.title}</h4>
                                <p className="tip-content">{tip.content}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Recent Questions */}
                <section className="questions-section">
                    <div className="section-header">
                        <h3 className="section-title">
                            <span className="title-icon">❓</span>
                            최근 질문
                        </h3>
                        <div className="see-all-btn">
                            <span>전체보기</span>
                        </div>
                    </div>
                    <div className="questions-list">
                        {recentQuestions.map((q) => (
                            <div key={q.id} className="question-item">
                                <div className="question-content">
                                    <div className="question-meta">
                                        <span className="question-category">{q.category}</span>
                                        <span className="question-time">{q.time}</span>
                                    </div>
                                    <p className="question-text">{q.question}</p>
                                </div>
                                <button className="question-arrow">→</button>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Footer - 조건부 표시 */}
            <footer>
                <div className="footer-content">
                    <div className="footer-logo-section">
                        <div className="footer-logo">
                            <img src="/assets/hoppang-character.png" alt="Hoppang" className="footer-logo-img" />
                            <span className="footer-logo-text">호빵</span>
                        </div>
                        <p className="footer-tagline">신뢰할 수 있는 샷시 전문 플랫폼</p>
                    </div>

                    <div className="footer-links">
                        <div
                            className="footer-link"
                            onClick={() => window.open("https://pf.kakao.com/_dbxezn", "_blank")}
                        >
                            <span>비즈니스 문의</span>
                        </div>
                        <div
                            className="footer-link"
                            onClick={() => {
                                history.push("/v2/counsel");
                            }}
                        >
                            <span>고객센터</span>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p className="footer-copyright">© 2024 호빵. All rights reserved.</p>
                        <div className="footer-meta">
                            <span onClick={() => {/* 개인정보처리방침 로직 */}}>개인정보처리방침</span>
                            <span className="footer-separator">|</span>
                            <span onClick={() => {/* 이용약관 로직 */}}>이용약관</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Bottom Navigation - 조건부 렌더링 */}
            <BottomNavigator
                userData={userData}
                isVisible={isBottomNavVisible}
            />
        </div>
    );
};

export default Initial;
