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
            window.location.href = '/mypage/estimation/histories';
        })
    }

    const menuItems = [
        {
            icon: <HistoryOutlined />,
            title: '견적 이력',
            description: '내가 받은 견적을 확인하세요',
            onClick: goToEstimationHistory,
            requiresLogin: true
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
                                        <h3>호빵 로그인 및 회원가입</h3>
                                        <p>간편하게 로그인하고 다양한 혜택을 누려보세요</p>
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
                                    <h2>안녕하세요! 👋</h2>
                                    <p><strong>{userData.name}</strong>님</p>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Services Section */}
                    {userData && (
                        <section className="services-section">
                            <h3 className="section-title">창호 서비스</h3>
                            <div className="menu-list">
                                {menuItems.map((item, index) => (
                                    (!item.requiresLogin || userData) && (
                                        <div key={index} className="menu-item" onClick={item.onClick}>
                                            <div className="menu-content">
                                                <div className="menu-icon">
                                                    {item.icon}
                                                </div>
                                                <div className="menu-text">
                                                    <h4>{item.title}</h4>
                                                    <p>{item.description}</p>
                                                </div>
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

                    {/* Customer Service Section - 현재 주석 처리되어 있지만 필요시 활성화 */}
                    {/*
                    <section className="customer-service-section">
                        <h3 className="section-title">고객센터</h3>
                        <div className="menu-list">
                            <div className="menu-item" onClick={() => window.open("https://pf.kakao.com/_dbxezn", "_blank")}>
                                <div className="menu-content">
                                    <div className="menu-icon">
                                        💬
                                    </div>
                                    <div className="menu-text">
                                        <h4>카카오톡 문의하기</h4>
                                        <p>빠른 상담을 받아보세요</p>
                                    </div>
                                </div>
                                <div className="menu-arrow">
                                    <RightOutlined />
                                </div>
                            </div>
                        </div>
                    </section>
                    */}
                </main>

                <BottomNavigator userData={userData}/>
            </div>
        </>
    )
}

export default MyPage;
