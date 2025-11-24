import React, {useState} from 'react';

import './styles.css';
import '../../versatile-styles.css';

import {ArrowLeftOutlined, UserAddOutlined, AppstoreOutlined, UserDeleteOutlined, LogoutOutlined, RightOutlined, PushpinOutlined, SettingOutlined} from "@ant-design/icons";
import { Modal } from 'antd';
import axios from 'axios';
import {callMeData, callWithdrawUser} from "../../../../definition/apiPath";
import LoadingPage from 'src/component/Loading/SimpleLoadingPage';

const ConfigPage = () => {

    const urlParams = new URLSearchParams(window.location.search);

    const [loading, setLoading] = useState(false);
    const [withdrawUserModal, setWithdrawUserModal] = useState(false);


    const handleLogOut = () => {
        localStorage.setItem("hoppang-token", 'undefined');

        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            window.location.href = '/chassis/calculator';
        }, 2000);
    }

    const handleWithdrawUser = () => {
        let token = localStorage.getItem("hoppang-token");

        if (token) {

            // 모달 창 제거
            setWithdrawUserModal(false)

            const fetchUserData = async () => {
                try {
                    return await axios.get(callMeData, {
                        headers: {
                            withCredentials: true,
                            Authorization: token
                        }
                    });
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            };

            // 로딩창 진입
            setLoading(true);

            fetchUserData().then((userData) => {

                if (userData) {

                    const callWithdrawUserApi = callWithdrawUser.replace('{userId}', userData.data.id);

                    setWithdrawUserModal(false);
                    axios.delete(callWithdrawUserApi, {
                        data: {
                            oauthType: localStorage.getItem("hoppang-login-oauthType")
                        },
                        withCredentials: true,
                        headers: {
                            Authorization: token,
                        }
                    })
                        .then((res) => {
                            setTimeout(() => {
                                setLoading(false);
                                window.location.href = '/chassis/calculator';
                            }, 2000);
                        })
                        .catch((err) => {
                            setLoading(false);
                            alert(`[에러 발생] ${err}`);
                        })
                }
            });
        }
    }

    const menuItems = {
        general: [
            {
                icon: <PushpinOutlined />,
                emoji: '📋',
                title: '개인정보 처리방침',
                description: '개인정보 수집 및 이용에 대한 안내',
                onClick: () => {window.location.href = '/policy/termofuse'},
                iconColor: '#10b981',
                bgColor: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                showAlways: true
            }
        ],
        account: [
            {
                icon: <UserAddOutlined />,
                emoji: '👋',
                title: '회원가입',
                description: '호빵 서비스 가입하고 혜택 받기',
                onClick: () => {window.location.href = '/v2/login';},
                iconColor: '#3b82f6',
                bgColor: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                showWhen: 'notLoggedIn'
            },
            {
                icon: <AppstoreOutlined />,
                emoji: '⚙️',
                title: '앱 관리',
                description: '앱 설정 및 알림 관리',
                onClick: () => {window.location.href = '/v2/mypage/appconfig';},
                iconColor: '#8b5cf6',
                bgColor: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)',
                showWhen: 'loggedIn'
            }
        ],
        danger: [
            {
                icon: <LogoutOutlined />,
                emoji: '👋',
                title: '로그아웃',
                description: '현재 계정에서 안전하게 로그아웃',
                onClick: handleLogOut,
                iconColor: '#6b7280',
                bgColor: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                showWhen: 'loggedIn'
            },
            {
                icon: <UserDeleteOutlined />,
                emoji: '⚠️',
                title: '회원탈퇴',
                description: '모든 데이터가 삭제되며 복구할 수 없습니다',
                onClick: () => setWithdrawUserModal(true),
                iconColor: '#ef4444',
                bgColor: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                showWhen: 'loggedIn',
                isDanger: true
            }
        ]
    };

    const isLoggedIn = urlParams.get("isLoggedIn") === 'true';

    const renderMenuItem = (item: any, index: any) => {
        const shouldShow = item.showAlways ||
            (item.showWhen === 'loggedIn' && isLoggedIn) ||
            (item.showWhen === 'notLoggedIn' && !isLoggedIn);

        if (!shouldShow) return null;

        return (
            <div
                key={index}
                className={`config-menu-item ${item.isDanger ? 'danger-item' : ''}`}
                onClick={item.onClick}
            >
                <div className="config-menu-content">
                    <div className="config-menu-icon-wrapper">
                        <div className="config-menu-emoji">{item.emoji}</div>
                        <div
                            className="config-menu-icon-bg"
                            style={{ background: item.bgColor }}
                        ></div>
                    </div>
                    <div className="config-menu-text">
                        <h4>{item.title}</h4>
                        <p>{item.description}</p>
                    </div>
                </div>
                <div className="config-menu-arrow">
                    <RightOutlined />
                </div>
            </div>
        );
    };

    return (
        <>
            { loading && <LoadingPage statement={"로그아웃 처리중"}/> }

            { !loading &&
                <div className="config-container">
                    {/* Header */}
                    <header className="config-header">
                        <div className="config-header-content">
                            <button
                                className="config-back-button"
                                onClick={() => {window.location.href = '/v2/mypage';}}
                            >
                                <ArrowLeftOutlined />
                            </button>
                            <h1 className="config-title">설정</h1>
                            <div className="header-spacer"></div>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="config-main">
                        {/* Hero Section */}
                        <section className="settings-hero">
                            <div className="hero-card">
                                <div className="hero-content">
                                    <div className="hero-icon">
                                        <SettingOutlined />
                                    </div>
                                    <div className="hero-text">
                                        <h2>계정 설정</h2>
                                        <p>호빵과 함께 더 나은 경험을 만들어보세요</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Account Section */}
                        <section className="config-section">
                            <div className="section-header">
                                <div className="section-icon">👤</div>
                                <h3 className="config-section-title">계정 관리</h3>
                            </div>
                            <div className="config-menu-list">
                                {menuItems.account.map((item, index) => renderMenuItem(item, `account-${index}`))}
                            </div>
                        </section>

                        {/* General Section */}
                        <section className="config-section">
                            <div className="section-header">
                                <div className="section-icon">📖</div>
                                <h3 className="config-section-title">안내</h3>
                            </div>
                            <div className="config-menu-list">
                                {menuItems.general.map((item, index) => renderMenuItem(item, `general-${index}`))}
                            </div>
                        </section>

                        {/* Danger Section */}
                        {isLoggedIn && (
                            <section className="config-section danger-section">
                                <div className="section-header">
                                    <div className="section-icon">🚨</div>
                                    <h3 className="config-section-title danger-title">계정 관리</h3>
                                </div>
                                <div className="config-menu-list">
                                    {menuItems.danger.map((item, index) => renderMenuItem(item, `danger-${index}`))}
                                </div>
                            </section>
                        )}

                        {/* App Info */}
                        <section className="app-info-section">
                            <div className="app-info-card">
                                <div className="app-character">
                                    <img src="/assets/hoppang-character.png" alt="Hoppang Character" />
                                </div>
                                <div className="app-info-text">
                                    <h4>호빵 v2.5.8</h4>
                                    <p>더 나은 서비스를 위해 지속적으로 개선하고 있습니다</p>
                                </div>
                            </div>
                        </section>
                    </main>

                    {/* Withdraw Confirmation Modal */}
                    <Modal
                        title={
                            <div className="modal-title">
                                <div className="modal-warning-icon">⚠️</div>
                                <div className="modal-title-text">
                                    정말로 탈퇴하시겠습니까?
                                </div>
                            </div>
                        }
                        centered
                        open={withdrawUserModal}
                        onOk={handleWithdrawUser}
                        okText="탈퇴하기"
                        cancelText="취소"
                        onCancel={() => setWithdrawUserModal(false)}
                        okButtonProps={{
                            danger: true,
                            className: 'modal-danger-button'
                        }}
                        cancelButtonProps={{
                            className: 'modal-cancel-button'
                        }}
                        className="withdraw-modal"
                    >
                        <div className="modal-content">
                            <div className="modal-warning-box">
                                <p>
                                    회원 탈퇴 후 <strong>모든 유저 데이터가
                                    <br/>영구적으로 삭제</strong>되며,
                                    <br />이는 <strong>복구할 수 없습니다</strong>.
                                </p>
                            </div>
                            <p className="modal-confirmation">
                                정말로 계속하시겠습니까?
                            </p>
                        </div>
                    </Modal>
                </div>
            }
        </>
    )
}

export default ConfigPage;
