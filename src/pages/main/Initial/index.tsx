import React, { useState, useEffect, useCallback, useRef } from 'react';

import './styles.css';
import '../versatile-styles.css';

import BottomNavigator from "../../../component/V2/BottomNavigator";
import useSWR from "swr";
import {appleAuth, callMeData, callRecentPosts, googleAuth, kakaoAuth} from "../../../definition/apiPath";
import fetcher from "../../../util/fetcher";
import {useHistory, useParams} from "react-router-dom";
import axios from "axios";
import {Question} from "../Question/interface";
import OverlayLoadingPage from "../../../component/Loading/OverlayLoadingPage";
import {formatTimeAgo} from "../../../util/boardUtil";
import GoogleAdSense from "../../../component/V2/AdBanner/GoogleAdSense";

declare global {
    interface Window {
        device?: any;
        cordova?: any;
        __HOPPANG_APP_INITIALIZED?: boolean;
    }
}

const Initial = () => {
    const history = useHistory();
    const { oauthtype } = useParams();
    const urlParams = new URLSearchParams(window.location.search);

    // 렌더링 감지를 위한 상태들
    const [isInitialized, setIsInitialized] = useState(false);
    const [renderTimestamp, setRenderTimestamp] = useState(Date.now());
    const initializationRef = useRef(false);

    const { data: userData, error, mutate } = useSWR(callMeData, fetcher, {
        dedupingInterval: 2000
    });

    const [isBottomNavVisible, setIsBottomNavVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [recentPosts, setRecentPosts] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Safe area 지원 감지
    const [supportsSafeArea, setSupportsSafeArea] = useState(false);

    // Safe area 지원 여부 확인 및 viewport 설정
    useEffect(() => {
        const checkSafeAreaSupport = () => {
            if (CSS && CSS.supports) {
                const supports = CSS.supports('padding', 'env(safe-area-inset-top)');
                setSupportsSafeArea(supports);

                // body에 safe area 관련 클래스 추가
                if (supports) {
                    document.body.classList.add('supports-safe-area');
                } else {
                    document.body.classList.add('no-safe-area');
                }
            }
        };

        // Safe area를 위한 viewport meta tag 동적 설정
        const setViewportMeta = () => {
            let viewportMeta = document.querySelector('meta[name="viewport"]');
            if (!viewportMeta) {
                viewportMeta = document.createElement('meta');
                viewportMeta.setAttribute('name', 'viewport');
                document.head.appendChild(viewportMeta);
            }

            // Safe area를 고려한 viewport 설정
            viewportMeta.setAttribute('content',
                'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
            );
        };

        setViewportMeta();
        checkSafeAreaSupport();
    }, []);

    // 1. 앱 초기화 감지 및 강제 새로고침 로직
    useEffect(() => {
        const initializeApp = () => {
            // 앱이 이미 초기화되었는지 확인
            const lastInitTime = sessionStorage.getItem('hoppang_last_init');
            const currentTime = Date.now();
            const timeDiff = lastInitTime ? currentTime - parseInt(lastInitTime) : Infinity;

            // 5분 이상 지났거나 첫 실행이면 새로 초기화
            if (timeDiff > 5 * 60 * 1000 || !lastInitTime) {
                sessionStorage.setItem('hoppang_last_init', currentTime.toString());

                // 글로벌 플래그 설정
                window.__HOPPANG_APP_INITIALIZED = true;

                mutate();

                // 캐시 무효화를 위한 timestamp 갱신
                setRenderTimestamp(currentTime);
            }

            setIsInitialized(true);
            initializationRef.current = true;
        };

        // 페이지 가시성 변경 감지 (앱이 백그라운드에서 돌아올 때)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                initializeApp();

                // 데이터 새로고침
                mutate();
                fetchRecentPosts();
            }
        };

        // 포커스 이벤트 감지 (브라우저/앱 활성화)
        const handleFocus = () => {
            // 앱 포커스 획득
            initializeApp();
        };

        // 페이지 로드 감지
        const handlePageShow = (event: PageTransitionEvent) => {
            // bfcache에서 복원된 경우
            if (event.persisted) {
                // 페이지가 캐시에서 복원됨
                initializeApp();
            }
        };

        // 초기 실행
        initializeApp();

        // 이벤트 리스너 등록
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('focus', handleFocus);
        window.addEventListener('pageshow', handlePageShow);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('focus', handleFocus);
            window.removeEventListener('pageshow', handlePageShow);
        };
    }, []);

    // 2. 사용자 데이터 새로고침
    useEffect(() => {
        if (userData && isInitialized) {
            mutate();
        }
    }, [userData, isInitialized]);

    // 3. 최근 게시물 가져오기 함수 분리
    const fetchRecentPosts = useCallback(() => {
        axios.get(callRecentPosts + `?t=${renderTimestamp}`) // 캐시 방지용 timestamp
            .then((res) => {
                const post = res.data.map((post: any) => ({
                    id: post.id,
                    category: post.boardName,
                    title: post.title,
                    content: post.contents,
                    author: post.authorName,
                    createdAt: post.createdTime,
                    replyCount: post.replyCount,
                    viewCount: post.viewCount,
                    isAnswered: Math.random() > 0.3,
                    boardType: post.boardType || 'question',
                    isPinned: post.isPinned || false,
                    imageCount: null
                }));

                // 최근 게시물 로드
                setRecentPosts(post);
            })
            .catch(err => {

            });
    }, [renderTimestamp]);

    // 4. 초기 데이터 로드 (초기화 완료 후에만)
    useEffect(() => {
        if (!isInitialized) return;

        const token = localStorage.getItem("hoppang-token");

        if (token && token !== "undefined") {
            mutate();
        }

        // 스크롤 위치 초기화
        window.scrollTo(0, 0);

        // 최근 게시물 로드
        fetchRecentPosts();

    }, [isInitialized, fetchRecentPosts]);

    // 5. 뒤로가기 방지 (기존과 동일)
    useEffect(() => {
        const preventGoBack = () => {
            window.history.pushState(null, '', window.location.href);
        };

        window.history.pushState(null, '', window.location.href);
        window.addEventListener('popstate', preventGoBack);

        return () => window.removeEventListener('popstate', preventGoBack);
    }, []);

    // 6. 소셜 로그인 처리 (초기화 완료 후에만)
    useEffect(() => {
        if (!isInitialized || !oauthtype) return;

        if (oauthtype === 'kko' && localStorage.getItem('kakaoTokenInfo')) {
            setIsLoading(true);

            // 카카오 로그인 성공 요청
            axios.post(kakaoAuth, {
                // deviceId: '122333444555666',
                deviceId: localStorage.getItem('deviceId'),
                deviceType: localStorage.getItem('deviceType'),
                tokenInfo: localStorage.getItem('kakaoTokenInfo')
            }, { withCredentials: true })
                .then(async (res) => {
                    const token = await res.headers['authorization'];
                    await localStorage.setItem("hoppang-token", token);
                    await localStorage.setItem("hoppang-login-oauthType", res.data.oauthType);
                    await localStorage.setItem('kakaoTokenInfo', '');

                    await mutate();

                    setTimeout(() => {}, 150);

                    if (res.data.isSuccess && res.data.isTheFirstLogIn) {
                        window.location.href = "/v2/login/first?remainedProcess=false&firstProcess=true&userEmail=" + res.data.userEmail;
                    }
                })
                .catch((err) => {
                    alert(err.response.data.errorMessage);
                    if (err.response.data.errorCode === 7) {
                        window.location.href = err.response.data.redirectUrl;
                    }
                })
                .finally(() => {
                    setIsLoading(false);
                });

            return;
        }

        if (oauthtype === 'apl' && urlParams.get('code')) {
            setIsLoading(true);
            axios.post(appleAuth + urlParams.get('code'), {
                deviceId: localStorage.getItem('deviceId'),
                deviceType: localStorage.getItem('deviceType')
            }, { withCredentials: true })
                .then(async (res) => {
                    const token = await res.headers['authorization'];
                    await localStorage.setItem("hoppang-token", token);
                    await localStorage.setItem("hoppang-login-oauthType", res.data.oauthType);

                    await mutate();

                    setTimeout(() => {}, 150);

                    if (res.data.isSuccess && res.data.isTheFirstLogIn) {
                        window.location.href = "/v2/login/first?remainedProcess=false&firstProcess=true&userEmail=" + res.data.userEmail;
                    }
                })
                .catch((err) => {
                    alert(err.response.data.errorMessage);
                    if (err.response.data.errorCode === 7) {
                        window.location.href = err.response.data.redirectUrl;
                    }
                })
                .finally(() => {
                    setIsLoading(false);
                });

            return;
        }

        if (oauthtype === 'gle' && urlParams.get('code')) {
            setIsLoading(true);
            axios.post(googleAuth + "?code=" + urlParams.get('code'), {
                deviceId: localStorage.getItem('deviceId'),
                deviceType: localStorage.getItem('deviceType')
            }, { withCredentials: true })
                .then(async (res) => {
                    const token = await res.headers['authorization'];
                    await localStorage.setItem("hoppang-token", token);
                    await localStorage.setItem("hoppang-login-oauthType", res.data.oauthType);

                    await mutate();

                    setTimeout(() => {}, 150);

                    if (res.data.isSuccess && res.data.isTheFirstLogIn) {
                        window.location.href = "/v2/login/first?remainedProcess=false&firstProcess=true&userEmail=" + res.data.userEmail;
                    }
                })
                .catch((err) => {
                    alert(err.response.data.errorMessage);
                    if (err.response.data.errorCode === 7) {
                        window.location.href = err.response.data.redirectUrl;
                    }
                })
                .finally(() => {
                    setIsLoading(false);
                });

            return;
        }
    }, [isInitialized, oauthtype, urlParams.get('code')]);

    // 스크롤 핸들러 (기존과 동일)
    const scrollTimer = useRef<NodeJS.Timeout | null>(null);
    const ticking = useRef(false);

    const handleScroll = useCallback(() => {
        if (!ticking.current) {
            requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;
                const documentHeight = document.documentElement.scrollHeight;
                const windowHeight = window.innerHeight;
                const scrollableHeight = documentHeight - windowHeight;
                const scrollPercent = scrollableHeight > 0 ? (currentScrollY / scrollableHeight) * 100 : 0;

                const scrollThreshold = 150;
                const showThreshold = 50;
                const footerThreshold = 70;
                const bottomThreshold = 95;

                const scrollDirection = currentScrollY > lastScrollY ? 'down' : 'up';
                const scrollDelta = Math.abs(currentScrollY - lastScrollY);

                if (scrollPercent >= bottomThreshold ||
                    (scrollPercent >= footerThreshold && currentScrollY > scrollableHeight - 200)) {
                    setIsBottomNavVisible(false);
                }
                else if (currentScrollY < 100) {
                    setIsBottomNavVisible(true);
                }
                else {
                    if (scrollDirection === 'down' &&
                        currentScrollY > scrollThreshold &&
                        scrollDelta > 5) {
                        setIsBottomNavVisible(false);
                    }
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
            ribbon: '2가지 모드!',
            description: (
                <>
                    <span className="estimate-modes">
                        <span className="estimate-mode estimate-mode-simple"><span className="mode-icon">⚡</span>간편<br/>(2분)</span>
                        <span className="estimate-mode estimate-mode-detail"><span className="mode-icon">📏</span>상세<br/>(5분)</span>
                    </span>
                    <span className="service-highlight">셀프 · 무료 · 비대면</span>
                </>
            ),
            color: '#6366f1',
            bgColor: '#f0f9ff'
        },
        {
            id: 2,
            icon: '💬',
            title: '커뮤니티',
            ribbon: null,
            description: (
                <>
                    궁금한 점을 올리고<br/>
                    <strong>후기·사진·견적 팁</strong>을 함께 나눠보세요
                </>
            ),
            color: '#8b5cf6',
            bgColor: '#faf5ff'
        },
    ];

    const handleServiceClick = (serviceTitle: string) => {
        if (serviceTitle === '창호 견적') {
            history.push('/calculator');
        } else if (serviceTitle === '커뮤니티') {
            history.push('/question/boards');
        }
    };

    const windowGuides = [
        {
            id: 1,
            title: '호빵 견적 → 시공까지 한눈에!',
            description: '처음 상담부터 완공까지, 호빵이 함께합니다.',
            image: 'https://hoppang-guide-image.s3.ap-southeast-2.amazonaws.com/hoppang-process-thumbnail.png',
            redirectLink: '/v2/guide/hoppangprocess'
        },
        {
            id: 2,
            title: '호빵 창호 견적 가이드: 창호 종류 알아보기',
            description: '견적 전에 꼭 알아야 할 창호 종류 선택법',
            image: 'https://hoppang-guide-image.s3.ap-southeast-2.amazonaws.com/30py_apt.jpg',
            redirectLink: '/v2/guide/howtochoosechassistype'
        },
        {
            id: 3,
            title: '창호 성능 비교 가이드',
            description: '호빵이 알려주는 창호 가격·성능 체크 포인트',
            image: 'https://hoppang-guide-image.s3.ap-southeast-2.amazonaws.com/chassis-performance-guide-thumbnail.png',
            redirectLink: '/v2/guide/chassisperformance'
        },
    ];

    // 초기화되지 않은 경우 로딩 표시
    if (!isInitialized) {
        return (
            <div className="app-container" style={{
                // Safe area를 고려한 인라인 스타일
                paddingTop: supportsSafeArea ? 'env(safe-area-inset-top)' : '0',
                paddingBottom: supportsSafeArea ? 'env(safe-area-inset-bottom)' : '0',
                paddingLeft: supportsSafeArea ? 'env(safe-area-inset-left)' : '0',
                paddingRight: supportsSafeArea ? 'env(safe-area-inset-right)' : '0',
            }}>
                <OverlayLoadingPage word={"로딩중"} />
            </div>
        );
    }

    return (
        <div className="app-container" style={{
            // Safe area를 고려한 인라인 스타일
            paddingTop: supportsSafeArea ? 'env(safe-area-inset-top)' : '0',
            paddingBottom: supportsSafeArea ? 'env(safe-area-inset-bottom)' : '0',
            paddingLeft: supportsSafeArea ? 'env(safe-area-inset-left)' : '0',
            paddingRight: supportsSafeArea ? 'env(safe-area-inset-right)' : '0',
        }}>
            {isLoading && <OverlayLoadingPage word={"처리중"}/>}

            {/* Header */}
            <header className="app-header">
                <div className="header-content">
                    <div className="logo-container">
                        <img src="/assets/hoppang-character.png" alt="Hoppang Logo" className="logo-img" />
                        <span className="logo-text">호빵</span>
                    </div>
                    <div className="header-greeting">
                        {userData ? (
                            <span className="user-greeting">안녕하세요&nbsp;
                                <strong>{userData.nickname ? userData.nickname : userData.name}</strong>님!
                            </span>
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
                            <p className="hero-subtitle">견적부터 설치까지, 모든 과정을 호빵이 도와드려요!</p>
                            <button
                                className="cta-button"
                                onClick={() => {
                                    userData ?
                                        window.location.href = "/question/boards/posts/register?from=initial" : window.location.href = "/v2/login";
                                }}
                            >
                                <span className="cta-icon">💬</span>
                                {!userData && '로그인 하고'} 전문가에게 질문하기
                            </button>
                        </div>
                        <div className="hero-illustration">
                            <div className="window-icon">🪟</div>
                        </div>
                    </div>
                </section>

                <GoogleAdSense
                    adSlot="3210423518"
                    className="banner-middle"
                />

                {/* Services Grid */}
                <section className="services-section">
                    <div className="services-grid">
                        {services.map((service) => (
                            <div
                                key={service.id}
                                className={`service-card ${service.ribbon ? 'service-card-with-ribbon' : ''}`}
                                onClick={() => handleServiceClick(service.title)}
                            >
                                {service.ribbon && (
                                    <div className="service-ribbon">
                                        <span>{service.ribbon}</span>
                                    </div>
                                )}
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
                            호빵 가이드
                        </h3>
                    </div>
                    <div className="guides-grid">
                        {windowGuides.map((guide) => (
                            <div key={guide.id}
                                 className="guide-card"
                                 onClick={() => history.push(guide.redirectLink)}
                            >
                                <div className="guide-image-wrapper">
                                    <img src={guide.image} alt={guide.title} className="guide-image"/>
                                </div>
                                <div className="guide-content">
                                    <h4 className="guide-title">{guide.title}</h4>
                                    <p className="guide-description">{guide.description}</p>
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
                        <div className="see-all-btn" onClick={() => window.location.href = '/question/boards'}>
                            <span>전체보기</span>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>
                    <div className="questions-list">
                        {recentPosts.map((q) => (
                            <div key={q.id}
                                 className="question-item"
                                 onClick={() => window.location.href =`/question/boards/posts/${q.id}`
                                 }>
                                <div className="question-content">
                                    <p className="question-text">{q.title}</p>
                                    <div className="question-meta">
                                        <span className="question-category">{q.category}</span>
                                        <span className="question-element">{formatTimeAgo(q.createdAt)}</span>
                                        <span className="question-element">| 조회 {q.viewCount} |</span>
                                        {q.replyCount > 0 && (
                                            <span className="question-element">
                                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                                                    <path d="M8 1C11.866 1 15 4.134 15 8C15 11.866 11.866 15 8 15C6.674 15 5.431 14.612 4.378 13.934L1 15L2.066 11.622C1.388 10.569 1 9.326 1 8C1 4.134 4.134 1 8 1Z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                                                </svg>
                                                &nbsp;{q.replyCount}
                                            </span>
                                        )}
                                    </div>
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

            {/* Footer */}
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
                                window.location.href ="/v2/counsel";
                            }}
                        >
                            <span>고객센터</span>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p className="footer-copyright">© 2026 호빵. All rights reserved.</p>
                        <div className="footer-meta">
                            <span onClick={() => {window.location.href="/policy/privacy";}}>개인정보처리방침</span>
                            <span className="footer-separator">|</span>
                            <span onClick={() => {window.location.href="/policy/termofuse";}}>이용약관</span>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Bottom Navigation */}
            <BottomNavigator
                userData={userData}
                isVisible={isBottomNavVisible}
            />
        </div>
    );
};

export default Initial;
