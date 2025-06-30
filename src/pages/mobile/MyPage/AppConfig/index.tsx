import React, {useEffect, useState} from 'react';

import './styles.css';
import '../../versatile-styles.css';

import {LeftOutlined, BellOutlined, MessageOutlined} from "@ant-design/icons";
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
                        setIsAlimTalkOn(res.data.isAlarmTalkOn || false); // 기본값 설정
                    })
                    .catch((error) => {
                        console.error("Error fetching user configuration:", error);
                    });
            }
        });

    }, []);

    return (
        <>
            <div className="config-container">
                {/* Header */}
                <header className="config-header">
                    <div className="header-content">
                        <button
                            className="back-button"
                            onClick={() => {window.location.href = '/mypage/config?isLoggedIn=true';}}
                        >
                            <LeftOutlined />
                        </button>
                        <h1 className="page-title">앱 관리</h1>
                        <div className="header-spacer"></div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="config-main">
                    {/* Notification Settings Section */}
                    <section className="settings-section">
                        <div className="section-header">
                            <h2 className="section-title">알림 설정</h2>
                            <p className="section-description">원하는 알림 방식을 선택하세요</p>
                        </div>

                        <div className="settings-card">
                            <div className="setting-item">
                                <div className="setting-content">
                                    <div className="setting-icon push-icon">
                                        <BellOutlined />
                                    </div>
                                    <div className="setting-info">
                                        <h3 className="setting-title">푸시 알림</h3>
                                        <p className="setting-description">
                                            앱을 통해 실시간 알림을 받을 수 있습니다
                                        </p>
                                    </div>
                                </div>
                                <div className="setting-control">
                                    <Switch
                                        checked={isPushOn}
                                        onChange={onChangePushAlarm}
                                        loading={isChangingPushOn}
                                        className="custom-switch"
                                    />
                                </div>
                            </div>

                            <div className="setting-divider" />

                            <div className="setting-item">
                                <div className="setting-content">
                                    <div className="setting-icon talk-icon">
                                        <MessageOutlined />
                                    </div>
                                    <div className="setting-info">
                                        <h3 className="setting-title">알림톡</h3>
                                        <p className="setting-description">
                                            카카오톡을 통해 중요한 알림을 받을 수 있습니다
                                        </p>
                                    </div>
                                </div>
                                <div className="setting-control">
                                    <Switch
                                        checked={isAlimTalkOn}
                                        onChange={onChangeAlimTalk}
                                        loading={isChangingAlimTalkOn}
                                        className="custom-switch"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Information Section */}
                    <section className="info-section">
                        <div className="info-card">
                            <div className="info-header">
                                <h3>알림 안내</h3>
                            </div>
                            <div className="info-content">
                                <div className="info-item">
                                    <div className="info-bullet"></div>
                                    <span>푸시 알림: 견적 완료, 상담 요청 등의 실시간 알림</span>
                                </div>
                                <div className="info-item">
                                    <div className="info-bullet"></div>
                                    <span>알림톡: 견적서 발송, 중요 공지사항 등</span>
                                </div>
                                <div className="info-item">
                                    <div className="info-bullet"></div>
                                    <span>언제든지 설정에서 알림을 변경할 수 있습니다</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </>
    )
}

export default ConfigPage;
