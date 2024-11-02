import React, { useState, useEffect } from 'react';
import {Input, Button, Space, Modal} from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import {callMeData, callVerifyPhoneNumber} from "../../../../definition/apiPath";
import useSWR from "swr";
import fetcher from "../../../../util/fetcher";

const LoginFirstStep = () => {

    const urlParams = new URLSearchParams(window.location.search);

    const [targetPhoneNumber, setTargetPhoneNumber] = useState('');
    const [feedback, setFeedback] = useState('');
    const [requestedValidation, setRequestedValidation] = useState(false);

    const [validationNumber, setValidationNumber] = useState('');
    const [timer, setTimer] = useState(180); // 3분 (180초) 타이머

    const { data: userData, error, mutate } = useSWR(callMeData, fetcher, {
        dedupingInterval: 2000
    });

    const allReset = () => {
        setTargetPhoneNumber('');
        setFeedback('');
        setRequestedValidation(false);
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

    const validatePhoneNumber = (value: string) => {
        // 010으로 시작하는 11자리 숫자 체크
        const phoneRegex = /^010\d{8}$/;

        if (!value) {
            setFeedback('휴대폰 번호를 입력해 주세요.');
        } else if (!/^\d+$/.test(value)) {
            setFeedback('숫자만 입력 가능합니다.');
        } else if (value.length !== 11) {
            setFeedback('휴대폰 번호는 11자리여야 합니다.');
        } else if (!phoneRegex.test(value)) {
            setFeedback('010으로 시작하는 11자리 번호를 입력해 주세요.');
        } else {
            setFeedback('유효한 번호입니다.');
        }
    };

    const handleInputChange = (e: { target: { value: any; }; }) => {
        const value = e.target.value;
        setTargetPhoneNumber(value);
        validatePhoneNumber(value);
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
        setValidationNumber(value);
    };

    const clickValidationNumber = async () => {
        await axios.get(callVerifyPhoneNumber + "?targetPhoneNumber=" + targetPhoneNumber + "&compNumber=" + validationNumber,
            {withCredentials: true})
            .then((response) => {
                if (response.data === true) {
                    window.location.href = "/login/second?phoneNumber=" + targetPhoneNumber +"&userEmail=" + urlParams.get("userEmail");
                }
            }).catch((error) => {
                showModal();
                setCompErrMessage(error.response.data.errorMessage);
            });
    }

    // 타이머를 "분:초" 형식으로 변환
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? `0${secs}` : secs}`;
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [compErrMessage, setCompErrMessage] = useState('');

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };


    return (
        <div className="login-container" style={styles.container}>
            <div className="login-box" style={styles.box}>

                {/* 회원가입 종료 */}
                <LeftOutlined
                    onClick={() => {
                        window.location.href = "/mypage";
                    }}
                    style={{marginRight: '100%', fontSize: '40px', marginBottom: '50px', color: 'blue'}}
                />

                {urlParams.get("applelogin") === "true" && "애플 로그인 ~"}

                {!requestedValidation && (
                    <>
                        <h3>휴대폰 인증을 해주세요. (- 없이 입력 해주세요)</h3>
                        <div>
                            <Input
                                style={styles.input}
                                value={targetPhoneNumber}
                                onChange={handleInputChange}
                                placeholder="01012345678"
                                maxLength={11}
                            />

                            {feedback === '유효한 번호입니다.' ?
                                <Button type="primary" style={styles.button}
                                        onClick={clickVerifyPhoneNumber}>확인</Button> :
                                <Button type="primary" style={styles.button} disabled>확인</Button>
                            }
                        </div>

                        {/* 피드백 메시지 */}
                        {(!requestedValidation && feedback) &&
                            <p style={{color: feedback === '유효한 번호입니다.' ? 'green' : 'red'}}>{feedback}</p>}
                    </>
                )}

                {requestedValidation &&
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        <Space.Compact>
                            <Input
                                style={styles.input1}
                                value={validationNumber}
                                onChange={handleValidationNumberChange}
                                placeholder="인증번호 입력"
                            />
                            <Button type="primary" style={styles.button1} onClick={clickValidationNumber}>인증</Button>
                        </Space.Compact>

                        <p style={{color: 'red', marginLeft: '10px'}}>{formatTime(timer)}</p>
                    </div>
                }
            </div>

            <Modal open={isModalOpen}
                   okText={"재시도"}
                   onOk={handleOk}
                   footer={[
                       <Button key="submit" type="primary" onClick={handleOk}>
                           재시도
                       </Button>,
                   ]}
                   closeIcon={null}
            >
                <p>{compErrMessage}</p>
            </Modal>
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
    input: {
        fontSize: '20px',
        width: '300px',
        height: '70px',
        cursor: 'pointer',
        padding: 0,
        overflow: 'hidden',
        borderRadius: '10px',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    },
    input1: {
        fontSize: '20px',
        width: '300px',
        height: '70px',
        cursor: 'pointer',
        padding: 0,
        overflow: 'hidden',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    },
    button: {
        fontSize: '20px',
        width: '80px',
        height: '70px',
        borderRadius: '10px',
        marginLeft: '5px'
    },
    button1: {
        fontSize: '20px',
        height: '70px',
    }
};

export default LoginFirstStep;
