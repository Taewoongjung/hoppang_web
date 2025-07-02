import React, { useState, useEffect, useCallback, useRef } from 'react';

import './styles.css';
import '../versatile-styles.css';

import BottomNavigator from "../../../component/V2/BottomNavigator";
import useSWR from "swr";
import {callMeData} from "../../../definition/apiPath";
import fetcher from "../../../util/fetcher";
import {useHistory} from "react-router-dom";

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
        // 모바일 웹앱 뒤로가기 완전 차단
        const preventBackNavigation = () => {
            // 현재 URL을 히스토리에 계속 푸시하여 뒤로가기 무력화
            window.history.pushState(null, '', window.location.href);
        };

        // 페이지 로드 시 히스토리 스택에 더미 엔트리 추가
        preventBackNavigation();

        // popstate 이벤트 리스너 (모든 기기의 뒤로가기)
        const handlePopState = (event: PopStateEvent) => {
            // 이벤트 전파 중단
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            // 즉시 현재 페이지로 다시 이동
            preventBackNavigation();

            // 추가 안전장치: 짧은 지연 후 다시 푸시
            setTimeout(() => {
                preventBackNavigation();
            }, 0);

            return false;
        };

        // 이벤트 리스너 등록 (캡처 및 버블링 단계 모두)
        window.addEventListener('popstate', handlePopState, true); // 캡처 단계
        window.addEventListener('popstate', handlePopState, false); // 버블링 단계

        // React Router의 history 차단
        const unblock = history.block((location: any, action: string) => {
            if (action === 'POP') {
                // POP 액션(뒤로가기/앞으로가기) 완전 차단
                preventBackNavigation();
                return false;
            }
            return true;
        });

        // 키보드 단축키 차단
        const handleKeyDown = (event: KeyboardEvent) => {
            // Alt + ← (Alt + Left Arrow)
            if (event.altKey && (event.key === 'ArrowLeft' || event.keyCode === 37)) {
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
            // Alt + → (Alt + Right Arrow)
            if (event.altKey && (event.key === 'ArrowRight' || event.keyCode === 39)) {
                event.preventDefault();
                event.stopPropagation();
                return false;
            }
            // Backspace (input이나 textarea가 아닌 경우)
            if (event.key === 'Backspace' || event.keyCode === 8) {
                const target = event.target as HTMLElement;
                if (target.tagName !== 'INPUT' &&
                    target.tagName !== 'TEXTAREA' &&
                    !target.isContentEditable) {
                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                }
            }
        };

        // 키보드 이벤트 리스너 등록
        document.addEventListener('keydown', handleKeyDown, true);
        document.addEventListener('keyup', handleKeyDown, true);

        // Android 백 버튼 차단 (Cordova/PhoneGap 환경)
        const handleDeviceBackButton = (event: Event) => {
            event.preventDefault();
            preventBackNavigation();
            return false;
        };

        // Cordova 환경 체크 (타입 안전하게)
        const isCordovaApp = typeof window !== 'undefined' &&
            (window.device !== undefined || window.cordova !== undefined);

        if (isCordovaApp) {
            document.addEventListener('backbutton', handleDeviceBackButton, false);
        }

        // 페이지 가시성 변경 시에도 히스토리 보호
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                preventBackNavigation();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // beforeunload 이벤트로 추가 보호
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            preventBackNavigation();
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        // hashchange 이벤트 차단
        const handleHashChange = (event: HashChangeEvent) => {
            event.preventDefault();
            preventBackNavigation();
            return false;
        };

        window.addEventListener('hashchange', handleHashChange);

        // 주기적으로 히스토리 상태 확인 및 보호
        const historyProtectionInterval = setInterval(() => {
            preventBackNavigation();
        }, 100);

        // 클린업 함수
        return () => {
            window.removeEventListener('popstate', handlePopState, true);
            window.removeEventListener('popstate', handlePopState, false);
            document.removeEventListener('keydown', handleKeyDown, true);
            document.removeEventListener('keyup', handleKeyDown, true);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('hashchange', handleHashChange);

            // Cordova 환경 체크 후 이벤트 제거
            const isCordovaApp = typeof window !== 'undefined' &&
                (window.device !== undefined || window.cordova !== undefined);

            if (isCordovaApp) {
                document.removeEventListener('backbutton', handleDeviceBackButton, false);
            }

            clearInterval(historyProtectionInterval);
            unblock();
        };
    }, [history]);

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
            window.location.href = '/calculator/agreement';
        } else if (serviceTitle === '샷시 지식인') {
            // 샷시 지식인 로직 추가
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
                                    // 전문가 질문 로직 추가
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
                        <button className="see-all-btn">
                            <span>전체보기</span>
                            <span className="see-all-arrow">→</span>
                        </button>
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
                        <button
                            className="footer-link"
                            onClick={() => window.open("https://pf.kakao.com/_dbxezn", "_blank")}
                        >
                            <span>비즈니스 문의</span>
                        </button>
                        <button
                            className="footer-link"
                            onClick={() => {
                                // 고객센터 로직 추가
                            }}
                        >
                            <span>고객센터</span>
                        </button>
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
