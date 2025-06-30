import React, {useState} from 'react';

import './styles.css';
import '../../versatile-styles.css';

import {ArrowLeftOutlined, UserAddOutlined, AppstoreOutlined, UserDeleteOutlined, LogoutOutlined, RightOutlined, PushpinOutlined} from "@ant-design/icons";
import { Modal } from 'antd';
import axios from 'axios';
import {callMeData, callWithdrawUser} from "../../../../definition/apiPath";
import LoadingPage from 'src/component/Loading/SimpleLoadingPage';

const ConfigPage = () => {

    const urlParams = new URLSearchParams(window.location.search);

    const [loading, setLoading] = useState(false);
    const [withdrawUserModal, setWithdrawUserModal] = useState(false);

    const privacyHandlingRule = () => {
        Modal.info({
            title: '개인정보처리방침',
            content: (
                <iframe
                    src="https://www.freeprivacypolicy.com/live/4a596f6c-7e7d-4b42-b593-5645a2f08453"
                    title="개인정보처리방침"
                    style={{ width: "100%", height: "400px", border: "none" }}
                ></iframe>
            ),
            onOk() {},
            okText: '확인',
            width: 800,
        });
    };

    const showEngPolicyModal = () => {
        privacyHandlingRule();
    };

    const handleLogOut = () => {
        localStorage.setItem("hoppang-token", 'undefined');

        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            window.location.href = '/chassis/v2/calculator';
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
                                window.location.href = '/chassis/v2/calculator';
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
                title: '개인정보 처리방침',
                description: '개인정보 수집 및 이용에 대한 안내',
                onClick: showEngPolicyModal,
                iconColor: '#10b981',
                bgColor: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
                showAlways: true
            }
        ],
        account: [
            {
                icon: <UserAddOutlined />,
                title: '회원가입',
                description: '호빵 서비스 가입하고 혜택 받기',
                onClick: () => {window.location.href = '/v2/login';},
                iconColor: '#3b82f6',
                bgColor: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                showWhen: 'notLoggedIn'
            },
            {
                icon: <AppstoreOutlined />,
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
                icon: <UserDeleteOutlined />,
                title: '회원탈퇴',
                description: '모든 데이터가 삭제되며 복구할 수 없습니다',
                onClick: () => setWithdrawUserModal(true),
                iconColor: '#ef4444',
                bgColor: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                showWhen: 'loggedIn',
                isDanger: true
            },
            {
                icon: <LogoutOutlined />,
                title: '로그아웃',
                description: '현재 계정에서 안전하게 로그아웃',
                onClick: handleLogOut,
                iconColor: '#6b7280',
                bgColor: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                showWhen: 'loggedIn'
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
                    <div
                        className="config-menu-icon"
                        style={{
                            background: item.bgColor,
                            color: item.iconColor
                        }}
                    >
                        {item.icon}
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
                            <div className="config-title-container">
                                <h1 className="config-title">설정</h1>
                                <p className="config-subtitle">계정 및 앱 설정을 관리하세요</p>
                            </div>
                        </div>
                    </header>

                    {/* Main Content */}
                    <main className="config-main">
                        {/* General Settings */}
                        <section className="config-section">
                            <h3 className="config-section-title">일반</h3>
                            <div className="config-menu-list">
                                {menuItems.general.map((item, index) => renderMenuItem(item, `general-${index}`))}
                            </div>
                        </section>

                        {/* Account Settings */}
                        <section className="config-section">
                            <h3 className="config-section-title">계정</h3>
                            <div className="config-menu-list">
                                {menuItems.account.map((item, index) => renderMenuItem(item, `account-${index}`))}
                            </div>
                        </section>

                        {/* Danger Zone - Only show if logged in */}
                        {isLoggedIn && (
                            <section className="config-section danger-section">
                                <h3 className="config-section-title danger-title">위험 구역</h3>
                                <div className="config-menu-list">
                                    {menuItems.danger.map((item, index) => renderMenuItem(item, `danger-${index}`))}
                                </div>
                            </section>
                        )}
                    </main>

                    {/* Withdraw Confirmation Modal */}
                    <Modal
                        title={
                            <div style={{ textAlign: 'center', padding: '10px 0' }}>
                                <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
                                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ef4444' }}>
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
                            style: {
                                borderRadius: '8px',
                                height: '40px',
                                fontWeight: '600'
                            }
                        }}
                        cancelButtonProps={{
                            style: {
                                borderRadius: '8px',
                                height: '40px',
                                fontWeight: '600'
                            }
                        }}
                        bodyStyle={{
                            textAlign: 'center',
                            padding: '20px 24px'
                        }}
                    >
                        <div style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '12px',
                            padding: '16px',
                            margin: '16px 0'
                        }}>
                            <p style={{
                                margin: 0,
                                color: '#991b1b',
                                fontSize: '15px',
                                lineHeight: '1.5'
                            }}>
                                회원 탈퇴 후 <strong>모든 유저 데이터가 영구적으로 삭제</strong>되며,
                                <br />이는 <strong>복구할 수 없습니다</strong>.
                            </p>
                        </div>
                        <p style={{
                            color: '#6b7280',
                            fontSize: '14px',
                            margin: '12px 0 0 0'
                        }}>
                            정말로 계속하시겠습니까?
                        </p>
                    </Modal>
                </div>
            }
        </>
    )
}

export default ConfigPage;
