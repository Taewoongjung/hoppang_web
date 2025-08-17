import React, {useEffect, useState} from 'react';

import './styles.css';
import '../versatile-styles.css';

import { RightOutlined, UserOutlined, HistoryOutlined, SettingOutlined } from '@ant-design/icons';
import useSWR from "swr";
import {callMeData} from "../../../definition/apiPath";
import fetcher from "../../../util/fetcher";
import OverlayLoadingPage from "../../../component/Loading/OverlayLoadingPage";
import BottomNavigator from "../../../component/V2/BottomNavigator";
import {useHistory} from "react-router-dom";

const MyPage = () => {
    const history = useHistory();

    useEffect(() => {
        // 뒤로가기 감지
        const unblock = history.block((location: any, action: string) => {
            if (action === 'POP') {
                return false;
            }
            return true;
        });

        return () => {
            unblock();
        };
    }, [history]);

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

    const quickServices = [
        {
            title: '견적 받기',
            subtitle: userData ? '무료 · 즉시' : '로그인 필요',
            onClick: () => {
                userData ? window.location.href = '/calculator/agreement' : window.location.href = '/login' },
            isPrimary: true,
            isDisabled: false
        },
        {
            title: '질문하기',
            subtitle: '커뮤니티',
            onClick: () => window.location.href = '/question/boards',
            isDisabled: false
        },
        {
            title: '상담하기',
            subtitle: '고객센터',
            onClick: () => window.location.href = '/v2/counsel',
            hasNotification: true,
            isDisabled: false
        },
        {
            title: '내 활동',
            subtitle: '커뮤니티',
            onClick: () => window.location.href = '/question/my/boards',
            isDisabled: false
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
                            <div className="login-card" onClick={() => {window.location.href = '/v2/login';}}>
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
                            <div className="user-welcome user-profile-card">
                                <div className="user-content">
                                    <div className="user-avatar-container">
                                        <div className="user-avatar">
                                            <UserOutlined />
                                        </div>
                                        <button
                                            className="avatar-settings-btn"
                                            onClick={(e) => {
                                                e.stopPropagation(); // 프로필 카드 클릭 방지
                                                window.location.href = `/v2/mypage/profile`;
                                            }}
                                        >
                                            <SettingOutlined />
                                        </button>
                                    </div>
                                    <div className="user-info">
                                        <h2>안녕하세요! 👋🏻&nbsp;</h2>
                                        <p><strong>{userData.name}</strong>님</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/*  빠른 서비스 섹션 */}
                    <section className="quick-services-section">
                        <h3 className="section-title">
                            <span className="title-icon">⚡</span>
                            빠른 서비스
                        </h3>
                        <div className="quick-services-grid">
                            {quickServices.map((service, index) => (
                                <div
                                    key={index}
                                    className={`quick-service-item ${service.isPrimary ? 'primary' : ''} ${service.isDisabled ? 'disabled' : ''}`}
                                    onClick={service.isDisabled ? undefined : service.onClick}
                                >
                                    {service.hasNotification && (
                                        <div className="notification-dot"/>
                                    )}
                                    <div className="service-text">
                                        <div className="service-title">{service.title}</div>
                                        <div className="service-subtitle">{service.subtitle}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

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

                    {/* App Info Section */}
                    <section className="app-info-section">
                        <div className="app-info-card">
                            <div className="app-character">
                                <img src="/assets/hoppang-character.png" alt="Hoppang Character" />
                            </div>
                            <div className="app-info-text">
                                <h4>호빵과 함께 하세요!</h4>
                                <p>창호 견적부터 설치까지 모든 과정을 도와드립니다</p>
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
