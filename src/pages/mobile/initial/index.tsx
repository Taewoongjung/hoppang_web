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

    const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    // 디바운싱을 위한 타이머 ref
    const scrollTimer = React.useRef<NodeJS.Timeout | null>(null);

    // 스크롤 이벤트 핸들러
    useEffect(() => {
        const handleScroll = () => {
            // 디바운싱으로 성능 최적화
            if (scrollTimer.current) {
                clearTimeout(scrollTimer.current);
            }

            scrollTimer.current = setTimeout(() => {
                const currentScrollY = window.scrollY;
                const documentHeight = document.documentElement.scrollHeight;
                const windowHeight = window.innerHeight;
                const scrollPercent = (currentScrollY / (documentHeight - windowHeight)) * 100;

                const scrollThreshold = 200; // 200px 이상 스크롤하면 숨김
                const showThreshold = 50; // 50px 이상 위로 스크롤하면 다시 표시
                const footerThreshold = 75; // 스크롤 75% 지점에서 Footer 표시

                // 스크롤 방향 감지
                const currentDirection = currentScrollY > lastScrollY ? 'down' : 'up';

                // 페이지 하단 근처 (75% 이상)에서는 무조건 Footer 표시, BottomNav 숨김
                if (scrollPercent > footerThreshold || currentScrollY > (documentHeight - windowHeight - 100)) {
                    setIsBottomNavVisible(false);
                }
                // 맨 위 근처에서는 무조건 BottomNav 표시
                else if (currentScrollY < 100) {
                    setIsBottomNavVisible(true);
                }
                // 아래로 스크롤할 때 (일정 거리 이상)
                else if (currentDirection === 'down' && currentScrollY > scrollThreshold && (currentScrollY - lastScrollY) > 5) {
                    setIsBottomNavVisible(false);
                }
                // 위로 스크롤할 때 (일정 거리 이상)
                else if (currentDirection === 'up' && (lastScrollY - currentScrollY) > showThreshold) {
                    setIsBottomNavVisible(true);
                }

                setLastScrollY(currentScrollY);
            }, 10); // 10ms 디바운싱
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (scrollTimer.current) {
                clearTimeout(scrollTimer.current);
            }
        };
    }, [lastScrollY]);

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
                            <span>비즈니스 문의</span>
                        </button>
                        <button
                            className="footer-link"
                        >
                            <span>고객센터</span>
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

            {/* Bottom Navigation - 조건부 렌더링 */}
            <BottomNavigator
                userData={userData}
                isVisible={isBottomNavVisible}
            />
        </div>
    );
};

export default Initial;
