import React, {useEffect, useState} from 'react';

import './styles.css';
import '../versatile-styles.css';

import { RightOutlined, UserOutlined, HistoryOutlined, SettingOutlined } from '@ant-design/icons';
import useSWR from "swr";
import {callMeData} from "../../../definition/apiPath";
import fetcher from "../../../util/fetcher";
import OverlayLoadingPage from "../../../component/Loading/OverlayLoadingPage";
import BottomNavigator from "../../../component/V2/BottomNavigator";

const MyPage = () => {
    const { data: userData, error, mutate } = useSWR(callMeData, fetcher, {
        dedupingInterval: 2000
    });

    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setLoading(true);

        if (userData) {
            setIsLoggedIn(true);
            setLoading(false);
        } else {
            setIsLoggedIn(false);
            setLoading(false);
        }

        const handlePopState = () => {
            const currentUrl = window.location.href;
            const targetPattern = /^https:\/\/hoppang\.store\/.*\/chassis\/calculator\?code=.*$/;

            if (targetPattern.test(currentUrl)) {
                window.location.replace("https://hoppang.store/chassis/calculator");
            }
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, [userData]);

    const goToEstimationHistory = () => {
        mutate().then(() => {
            window.location.href = '/v2/mypage/estimation/histories';
        })
    }

    const menuItems = [
        {
            icon: <HistoryOutlined />,
            emoji: '📋',
            title: '견적 이력',
            description: '내가 받은 견적을 확인하세요',
            onClick: goToEstimationHistory,
            requiresLogin: true,
            badge: null
        }
    ];

    const quickActions = [
        {
            icon: '🏠',
            title: '새 견적',
            description: '샷시 견적받기',
            onClick: () => window.location.href = '/calculator/agreement',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        },
        {
            icon: '💬',
            title: '문의하기',
            description: '카카오톡 상담',
            onClick: () => window.open("https://pf.kakao.com/_dbxezn", "_blank"),
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
        }
    ];

    return (
        <>
            {loading && <OverlayLoadingPage word={"처리중"} />}

            <div className="mypage-container">
                {/* Header */}
                <header className="mypage-header">
                    <div className="header-content">
                        <div className="logo-container">
                            <img src="/assets/hoppang-character.png" alt="Hoppang Logo" className="logo-img" />
                            <span className="logo-text">마이</span>
                        </div>
                        <button
                            className="settings-btn"
                            onClick={() => {window.location.href = `/v2/mypage/userconfig?isLoggedIn=${isLoggedIn}`;}}
                        >
                            <SettingOutlined />
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="mypage-main">
                    {/* User Section */}
                    {!userData ? (
                        <section className="login-section">
                            <div className="login-card" onClick={() => {window.location.href = '/login';}}>
                                <div className="login-content">
                                    <div className="login-icon">
                                        <UserOutlined />
                                    </div>
                                    <div className="login-text">
                                        <h3>호빵에서 만나요! 🎉</h3>
                                        <p>로그인하고 맞춤 견적을 받아보세요</p>
                                        <div className="login-benefits">
                                            <span className="benefit-item">✨ 견적 이력 관리</span>
                                            <span className="benefit-item">💾 자동 저장</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="login-arrow">
                                    <RightOutlined />
                                </div>
                            </div>
                        </section>
                    ) : (
                        <section className="user-section">
                            <div className="user-welcome">
                                <div className="user-avatar">
                                    <UserOutlined />
                                </div>
                                <div className="user-info">
                                    <h2>안녕하세요! 👋🏻&nbsp;</h2>
                                    <p><strong>{userData.name}</strong>님</p>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Quick Actions for logged in users */}
                    {userData && (
                        <section className="quick-actions-section">
                            <h3 className="section-title">
                                <span className="title-icon">⚡</span>
                                빠른 서비스
                            </h3>
                            <div className="quick-actions-grid">
                                {quickActions.map((action, index) => (
                                    <div
                                        key={index}
                                        className="quick-action-card"
                                        style={{ background: action.gradient }}
                                        onClick={action.onClick}
                                    >
                                        <div className="action-icon">{action.icon}</div>
                                        <h4 className="action-title">{action.title}</h4>
                                        <p className="action-description">{action.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Services Section for logged in users */}
                    {userData && (
                        <section className="services-section">
                            <h3 className="section-title">
                                <span className="title-icon">🏠</span>
                                창호 서비스
                            </h3>
                            <div className="menu-list">
                                {menuItems.map((item, index) => (
                                    (!item.requiresLogin || userData) && (
                                        <div key={index} className="menu-item" onClick={item.onClick}>
                                            <div className="menu-content">
                                                <div className="menu-icon-wrapper">
                                                    <div className="menu-emoji">{item.emoji}</div>
                                                    <div className="menu-icon-bg"></div>
                                                </div>
                                                <div className="menu-text">
                                                    <h4>{item.title}</h4>
                                                    <p>{item.description}</p>
                                                </div>
                                                {item.badge && (
                                                    <div className="menu-badge">{item.badge}</div>
                                                )}
                                            </div>
                                            <div className="menu-arrow">
                                                <RightOutlined />
                                            </div>
                                        </div>
                                    )
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Customer Service Section */}
                    <section className="customer-service-section">
                        <h3 className="section-title">
                            <span className="title-icon">🎧</span>
                            고객센터
                        </h3>
                        <div className="menu-list">
                            <div className="menu-item support-item" onClick={() => window.open("https://pf.kakao.com/_dbxezn", "_blank")}>
                                <div className="menu-content">
                                    <div className="menu-icon-wrapper">
                                        <div className="menu-emoji">💬</div>
                                        <div className="menu-icon-bg support-bg"></div>
                                    </div>
                                    <div className="menu-text">
                                        <h4>카카오톡 문의하기</h4>
                                        <p>빠른 상담을 받아보세요</p>
                                        <div className="response-time">
                                            <span className="time-badge">평균 답변시간 5분</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="menu-arrow">
                                    <RightOutlined />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* App Info Section */}
                    <section className="app-info-section">
                        <div className="app-info-card">
                            <div className="app-character">
                                <img src="/assets/hoppang-character.png" alt="Hoppang Character" />
                            </div>
                            <div className="app-info-text">
                                <h4>호빵과 함께 하세요! 🥟</h4>
                                <p>샷시 견적부터 설치까지 모든 과정을 도와드립니다</p>
                            </div>
                        </div>
                    </section>
                </main>

                <BottomNavigator userData={userData}/>
            </div>
        </>
    )
}

export default MyPage;
