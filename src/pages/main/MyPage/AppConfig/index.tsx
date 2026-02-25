import React, {useEffect, useState} from 'react';
import { Helmet } from 'react-helmet-async';

import './styles.css';
import '../../versatile-styles.css';

import {LeftOutlined, BellOutlined, MessageOutlined, CheckCircleOutlined, InfoCircleOutlined} from "@ant-design/icons";
import {Switch} from "antd";
import {callMeData, callReviseUserConfiguration, callUserConfigurationInfo} from "../../../../definition/apiPath";
import axios from "axios";

const ConfigPage = () => {

    const [userId, setUserId] = useState();
    const [isPushOn, setIsPushOn] = useState<boolean>(false);
    const [isAlimTalkOn, setIsAlimTalkOn] = useState<boolean>(false);
    const [isChangingPushOn, setIsChangingPushOn] = useState<boolean>(false);
    const [isChangingAlimTalkOn, setIsChangingAlimTalkOn] = useState<boolean>(false);

    const onChangePushAlarm = (isPushOn: boolean) => {
        // @ts-ignore
        const callReviseUserConfigurationApi = callReviseUserConfiguration.replace('{userId}', userId);

        setIsChangingPushOn(true);

        axios.put(callReviseUserConfigurationApi,
            {
                isPushOn: isPushOn,
                isAlimTalkOn: isAlimTalkOn
            },
            {
                headers: {
                    withCredentials: true,
                    Authorization: localStorage.getItem("hoppang-token")
                }
            }).then(res => {
            setTimeout(() => {
                setIsChangingPushOn(false);
                setIsPushOn(isPushOn);
            }, 700);
        }).catch(error => {
            console.error("Error updating push notification:", error);
            setIsChangingPushOn(false);
        });
    };

    const onChangeAlimTalk = (isAlimTalkOn: boolean) => {
        // @ts-ignore
        const callReviseUserConfigurationApi = callReviseUserConfiguration.replace('{userId}', userId);

        setIsChangingAlimTalkOn(true);

        axios.put(callReviseUserConfigurationApi,
            {
                isPushOn: isPushOn,
                isAlimTalkOn: isAlimTalkOn
            },
            {
                headers: {
                    withCredentials: true,
                    Authorization: localStorage.getItem("hoppang-token")
                }
            }).then(res => {
            setTimeout(() => {
                setIsChangingAlimTalkOn(false);
                setIsAlimTalkOn(isAlimTalkOn);
            }, 700);
        }).catch(error => {
            console.error("Error updating alarm talk:", error);
            setIsChangingAlimTalkOn(false);
        });
    };

    useEffect(() => {
        let token = localStorage.getItem("hoppang-token");

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

        fetchUserData().then((userData) => {
            if (userData) {
                setUserId(userData.data.id);
                const callUserConfigurationApi = callUserConfigurationInfo.replace('{userId}', userData.data.id);
                axios.get(callUserConfigurationApi, {
                    headers: {
                        withCredentials: true,
                        Authorization: token
                    }
                })
                    .then((res) => {
                        setUserId(userData.data.id);
                        setIsPushOn(res.data.isPushOn);
                        setIsAlimTalkOn(res.data.isAlarmTalkOn || false);
                    })
                    .catch((error) => {
                        console.error("Error fetching user configuration:", error);
                    });
            }
        });

    }, []);

    return (
        <>
            <Helmet>
                <meta name="robots" content="noindex, nofollow"/>
            </Helmet>
            <div className="config-container">
                {/* Header */}
                <header className="config-header">
                    <div className="header-content">
                        <button
                            className="back-button"
                            onClick={() => {window.location.href = '/v2/mypage/userconfig?isLoggedIn=true';}}
                        >
                            <LeftOutlined />
                        </button>
                        <div className="header-title">
                            <h1 className="page-title">앱 관리</h1>
                            <p className="page-subtitle">알림 설정을 관리하세요</p>
                        </div>
                        <div className="header-spacer"></div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="config-main">
                    {/* Hero Section */}
                    <section className="hero-section">
                        <div className="hero-content">
                            <div className="hero-icon">
                                <div className="icon-wrapper">
                                    <BellOutlined />
                                </div>
                            </div>
                            <h2 className="hero-title">알림 맞춤 설정</h2>
                            <p className="hero-description">호빵과 함께 중요한 알림을 놓치지 마세요!</p>
                        </div>
                    </section>

                    {/* Notification Settings Section */}
                    <section className="settings-section">
                        <div className="section-header">
                            <div className="section-icon">🔔</div>
                            <div className="section-info">
                                <h3 className="section-title">알림 설정</h3>
                                <p className="section-description">원하는 알림 방식을 선택하세요</p>
                            </div>
                        </div>

                        <div className="settings-card">
                            <div className="setting-item">
                                <div className="setting-content">
                                    <div className="setting-icon push-icon">
                                        <BellOutlined />
                                    </div>
                                    <div className="setting-info">
                                        <h4 className="setting-title">푸시 알림</h4>
                                        <p className="setting-description">
                                            앱을 통해 실시간 알림을 받을 수 있습니다
                                        </p>
                                        <div className="setting-features">
                                            <span className="feature-tag">견적 완료</span>
                                            <span className="feature-tag">상담 요청</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="setting-control">
                                    <Switch
                                        checked={isPushOn}
                                        onChange={onChangePushAlarm}
                                        loading={isChangingPushOn}
                                        className="custom-switch"
                                    />
                                    {isPushOn && (
                                        <div className="status-indicator active">
                                            <CheckCircleOutlined />
                                            <span>활성화</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="setting-divider" />

                            <div className="setting-item">
                                <div className="setting-content">
                                    <div className="setting-icon talk-icon">
                                        <MessageOutlined />
                                    </div>
                                    <div className="setting-info">
                                        <h4 className="setting-title">알림톡</h4>
                                        <p className="setting-description">
                                            카카오톡을 통해 중요한 알림을 받을 수 있습니다
                                        </p>
                                        <div className="setting-features">
                                            <span className="feature-tag kakao">견적서 발송</span>
                                            <span className="feature-tag kakao">중요 공지</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="setting-control">
                                    <Switch
                                        checked={isAlimTalkOn}
                                        onChange={onChangeAlimTalk}
                                        loading={isChangingAlimTalkOn}
                                        className="custom-switch"
                                    />
                                    {isAlimTalkOn && (
                                        <div className="status-indicator active">
                                            <CheckCircleOutlined />
                                            <span>활성화</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Information Section */}
                    <section className="info-section">
                        <div className="info-card">
                            <div className="info-header">
                                <div className="info-icon">
                                    <InfoCircleOutlined />
                                </div>
                                <h3>알림 안내</h3>
                            </div>
                            <div className="info-content">
                                <div className="info-item">
                                    <div className="info-bullet push"></div>
                                    <div className="info-text">
                                        <strong>푸시 알림</strong>
                                        <span>견적 완료, 상담 요청 등의 실시간 알림</span>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <div className="info-bullet talk"></div>
                                    <div className="info-text">
                                        <strong>알림톡</strong>
                                        <span>견적서 발송, 중요 공지사항 등</span>
                                    </div>
                                </div>
                                <div className="info-item">
                                    <div className="info-bullet setting"></div>
                                    <div className="info-text">
                                        <strong>설정 변경</strong>
                                        <span>언제든지 설정에서 알림을 변경할 수 있습니다</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Tips Section */}
                    <section className="tips-section">
                        <div className="tips-card">
                            <div className="tips-header">
                                <span className="tips-emoji">💡</span>
                                <h3>알림 활용 팁</h3>
                            </div>
                            <div className="tips-content">
                                <p>두 가지 알림을 모두 활성화하면 중요한 소식을 더욱 확실하게 받아볼 수 있어요!</p>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </>
    )
}

export default ConfigPage;
