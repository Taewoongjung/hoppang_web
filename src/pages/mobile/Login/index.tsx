import React, {useEffect, useState} from 'react';

import './styles.css';
import '../versatile-styles.css';

import axios from "axios";
import {LeftOutlined} from "@ant-design/icons";
import {appleLogin, googleLogin, kakaoLogin} from "../../../definition/apiPath";

declare global {
    interface Window {
        ReactNativeWebView?: {
            postMessage(message: string): void;
        };
    }
}

const Login = () => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const urlParams = new URLSearchParams(window.location.search);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth <= 430;

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
                            <h1 className="login-title">호빵에 오신 것을 환영합니다</h1>
                            <p className="login-subtitle">호구빵명 프로젝트와 함께<br />샷시 전문가의 도움을 받아보세요</p>

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
