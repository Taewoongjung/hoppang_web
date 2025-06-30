import React, { useState } from 'react';
import { Button, Switch, Card, Typography, Divider } from "antd";
import { BellOutlined, MessageOutlined } from '@ant-design/icons';
import axios from "axios";
import { callFinalSocialSignUp } from "../../../definition/apiPath";
import './styles.css';

const { Text } = Typography;

const LoginSecondStep = () => {
    const urlParams = new URLSearchParams(window.location.search);

    const [isPushAlarmOn, setIsPushAlarmOn] = useState(true);
    const [isAlimTalkOn, setIsAlimTalkOn] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const signupFinally = async () => {
        setIsLoading(true);
        const userEmail = urlParams.get('userEmail');
        const userPhoneNumber = urlParams.get('phoneNumber');

        try {
            await axios.put(callFinalSocialSignUp, {
                userEmail,
                userPhoneNumber,
                isPushOn: isPushAlarmOn,
                isAlimTalkOn: isAlimTalkOn,
            }, {
                withCredentials: true,
                headers: {
                    Authorization: localStorage.getItem("hoppang-token") || '',
                }
            });

            window.location.href = "/chassis/v2/calculator";
        } catch (err) {
            if (err.response?.data?.errorCode === 1) {
                const { email, oauthType, errorMessage: message } = err.response.data;
                window.location.href = `/login/duplicate?email=${email}&oauthType=${oauthType}&message=${message}`;
            }
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="login-container">
            {/* Header */}
            <div className="login-header">
                <div className="header-content">
                    <div className="logo-container">
                        <img src="/assets/hoppang-character.png" alt="Hoppang Logo" className="logo-img" />
                        <span className="logo-text">호빵</span>
                    </div>
                </div>
            </div>

            <div className="login-content">
                {/* Progress Bar */}
                <div className="progress-container">
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: '100%' }}></div>
                    </div>
                    <span className="progress-text">2/2 단계</span>
                </div>

                {/* Main Content */}
                <div className="login-step-main">
                    <Card className="login-step-card">
                        <div className="login-step-card-content">
                            {/* Title Section */}
                            <div className="login-step-title-section">
                                <h2 className="section-title">알림 설정</h2>
                                <Text className="section-subtitle">서비스 이용을 위한 알림 수신 동의를 설정해주세요</Text>
                            </div>

                            <Divider className="divider" />

                            {/* Notification Settings */}
                            <div className="setting-list">
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <div className="setting-header">
                                            <BellOutlined className="setting-icon" />
                                            <h4 className="setting-title">푸시 알림</h4>
                                        </div>
                                        <div className="setting-description">앱 푸시 알림을 통해 중요한 소식을 받아보세요</div>
                                    </div>
                                    <Switch
                                        checked={isPushAlarmOn}
                                        onChange={setIsPushAlarmOn}
                                        checkedChildren="ON"
                                        unCheckedChildren="OFF"
                                    />
                                </div>

                                <div className="setting-item">
                                    <div className="setting-info">
                                        <div className="setting-header">
                                            <MessageOutlined className="setting-icon" />
                                            <h4 className="setting-title">알림톡</h4>
                                        </div>
                                        <div className="setting-description">알림톡으로 주문 정보와 이벤트 소식을 받아보세요</div>
                                    </div>
                                    <Switch
                                        checked={isAlimTalkOn}
                                        onChange={setIsAlimTalkOn}
                                        checkedChildren="ON"
                                        unCheckedChildren="OFF"
                                    />
                                </div>
                            </div>

                            <div className="info-message">
                                <Text className="info-text">💡 알림 설정은 나중에 마이페이지에서 변경할 수 있어요</Text>
                            </div>

                            <Button
                                type="primary"
                                size="large"
                                onClick={signupFinally}
                                loading={isLoading}
                                className="submit-button"
                                block
                            >
                                {isLoading ? '회원가입 중...' : '회원가입 완료'}
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default LoginSecondStep;
