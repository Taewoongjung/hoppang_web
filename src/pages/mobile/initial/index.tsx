import React, { useState, useEffect } from 'react';

import './styles.css';
import '../versatile-styles.css';

import BottomNavigator from "../../../component/V2/BottomNavigator";
import useSWR from "swr";
import {callMeData} from "../../../definition/apiPath";
import fetcher from "../../../util/fetcher";

const Initial = () => {

    const { data: userData, error, mutate } = useSWR(callMeData, fetcher, {
        dedupingInterval: 2000
    });

    const [isExpertChatOpen, setIsExpertChatOpen] = useState(false);
    const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isScrolling, setIsScrolling] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // 초기화 useEffect - 스크롤 문제 해결
    useEffect(() => {
        // DOM이 완전히 로드된 후 초기화
        const initializeScroll = () => {
            // 스크롤 위치 초기화
            const currentScroll = window.scrollY;
            setLastScrollY(currentScroll);

            // body 스크롤 설정 확인 및 수정
            document.body.style.overflow = 'auto';
            document.body.style.setProperty('overscroll-behavior', 'contain');
            document.documentElement.style.overflow = 'auto';

            // iOS Safari 스크롤 문제 해결
            document.body.style.setProperty('webkitOverflowScrolling', 'touch');
            document.body.style.touchAction = 'pan-y';

            // 초기화 완료
            setIsInitialized(true);
        };

        // DOM 로드 대기
        if (document.readyState === 'complete') {
            initializeScroll();
        } else {
            const handleLoad = () => {
                setTimeout(initializeScroll, 100);
            };
            window.addEventListener('load', handleLoad);
            document.addEventListener('DOMContentLoaded', handleLoad);

            return () => {
                window.removeEventListener('load', handleLoad);
                document.removeEventListener('DOMContentLoaded', handleLoad);
            };
        }
    }, []);

    // 스크롤 이벤트 핸들러 - 완전히 개선된 버전
    useEffect(() => {
        // 초기화되지 않았으면 스크롤 리스너 등록하지 않음
        if (!isInitialized) return;

        let ticking = false;
        let scrollEndTimer: NodeJS.Timeout | null = null;

        const handleScroll = () => {
            // 스크롤 상태 시작
            setIsScrolling(true);
            if (scrollEndTimer) {
                clearTimeout(scrollEndTimer);
            }

            // requestAnimationFrame으로 성능 최적화
            if (!ticking) {
                requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY;
                    const documentHeight = document.documentElement.scrollHeight;
                    const windowHeight = window.innerHeight;
                    const maxScroll = Math.max(documentHeight - windowHeight, 1);
                    const scrollPercent = Math.min((currentScrollY / maxScroll) * 100, 100);

                    // 스크롤 방향과 거리 계산
                    const scrollDiff = currentScrollY - lastScrollY;
                    const isScrollingDown = scrollDiff > 0;
                    const isScrollingUp = scrollDiff < 0;
                    const scrollDistance = Math.abs(scrollDiff);

                    // 임계값 설정 (더 관대하게)
                    const minScrollDistance = 8; // 최소 스크롤 거리
                    const hideThreshold = 120; // 숨김 임계값
                    const showThreshold = 25; // 표시 임계값
                    const footerThreshold = 80; // Footer 표시 임계값

                    // 조건 단순화 및 명확화
                    if (scrollPercent > footerThreshold) {
                        // 하단 80% 이상에서는 Footer 표시
                        setIsBottomNavVisible(false);
                    } else if (currentScrollY < 30) {
                        // 최상단 30px 이내에서는 항상 BottomNav 표시
                        setIsBottomNavVisible(true);
                    } else if (isScrollingDown && scrollDistance > minScrollDistance && currentScrollY > hideThreshold) {
                        // 아래로 스크롤: 충분한 거리 + 임계값 초과
                        setIsBottomNavVisible(false);
                    } else if (isScrollingUp && scrollDistance > showThreshold) {
                        // 위로 스크롤: 충분한 거리
                        setIsBottomNavVisible(true);
                    }

                    setLastScrollY(currentScrollY);
                    ticking = false;
                });
                ticking = true;
            }

            // 스크롤 종료 감지 (150ms 후)
            scrollEndTimer = setTimeout(() => {
                setIsScrolling(false);
            }, 150);
        };

        // 패시브 리스너로 성능 최적화
        window.addEventListener('scroll', handleScroll, {
            passive: true,
            capture: false
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (scrollEndTimer) {
                clearTimeout(scrollEndTimer);
            }
        };
    }, [lastScrollY, isInitialized]);

    // 스크롤 상태에 따른 body 클래스 관리
    useEffect(() => {
        if (isScrolling) {
            document.body.classList.add('scrolling');
        } else {
            document.body.classList.remove('scrolling');
        }

        return () => {
            document.body.classList.remove('scrolling');
        };
    }, [isScrolling]);

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
            setIsExpertChatOpen(true);
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
        <div className="app-container" data-scroll-initialized={isInitialized}>
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
                                onClick={() => setIsExpertChatOpen(true)}
                            >
                                <span className="cta-icon">💬</span>
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
                        <button className="see-all-btn" style={{alignContent: 'right', alignItems: 'right'}}>전체보기</button>
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

            {/* Footer - BottomNav가 숨겨졌을 때만 표시 */}
            <footer className={`page-footer ${!isBottomNavVisible ? 'show' : 'hide'}`}>
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
                            비즈니스 문의
                        </button>
                        <span className="footer-separator">|</span>
                        <button
                            className="footer-link"
                            onClick={() => setIsExpertChatOpen(true)}
                        >
                            고객센터
                        </button>
                    </div>

                    <div className="footer-bottom">
                        <p className="footer-copyright">© 2024 호빵. All rights reserved.</p>
                        <div className="footer-meta">
                            <span>개인정보처리방침</span>
                            <span className="footer-separator">|</span>
                            <span>이용약관</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Expert Chat Modal */}
            {isExpertChatOpen && (
                <div className="expert-modal-overlay" onClick={() => setIsExpertChatOpen(false)}>
                    <div className="expert-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>샷시 전문가와 상담</h3>
                            <button
                                className="modal-close-btn"
                                onClick={() => setIsExpertChatOpen(false)}
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-content">
                            <div className="expert-intro">
                                <div className="expert-avatar">👨‍🔧</div>
                                <div className="expert-info">
                                    <h4>샷시 전문가 김호빵</h4>
                                    <p>15년 경력의 창호 전문가입니다</p>
                                </div>
                            </div>
                            <div className="chat-options">
                                <button
                                    className="chat-option"
                                    onClick={() => window.open("https://pf.kakao.com/_dbxezn", "_blank")}
                                >
                                    <span className="option-icon">💬</span>
                                    <div className="option-text">
                                        <h5>카카오톡 상담</h5>
                                        <p>빠른 답변을 받아보세요</p>
                                    </div>
                                </button>
                                <button className="chat-option">
                                    <span className="option-icon">📞</span>
                                    <div className="option-text">
                                        <h5>전화 상담</h5>
                                        <p>직접 통화로 상담받기</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Navigation - 조건부 렌더링 */}
            <BottomNavigator
                userData={userData}
                isVisible={isBottomNavVisible}
            />
        </div>
    );
};

export default Initial;
