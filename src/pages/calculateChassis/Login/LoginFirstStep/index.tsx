import React, { useState, useEffect } from 'react';
import {Input, Button, Space} from 'antd';
import axios from 'axios';
import {callMeData, callVerifyPhoneNumber} from "../../../../definition/apiPath";
import useSWR from "swr";
import fetcher from "../../../../util/fetcher";

const VALIDATION_SENT_MESSAGE = (
    <>
        문자로 인증번호를 보내드렸어요.<br/>
        문자가 안 오면 휴대폰번호 확인 후 재시도를 눌러주세요.
    </>
);
const VALIDATION_PROPOSAL_MESSAGE = '확인 버튼을 눌러 인증을 진행해 주세요.';
const VALIDATION_ERROR_MESSAGE = '인증번호가 틀렸습니다. 다시 확인 해주세요.'
const VALIDATION_NUMBER_SUCCESS_MESSAGE = '인증 요청을 해주세요.';

const LoginFirstStep = () => {

    const urlParams = new URLSearchParams(window.location.search);

    const [targetPhoneNumber, setTargetPhoneNumber] = useState('');
    const [feedback, setFeedback] = useState('');
    const [requestedValidation, setRequestedValidation] = useState(false);
    const [feedbackForValidationNumber, setFeedbackForValidationNumber] = useState('');

    const [validationNumber, setValidationNumber] = useState('');
    const [timer, setTimer] = useState(180); // 3분 (180초) 타이머
    const [compErrMessage, setCompErrMessage] = useState('');

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
    }

    // 타이머가 감소하는 로직
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

            // 컴포넌트가 언마운트되면 타이머를 클리어
            return () => clearInterval(countdown);
        }
    }, [requestedValidation, timer]);

    const handleInputChange = (e: { target: { value: any; }; }) => {
        const value = e.target.value;
        validatePhoneNumber(value);
        setTargetPhoneNumber(value);
    };

    const validatePhoneNumber = (value: string) => {
        if (!value) {
            setFeedback('');
            return;
        }

        // 010으로 시작하는 11자리 숫자 체크
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

    // 휴대폰 검증하기 요청
    const clickVerifyPhoneNumber = async () => {
        const validationType = "SIGN_UP";
        await axios.post(callVerifyPhoneNumber,
            {
                email: urlParams.get("userEmail"),
                targetPhoneNumber,
                validationType
            },
            { withCredentials: true }
        ).then((response) => {
            if (response.data === true) {
                setRequestedValidation(true);
                setTimer(180); // 타이머 리셋
            }
        }).catch((err) => {
            if (err.response.data.errorCode === 1) {
                const email = err.response.data.email;
                const oauthType = err.response.data.oauthType;
                const message = err.response.data.errorMessage;
                localStorage.setItem("hoppang-token", 'undefined'); // 이미 해당 유저에 겹치는 로그인을 하면 토큰 삭제 (카카오톡으로 소셜로그인을 했었는데 애플로 다시 하려고 하는 경우)
                localStorage.setItem("hoppang-login-oauthType", 'undefined'); // 로그인 타입 초기화
                window.location.href = "/login/duplicate?email=" + email + "&oauthType=" + oauthType + "&message=" + message;
            }
        });
    };

    const handleValidationNumberChange = (e: { target: { value: any; }; }) => {
        const value = e.target.value;
        validateValidationNumber(value);
        setValidationNumber(value);
    };

    const validateValidationNumber = (value: string) => {
        if (!value) {
            setFeedbackForValidationNumber('');
            return;
        }

        if (!value) {
            setFeedbackForValidationNumber('인증번호를 입력해 주세요.');
            return;
        } else if (value.length !== 6) {
            setFeedbackForValidationNumber('인증번호는 6자리여야 합니다.');
            return;
        } else if (!/^\d+$/.test(value)) {
            setFeedbackForValidationNumber('숫자만 입력할 수 있습니다.');
            return;
        } else {
            setFeedbackForValidationNumber('인증 버튼을 눌러 인증 요청을 진행해 주세요.');
            return;
        }
    };

    const clickValidationNumber = async () => {
        await axios.get(callVerifyPhoneNumber + "?targetPhoneNumber=" + targetPhoneNumber + "&compNumber=" + validationNumber,
            {withCredentials: true})
            .then((response) => {
                if (response.data === true) {
                    window.location.href = "/login/second?phoneNumber=" + targetPhoneNumber +"&userEmail=" + urlParams.get("userEmail");
                }
            }).catch((error) => {
                setValidationNumber('')
                setCompErrMessage(VALIDATION_ERROR_MESSAGE);
            });
    }

    // 타이머를 "분:초" 형식으로 변환
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? `0${secs}` : secs}`;
    };

    const renderTelValidationFeedBackMessage = () => {
        if (requestedValidation) {
            return <p style={{color: 'green'}}>{VALIDATION_SENT_MESSAGE}</p>;
        }

        return(<>
                <h3>휴대폰 인증을 해주세요. (- 없이 입력 해주세요)</h3>
                {feedback && <p style={{color: feedback === VALIDATION_PROPOSAL_MESSAGE ? 'green' : 'red'}}>{feedback}</p>}
            </>
        );
    }

    const renderTelValidationNumberRequestButton = () => {

        let buttonName = !requestedValidation ? '확인' : '재시도';

        if (feedback !== VALIDATION_PROPOSAL_MESSAGE) {
            return <Button type="primary" style={styles.validationRequestInputButton} disabled>
                확인
            </Button>;
        }

        return <Button type="primary" style={styles.validationRequestInputButton} onClick={clickVerifyPhoneNumber}>
            {buttonName}
        </Button>;
    }

    const renderTelValidationRequestButton = () => {

        if (!validationNumber) {
            return <Button type="primary" style={styles.validationButton} disabled>인증</Button>;
        }

        return <Button type="primary" style={styles.validationButton} onClick={clickValidationNumber}>인증</Button>;
    }

    const renderValidationNumberFeedBackMessage = () => {
        return (
            <>
                {feedbackForValidationNumber &&
                    <p style={{color: feedbackForValidationNumber === VALIDATION_NUMBER_SUCCESS_MESSAGE ? 'green' : 'red'}}>
                        {feedbackForValidationNumber}
                    </p>
                }
            </>
        );
    }


    return (
        <div className="login-container" style={styles.container}>
            <div className="login-box" style={styles.box}>
                <>
                    {/* 피드백 메시지 */}
                    {renderTelValidationFeedBackMessage()}
                    <div>
                        <Input
                            style={{
                                ...styles.validationRequestInput,
                                borderColor: feedback === VALIDATION_PROPOSAL_MESSAGE ? 'green' : // 전화번호가 입력 되면 시작
                                    !targetPhoneNumber ? '' : 'red',
                            }}

                            value={targetPhoneNumber}
                            onChange={handleInputChange}
                            placeholder="01012345678"
                            type="tel"
                            maxLength={11}
                        />

                        { renderTelValidationNumberRequestButton() }
                    </div>
                </>
                {requestedValidation &&
                    <>
                        <br/>
                        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                            <Space.Compact>
                                <Input
                                    style = {{
                                        ...styles.validationInput,
                                        borderColor: compErrMessage === VALIDATION_ERROR_MESSAGE ? 'red' : '',
                                    }}
                                    value = {validationNumber}
                                    onChange = {handleValidationNumberChange}
                                    placeholder = {compErrMessage ? compErrMessage : "인증번호 입력"}
                                />

                                { renderTelValidationRequestButton() }
                            </Space.Compact>

                            {requestedValidation &&
                                <p style={{color: 'red', marginLeft: '10px'}}>{formatTime(timer)}</p>
                            }
                        </div>
                        { renderValidationNumberFeedBackMessage() }
                    </>
                }
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        width: '100%',
        height: '100vh',
    },
    box: {
        borderRadius: '15px',
        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        width: '100%',
        maxWidth: '700px',
        padding: '60px',
    },
    validationRequestInput: {
        fontSize: '20px',
        width: '300px',
        height: '70px',
        cursor: 'pointer',
        padding: 0,
        overflow: 'hidden',
        borderRadius: '10px',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    },
    validationInput: {
        fontSize: '15px',
        width: '280px',
        height: '50px',
        cursor: 'pointer',
        padding: 0,
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    },
    validationRequestInputButton: {
        fontSize: '20px',
        width: '80px',
        height: '70px',
        borderRadius: '10px',
        marginLeft: '5px'
    },
    validationButton: {
        fontSize: '20px',
        height: '50px',
    }
};

export default LoginFirstStep;
