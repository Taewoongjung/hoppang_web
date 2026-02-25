import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

import './styles.css';
import '../versatile-styles.css';

import {Input, Button, Divider} from 'antd';
import axios from 'axios';
import { callMeData, callVerifyPhoneNumber } from "../../../definition/apiPath";
import useSWR from "swr";
import fetcher from "../../../util/fetcher";


const VALIDATION_SENT_MESSAGE = (
    <>
        문자로 인증번호를 보내드렸어요.<br/>
        문자가 안 오면 휴대폰번호 확인 후 재시도를 눌러주세요.
    </>
);
const VALIDATION_PROPOSAL_MESSAGE = '확인 버튼을 눌러 인증을 진행해 주세요.';
const VALIDATION_ERROR_MESSAGE = '인증번호가 틀렸습니다. 다시 확인 해주세요.'
const VALIDATION_NUMBER_SUCCESS_MESSAGE = '인증 요청을 해주세요.';
const PLEASE_REQUEST_VALIDATION_MESSAGE = '인증 버튼을 눌러 인증 요청을 진행해 주세요.';

const LoginFirstStep = () => {
    const urlParams = new URLSearchParams(window.location.search);

    const [targetPhoneNumber, setTargetPhoneNumber] = useState('');
    const [feedback, setFeedback] = useState('');
    const [requestedValidation, setRequestedValidation] = useState(false);
    const [feedbackForValidationNumber, setFeedbackForValidationNumber] = useState('');
    const [validationNumber, setValidationNumber] = useState('');
    const [timer, setTimer] = useState(180);
    const [compErrMessage, setCompErrMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);


    const { data: userData, error, mutate } = useSWR(callMeData, fetcher, {
        dedupingInterval: 2000
    });

    const allReset = () => {
        setTargetPhoneNumber('');
        setFeedback('');
        setRequestedValidation(false);
        setFeedbackForValidationNumber('');
        setValidationNumber('');
        setTimer(180);
        setCompErrMessage('');
    }

    useEffect(() => {
        if (requestedValidation && timer > 0) {
            const countdown = setInterval(() => {
                setTimer((prevTimer) => {
                    if (prevTimer === 1) {
                        clearInterval(countdown);
                        allReset();
                    }
                    return prevTimer - 1;
                });
            }, 1000);

            return () => clearInterval(countdown);
        }
    }, [requestedValidation, timer]);

    const handleInputChange = (e: { target: { value: any; }; }) => {
        const value = e.target.value;
        validatePhoneNumber(value);
        setTargetPhoneNumber(value);
        setCompErrMessage(''); // 입력 시 에러 메시지 클리어
    };

    const validatePhoneNumber = (value: string) => {
        if (!value) {
            setFeedback('');
            return;
        }

        const phoneRegex = /^010\d{8}$/;

        if (!/^\d+$/.test(value)) {
            setFeedback('숫자만 입력할 수 있습니다.');
            return;
        } else if (value.length !== 11) {
            setFeedback('휴대폰 번호는 11자리 숫자여야 합니다.');
            return;
        } else if (!phoneRegex.test(value)) {
            setFeedback('휴대폰 번호는 010으로 시작하는 11자리 숫자여야 합니다.');
            return;
        } else {
            setFeedback('확인 버튼을 눌러 인증을 진행해 주세요.');
            return;
        }
    };

    const clickVerifyPhoneNumber = async () => {
        setIsLoading(true);
        const validationType = "SIGN_UP";

        try {
            const response = await axios.post(callVerifyPhoneNumber,
                {
                    email: urlParams.get("userEmail"),
                    targetPhoneNumber,
                    validationType
                },
                { withCredentials: true }
            );

            if (response.data === true) {
                setRequestedValidation(true);
                setTimer(180);
            }
        } catch (err) {
            if (err.response?.data?.errorCode === 1) {
                const email = err.response.data.email;
                const oauthType = err.response.data.oauthType;
                const message = err.response.data.errorMessage;
                localStorage.setItem("hoppang-token", 'undefined');
                localStorage.setItem("hoppang-login-oauthType", 'undefined');
                window.location.href = "/login/duplicate?email=" + email + "&oauthType=" + oauthType + "&message=" + message;
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleValidationNumberChange = (e: { target: { value: any; }; }) => {
        const value = e.target.value;
        validateValidationNumber(value);
        setValidationNumber(value);
        setCompErrMessage(''); // 입력 시 에러 메시지 클리어
    };

    const validateValidationNumber = (value: string) => {
        if (!value) {
            setFeedbackForValidationNumber('');
            return;
        }

        if (value.length !== 6) {
            setFeedbackForValidationNumber('인증번호는 6자리여야 합니다.');
            return;
        } else if (!/^\d+$/.test(value)) {
            setFeedbackForValidationNumber('숫자만 입력할 수 있습니다.');
            return;
        } else {
            setFeedbackForValidationNumber(PLEASE_REQUEST_VALIDATION_MESSAGE);
            return;
        }
    };

    const clickValidationNumber = async () => {
        setIsLoading(true);

        try {
            const response = await axios.get(
                callVerifyPhoneNumber + "?targetPhoneNumber=" + targetPhoneNumber + "&compNumber=" + validationNumber,
                { withCredentials: true }
            );

            if (response.data === true) {
                window.location.href = "/v2/login/second?phoneNumber=" + targetPhoneNumber + "&userEmail=" + urlParams.get("userEmail");
            }
        } catch (error) {
            setValidationNumber('');
            setCompErrMessage(VALIDATION_ERROR_MESSAGE);
        } finally {
            setIsLoading(false);
        }
    }

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? `0${secs}` : secs}`;
    };

    const isPhoneNumberValid = feedback === VALIDATION_PROPOSAL_MESSAGE;
    const isValidationNumberValid = validationNumber.length === 6 && /^\d+$/.test(validationNumber);

    const mandatoryStepNotice = () => {
        const isFirstStep = urlParams.get("firstProcess");
        const isRemainedProcess = urlParams.get("remainedProcess");

        if (isFirstStep === "true" && isFirstStep) {
            return (
                <div className="info-banner first-step">
                    <div className="banner-icon">✨</div>
                    <div className="banner-content">
                        <div className="banner-title">서비스 이용을 위한 추가 정보</div>
                        <div className="banner-description">
                            호빵의 모든 서비스를 원활하게 이용하기 위해 추가 회원정보가 필요해요.
                        </div>
                    </div>
                </div>
            );
        }

        if (isRemainedProcess === "true" && isRemainedProcess) {
            return (
                <div className="alert-banner">
                    <div className="alert-icon">🔒</div>
                    <div className="alert-content">
                        <strong>마지막 단계만 남았어요!</strong>
                        <span>견적 확인을 위해 추가 정보를 입력해 주세요.</span>
                    </div>
                </div>
            );
        }

        return null;
    }


    return (
        <>
            <Helmet>
                <meta name="robots" content="noindex, nofollow"/>
            </Helmet>
            <div className="login-container">
            {/* Header */}
            <header className="login-header">
                <div className="header-content">
                    <div className="logo-container">
                        <img src="/assets/hoppang-character.png" alt="Hoppang Logo" className="logo-img" />
                        <span className="logo-text">호빵</span>
                    </div>
                </div>
            </header>

            <div className="login-content">
                {/* Progress Bar */}
                <div className="progress-container">
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: '50%' }}></div>
                    </div>
                    <span className="progress-text">1/2 단계</span>
                </div>

                {/* Mandatory Step Notice */}
                {mandatoryStepNotice()}

                {/* Main Form */}
                <div className="form-container">
                    {!requestedValidation ? (
                        <div className="phone-verification-section">
                            <div className="section-header">
                                <h2 className="section-title">휴대폰 인증</h2>
                            </div>

                            <Divider className="divider" />

                            <div className="input-group">
                                <label className="input-label">휴대폰 번호 (-없이 입력)</label>
                                <div className="input-container">
                                    <Input
                                        className={`phone-input ${isPhoneNumberValid ? 'valid' : feedback && !isPhoneNumberValid ? 'error' : ''}`}
                                        value={targetPhoneNumber}
                                        onChange={handleInputChange}
                                        placeholder="01012345678"
                                        type="tel"
                                        inputMode="numeric"
                                        pattern="\d*"
                                        maxLength={11}
                                        size="large"
                                    />
                                    <Button
                                        type="primary"
                                        size="large"
                                        className={`verify-btn ${isPhoneNumberValid ? 'active' : ''}`}
                                        disabled={!isPhoneNumberValid || isLoading}
                                        onClick={clickVerifyPhoneNumber}
                                        loading={isLoading}
                                    >
                                        인증요청
                                    </Button>
                                </div>

                                {feedback && (
                                    <div className={`feedback-message ${isPhoneNumberValid ? 'success' : 'error'}`}>
                                        {isPhoneNumberValid ? '✓ ' : '⚠ '}{feedback}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="verification-section">
                            <div className="section-header">
                                <h2 className="section-title">인증번호 입력</h2>
                                <div className="sent-message">
                                    <div className="message-icon">📱</div>
                                    <div className="message-content">
                                        <p>인증번호를 <u><strong>{targetPhoneNumber}</strong></u>로 발송했습니다.</p>
                                        <div className="help-message">
                                            <div className="help-step">
                                                <span className="step-number">1</span>
                                                <span>문자가 오지 않으면 <strong>스팸보관함</strong>을 확인해 주세요</span>
                                            </div>
                                            <div className="help-step">
                                                <span className="step-number">2</span>
                                                <span>스팸보관함에도 없다면 번호 확인 후 재발송해 주세요</span>
                                            </div>
                                            <div className="help-step">
                                                <span className="step-number">3</span>
                                                <span>계속 문제가 있다면 <strong>관리자</strong>에게 문의해 주세요</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="input-group">
                                <div className="verification-header">
                                    <label className="input-label">인증번호 6자리</label>
                                    <div className="timer-container">
                                        <span className="timer">{formatTime(timer)}</span>
                                    </div>
                                </div>

                                <div className="verification-input-wrapper">
                                    <Input
                                        className={`verification-input ${compErrMessage ? 'error' : isValidationNumberValid ? 'valid' : ''}`}
                                        value={validationNumber}
                                        onChange={handleValidationNumberChange}
                                        placeholder={compErrMessage || "인증번호 입력"}
                                        inputMode="numeric"
                                        pattern="\d*"
                                        maxLength={6}
                                        size="large"
                                    />
                                </div>

                                {feedbackForValidationNumber && !compErrMessage && (
                                    <div className={`feedback-message ${[VALIDATION_NUMBER_SUCCESS_MESSAGE, PLEASE_REQUEST_VALIDATION_MESSAGE].includes(feedbackForValidationNumber) ? 'success' : 'error'}`}>
                                        {[VALIDATION_NUMBER_SUCCESS_MESSAGE, PLEASE_REQUEST_VALIDATION_MESSAGE].includes(feedbackForValidationNumber) ? '✓ ' : '⚠ '}{feedbackForValidationNumber}
                                    </div>
                                )}

                                {compErrMessage && (
                                    <div className="feedback-message error">
                                        ⚠ {compErrMessage}
                                    </div>
                                )}
                            </div>

                            <div className="action-buttons">
                                <Button
                                    type="primary"
                                    size="large"
                                    className={`primary-action-btn ${isValidationNumberValid ? 'active' : ''}`}
                                    disabled={!isValidationNumberValid || isLoading}
                                    onClick={clickValidationNumber}
                                    loading={isLoading}
                                    block
                                >
                                    인증 완료
                                </Button>

                                <div className="secondary-actions">
                                    <Button
                                        type="link"
                                        className="resend-btn"
                                        onClick={clickVerifyPhoneNumber}
                                        disabled={isLoading}
                                        icon={<span className="resend-icon">↻</span>}
                                    >
                                        재발송
                                    </Button>

                                    <Button
                                        type="link"
                                        className="change-number-btn"
                                        onClick={allReset}
                                        disabled={isLoading}
                                    >
                                        번호 변경
                                    </Button>

                                    <Button
                                        type="link"
                                        className="customer-service-btn"
                                        onClick={() => window.location.href = 'http://pf.kakao.com/_dbxezn/chat'}
                                        disabled={isLoading}
                                    >
                                        관리자문의
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
        </>
    );
};

export default LoginFirstStep;
