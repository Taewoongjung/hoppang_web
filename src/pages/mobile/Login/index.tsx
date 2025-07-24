import React, {useEffect, useState} from 'react';

import './styles.css';
import '../versatile-styles.css';

import axios from "axios";
import {LeftOutlined} from "@ant-design/icons";
import {appleLogin, googleLogin, kakaoLogin} from "../../../definition/apiPath";
import {isMobileClient} from "../../../util";

declare global {
    interface Window {
        ReactNativeWebView?: {
            postMessage(message: string): void;
        };
    }
}

// 모바일 안내 컴포넌트
const MobileGuideModal = ({ onGoToMobile }: { onGoToMobile: () => void }) => {
    return (
        <div className="mobile-guide-overlay">
            <div className="mobile-guide-container">
                {/* 호빵 캐릭터와 말풍선 */}
                <div className="mobile-guide-character">
                    <div className="speech-bubble">
                        <div className="bubble-content">
                            <span className="bubble-text">지금은 모바일에서만 만나볼 수 있어요!</span>
                            <div className="bubble-tail"></div>
                        </div>
                    </div>
                    <img
                        src="/assets/hoppang-character.png"
                        alt="호빵 캐릭터"
                        className="character-img"
                    />
                </div>

                {/* 안내 컨텐츠 */}
                <div className="mobile-guide-content">
                    <div className="guide-header">
                        <h2 className="guide-title">📱 모바일 앱 전용 서비스예요!</h2>
                        <p className="guide-subtitle">
                            호빵은 현재 <strong>모바일 앱에서만</strong> 이용하실 수 있어요<br />
                            앱으로 이동해서 서비스를 경험해보세요
                        </p>
                    </div>

                    <div className="guide-benefits">
                        <div className="benefit-item">
                            <div className="benefit-icon">📱</div>
                            <span>모바일 전용으로 최적화된 서비스</span>
                        </div>
                        <div className="benefit-item">
                            <div className="benefit-icon">🚀</div>
                            <span>빠르고 투명한 계산과 비대면 무료 견적 확인</span>
                        </div>
                        <div className="benefit-item">
                            <div className="benefit-icon">💡</div>
                            <span>커뮤니티로 언제 어디서나 창호 전문가와 연결</span>
                        </div>
                    </div>

                    <div className="guide-buttons">
                        <button
                            onClick={onGoToMobile}
                            className="primary-btn mobile-btn"
                        >
                            <span>모바일로 이동하기</span>
                        </button>
                    </div>

                    <div className="guide-note">
                        <p>💡 모바일 브라우저나 앱에서 호빵을 만나보세요!</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Login = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const [showMobileGuide, setShowMobileGuide] = useState(false);

    useEffect(() => {
        // 모바일이 아닌 경우 안내 모달 표시 (바로 리다이렉트하지 않음)
        if (!isMobileClient()) {
            // 페이지 로드 후 약간의 지연을 두고 자연스럽게 표시
            setTimeout(() => {
                setShowMobileGuide(true);
            }, 350);
        }
    }, []);

    const handleGoToMobile = () => {
        window.location.href = "https://hoppang.store/official?adv_id=329263e0-5d61-4ade-baf9-7e34cc611828";
    };

    const handleKakaoLogin = () => {
        const callLogin = async () => {
            axios.get(kakaoLogin)
                .then((res) => {
                    if (window.ReactNativeWebView) {
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'KKOLoginRequest',
                            data: res.data
                        }));
                    } else {
                        console.log('Not in React Native WebView');
                    }
                });
        }
        callLogin();
    };

    const handleAppleLogin = () => {
        const callLogin = async () => {
            axios.get(appleLogin)
                .then((res) => {
                    window.location.href = res.data;
                });
        }
        callLogin();
    };

    const handleGoogleLogin = () => {
        const callLogin = async () => {
            axios.get(googleLogin)
                .then((res) => {
                    window.location.href = res.data;
                })
        }
        callLogin();
    }

    return (
        <div className="login-container">
            {/* 모바일 안내 모달 */}
            {showMobileGuide && (
                <MobileGuideModal
                    onGoToMobile={handleGoToMobile}
                />
            )}

            {/* Header */}
            <header className="login-header">
                <button
                    className="back-button"
                    onClick={() => {window.location.href = "/chassis/calculator"}}
                >
                    <LeftOutlined />
                </button>
                <div className="header-logo">
                    <img src="/assets/hoppang-character.png" alt="Hoppang Logo" className="header-logo-img" />
                    <span className="header-logo-text">호빵</span>
                </div>
                <div></div> {/* Spacer for centering */}
            </header>

            {/* Main Content */}
            <main className="login-main">
                {/* Hero Section */}
                <section className="login-hero">
                    <div className="login-hero-content">
                        <div className="login-logo-container">
                            <img
                                src="/assets/hoppang-character.png"
                                alt="Hoppang Character"
                                className="login-character"
                            />
                        </div>

                        <div className="login-text-content">
                            <h1 className="login-title">호빵은 창호 가격의 기준을 제시합니다</h1>
                            <p className="login-subtitle">호빵은 <strong>호</strong>구 <strong>빵</strong>명의 의미로,</p>
                            <p className="login-subtitle">불투명한 창호 시장에서 소비자가<br/>손해 보지 않도록,</p>
                            <p className="login-subtitle">시세 기준과 투명한 견적으로<br/>합리적인 선택을 돕습니다.</p>

                            {urlParams.get('needed') === 'true' && (
                                <div className="login-notice">
                                    <div className="notice-icon">💡</div>
                                    <span>로그인하고 창호 가격 정보를 확인하세요</span>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Login Buttons Section */}
                <section className="login-buttons-section">
                    <div className="login-buttons-title">
                        <h3>간편하게 시작하기</h3>
                        <p>소셜 계정으로 빠르게 로그인하세요</p>
                    </div>

                    <div className="login-buttons-container">
                        {/* 카카오 로그인 */}
                        <button
                            onClick={handleKakaoLogin}
                            className="social-login-btn kakao-btn"
                        >
                            <div className="btn-content">
                                <div className="btn-icon">
                                    <img src="/assets/Sso/kakao-logo.png" alt="Kakao" />
                                </div>
                                <span className="btn-text">카카오로 계속하기</span>
                            </div>
                        </button>

                        {/* 애플 로그인 */}
                        <button
                            onClick={handleAppleLogin}
                            className="social-login-btn apple-btn"
                        >
                            <div className="btn-content">
                                <div className="btn-icon">
                                    <img src="/assets/Sso/apple-logo.png" alt="Apple" />
                                </div>
                                <span className="btn-text">Apple로 계속하기</span>
                            </div>
                        </button>

                        {/* 구글 로그인 */}
                        <button
                            onClick={handleGoogleLogin}
                            className="social-login-btn google-btn"
                        >
                            <div className="btn-content">
                                <div className="btn-icon">
                                    <img src="/assets/Sso/google-logo.png" alt="Google" />
                                </div>
                                <span className="btn-text">Google로 계속하기</span>
                            </div>
                        </button>
                    </div>

                    {/* 추가 정보 */}
                    <div className="login-footer">
                        <p className="login-terms">
                            로그인 시 <a href="/terms">이용약관</a> 및 <a href="/privacy">개인정보처리방침</a>에 동의하게 됩니다.
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Login;
