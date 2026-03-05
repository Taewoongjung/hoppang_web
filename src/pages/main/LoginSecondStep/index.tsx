import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';

import './styles.css';
import '../versatile-styles.css';

import { Button, Switch, Card, Typography, Divider, message } from "antd";
import { BellOutlined, MessageOutlined } from '@ant-design/icons';
import axios from "axios";
import { callFinalSocialSignUp } from "../../../definition/apiPath";
import { getAxiosError } from "../../../util/security";


const { Text } = Typography;

const LoginSecondStep = () => {
    const urlParams = new URLSearchParams(window.location.search);

    const [isPushAlarmOn, setIsPushAlarmOn] = useState(true);
    const [isAlimTalkOn, setIsAlimTalkOn] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const signupFinally = async () => {
        const userEmail = urlParams.get('userEmail');
        const userPhoneNumber = urlParams.get('phoneNumber');

        // 필수 파라미터 확인
        if (!userEmail || !userPhoneNumber) {
            message.error('필수 정보가 누락되었습니다. 다시 로그인해주세요.');
            return;
        }

        const token = localStorage.getItem("hoppang-token");
        if (!token) {
            message.error('로그인 토큰이 없습니다. 다시 로그인해주세요.');
            return;
        }

        setIsLoading(true);

        try {
            await axios.put(callFinalSocialSignUp, {
                userEmail,
                userPhoneNumber,
                isPushOn: isPushAlarmOn,
                isAlimTalkOn: isAlimTalkOn,
            }, {
                withCredentials: true,
                headers: {
                    Authorization: token,
                }
            });

            message.success('회원가입이 완료되었습니다!');
            setTimeout(() => {
                window.location.href = "/chassis/calculator";
            }, 500);
        } catch (err: unknown) {
            const axiosError = getAxiosError(err);
            const errObj = err as Record<string, unknown>;

            if (axiosError?.data?.errorCode === 1) {
                const { email, oauthType, errorMessage: errorMsg } = axiosError.data;
                window.location.href = `/login/duplicate?email=${email}&oauthType=${oauthType}&message=${errorMsg}`;
            } else if (errObj.code === 'ECONNABORTED' || (typeof errObj.message === 'string' && errObj.message.includes('timeout'))) {
                message.error('요청 시간이 초과되었습니다. 네트워크 연결을 확인하고 다시 시도해주세요.');
            } else if (!axiosError) {
                message.error('네트워크 연결을 확인할 수 없습니다. 인터넷 연결 상태를 확인해주세요.');
            } else {
                const status = axiosError.status;
                switch (status) {
                    case 401:
                        message.error('로그인이 만료되었습니다. 다시 로그인해주세요.');
                        break;
                    case 403:
                        message.error('접근 권한이 없습니다.');
                        break;
                    case 500:
                        message.error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
                        break;
                    default:
                        message.error(`회원가입에 실패했습니다. (${status || '알 수 없는 에러'})`);
                }
            }
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <>
            <Helmet>
                <meta name="robots" content="noindex, nofollow"/>
            </Helmet>
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
        </>
    );
};

export default LoginSecondStep;
