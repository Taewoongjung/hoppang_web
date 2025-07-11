import React, { useState, useEffect, useCallback, useRef } from 'react';

import './styles.css';
import '../versatile-styles.css';

import BottomNavigator from "../../../component/V2/BottomNavigator";
import useSWR from "swr";
import {callMeData} from "../../../definition/apiPath";
import fetcher from "../../../util/fetcher";
import {useHistory} from "react-router-dom";


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

    useEffect(()=>{
        const preventGoBack = () => {
            window.history.pushState(null, '', window.location.href);
        };

        window.history.pushState(null, '', window.location.href);
        window.addEventListener('popstate', preventGoBack);

        return () => window.removeEventListener('popstate', preventGoBack);
    }, [])


    const { data: userData, error, mutate } = useSWR(callMeData, fetcher, {
        dedupingInterval: 2000
    });

    const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
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
                    setIsBottomNavVisible(false);
                }
                // 페이지 상단 근처에서는 Footer 숨김, BottomNav 표시
                else if (currentScrollY < 100) {
                    setIsBottomNavVisible(true);
                }
                // 중간 영역에서의 BottomNav 표시/숨김 로직
                else {
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
            icon: '📋',
            title: '창호 견적',
            description: '맞춤형 견적을 받아보세요',
            color: '#6366f1',
            bgColor: '#f0f9ff'
        },
        {
            id: 2,
            icon: '💬',
            title: '커뮤니티',
            description: '궁금한 것을 물어보세요',
            color: '#8b5cf6',
            bgColor: '#faf5ff'
        },
    ];

    const handleServiceClick = (serviceTitle: string) => {
        if (serviceTitle === '창호 견적') {
            history.push('/calculator/agreement');
        } else if (serviceTitle === '커뮤니티') {
            history.push('/question/boards');
        }
    };

    const recentQuestions = [
        { id: 1, question: '이중창 설치 비용이 궁금해요', category: '설치', time: '2시간 전' },
        { id: 2, question: '창호 교체 시기는 언제인가요?', category: '교체', time: '4시간 전' },
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
                            <h2 className="hero-title">창호 전문가와 함께하세요</h2>
                            <p className="hero-subtitle">견적부터 설치까지, 모든 과정을 도와드립니다</p>
                            <button
                                className="cta-button"
                                onClick={() => {
                                    window.location.href = "/question/boards/posts/register?from=initial";
                                }}
                            >
                                <span className="cta-icon">💬</span>
                                전문가에게 질문하기
                            </button>
                        </div>
                        <div className="hero-illustration">
                            <div className="window-icon">🪟</div>
                        </div>
                    </div>
                </section>

                {/* Services Grid */}
                <section className="services-section">
                    <div className="services-grid">
                        {services.map((service) => (
                            <div
                                key={service.id}
                                className="service-card"
                                onClick={() => handleServiceClick(service.title)}
                            >
                                <div className="service-icon-wrapper" style={{ backgroundColor: service.bgColor }}>
                                    <span className="service-icon" style={{ color: service.color }}>
                                        {service.icon}
                                    </span>
                                </div>
                                <div className="service-content">
                                    <h4 className="service-title">{service.title}</h4>
                                    <p className="service-description">{service.description}</p>
                                </div>
                                <div className="service-arrow">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M7.5 5L12.5 10L7.5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
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
                                <div className="tip-content-wrapper">
                                    <h4 className="tip-title">{tip.title}</h4>
                                    <p className="tip-content">{tip.content}</p>
                                </div>
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
                        <div className="see-all-btn" onClick={() => history.push('/question/boards')}>
                            <span>전체보기</span>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>
                    <div className="questions-list">
                        {recentQuestions.map((q) => (
                            <div key={q.id} className="question-item" onClick={() => history.push('/question/boards')}>
                                <div className="question-content">
                                    <div className="question-meta">
                                        <span className="question-category">{q.category}</span>
                                        <span className="question-time">{q.time}</span>
                                    </div>
                                    <p className="question-text">{q.question}</p>
                                </div>
                                <div className="question-arrow">
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
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
                        <p className="footer-tagline">신뢰할 수 있는 창호 전문 플랫폼</p>
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
