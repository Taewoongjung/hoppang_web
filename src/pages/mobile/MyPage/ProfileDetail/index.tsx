import React, { useState, useEffect } from 'react';

import './styles.css';
import '../../versatile-styles.css';

import {
    LeftOutlined,
    UserOutlined,
    PhoneOutlined,
    SafetyCertificateOutlined,
    CheckCircleOutlined,
    ExclamationCircleOutlined,
    EditOutlined,
    IdcardOutlined,
    ClockCircleOutlined,
    SendOutlined
} from '@ant-design/icons';
import useSWR from "swr";
import {callMeData, callUserProfile, callVerifyPhoneNumber} from "../../../../definition/apiPath";
import fetcher from "../../../../util/fetcher";
import axios from "axios";
import OverlayLoadingPage from "../../../../component/Loading/OverlayLoadingPage";

const ProfileEditPage = () => {

    const { data: userRealData, error, mutate } = useSWR(callMeData, fetcher, {
        dedupingInterval: 2000
    });

    const [userData, setUserData] = useState(userRealData);
    const [formData, setFormData] = useState({
        name: '',
        nickname: '',
        tel: ''
    });

    // SWR 데이터 동기화
    useEffect(() => {
        mutate();
        if (userRealData) {
            setUserData(userRealData);
        }
    }, []);

    // 또는 formData도 함께 동기화
    useEffect(() => {
        mutate();
        if (userRealData) {
            setUserData(userRealData);
            setFormData({
                name: userRealData.name || '',
                nickname: userRealData.nickname || '',
                tel: userRealData.tel || '',
            });
        }
    }, [userRealData]);

    // 개별 로딩 상태 관리
    const [loading, setLoading] = useState({
        name: false,
        nickname: false,
        tel: false,
        telVerification: false,
        requestVerification: false,
        verifyCode: false
    });

    const [editMode, setEditMode] = useState({
        name: false,
        nickname: false,
        tel: false,
    });

    // 휴대폰 인증 관련 상태
    const [phoneVerification, setPhoneVerification] = useState({
        isCodeSent: false,
        verificationCode: '',
        timeLeft: 0,
        isVerified: false,
        step: 'input', // 'input' | 'sent' | 'verified'
        canResend: false
    });
    const [requestedRevisingPhoneNumber, setRequestedRevisingPhoneNumber] = useState('');

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (phoneVerification.timeLeft > 0) {
            timer = setTimeout(() => {
                setPhoneVerification(prev => {
                    const newTimeLeft = prev.timeLeft - 1;

                    // 30초 남았을 때 재전송 버튼 활성화
                    const shouldEnableResend = newTimeLeft <= 30 && prev.isCodeSent && !prev.canResend;

                    return {
                        ...prev,
                        timeLeft: newTimeLeft,
                        canResend: shouldEnableResend || prev.canResend
                    };
                });
            }, 1000);
        } else if (phoneVerification.timeLeft === 0 && phoneVerification.isCodeSent) {
            setPhoneVerification(prev => ({
                ...prev,
                isCodeSent: false,
                verificationCode: '',
                step: 'input',
                canResend: false
            }));
        }
        return () => clearTimeout(timer);
    }, [phoneVerification.timeLeft]);

    const handleEdit = (field: string) => {
        setEditMode(prev => ({
            ...prev,
            // @ts-ignore
            [field]: !prev[field]
        }));

        // @ts-ignore
        if (!editMode[field]) {
            setFormData(prev => ({
                ...prev,
                // @ts-ignore
                [field]: userData[field]
            }));
        }

        // 휴대폰 편집 모드를 종료할 때 인증 상태 초기화
        if (field === 'tel' && editMode.tel) {
            setPhoneVerification({
                isCodeSent: false,
                verificationCode: '',
                timeLeft: 0,
                isVerified: false,
                step: 'input',
                canResend: false
            });
        }
    };

    const handleSave = async (field: string) => {
        setLoading(prev => ({ ...prev, [field]: true }));

        try {
            // 휴대폰의 경우 인증 확인
            if (field === 'tel' && !phoneVerification.isVerified) {
                alert('휴대폰 인증을 완료해주세요.');
                return;
            }

            if (field === 'name') {
                if (formData.name === userRealData.name) {
                    setEditMode(prev => ({
                        ...prev,
                        [field]: false
                    }));
                    return;
                }
            } else if (field === 'nickname') {
                if (formData.nickname === userRealData.nickname) {
                    setEditMode(prev => ({
                        ...prev,
                        [field]: false
                    }));
                    return;
                }
            } else if (field === 'tel') {
                if (formData.tel.replace(/[^0-9]/g, '') === userRealData.tel) {
                    setEditMode(prev => ({
                        ...prev,
                        [field]: false
                    }));
                    return;
                }
            }

            // 유저 정보 수정 API 호출
            let revisingName = null;
            let revisingNickname = null;
            let revisingPhoneNumber = null;

            if (field === 'name') {
                revisingName = await formData.name;
            } else if (field === 'nickname') {
                revisingNickname = await formData.nickname;
            } else if (field === 'tel') {
                revisingPhoneNumber = await formData.tel.replace(/[^0-9]/g, '');
            }

            await axios.put(
                callUserProfile.replace("{userId}", userRealData.id),
                {
                    revisingName: revisingName,
                    revisingNickname: revisingNickname,
                    revisingPhoneNumber: revisingPhoneNumber
                },
                {
                    withCredentials: true,
                    headers: {
                        Authorization: localStorage.getItem("hoppang-token") || '',
                    }
                })
                .then((res) => {
                    setUserData((prev: any) => ({
                        ...prev,
                        // @ts-ignore
                        [field]: formData[field]
                    }));

                    setEditMode(prev => ({
                        ...prev,
                        [field]: false
                    }));

                    // 휴대폰 저장 완료 시 인증 상태 초기화
                    if (field === 'tel') {
                        setPhoneVerification({
                            isCodeSent: false,
                            verificationCode: '',
                            timeLeft: 0,
                            isVerified: false,
                            step: 'input',
                            canResend: false
                        });
                    }

                    mutate();
                })
                .catch((err) => {
                    alert(err.response.data.errorMessage);
                })
        } finally {
            setLoading(prev => ({ ...prev, [field]: false }));
        }
    };

    // 인증번호 요청
    const handleRequestVerificationCode = async () => {
        if (!formData.tel.trim()) {
            alert('휴대폰 번호를 입력해주세요.');
            return;
        }

        // 숫자만 추출한 전화번호
        const reformedTel = await formData.tel.replace(/[^0-9]/g, '');

        if (!/^\d+$/.test(reformedTel)) {
            alert('숫자만 입력할 수 있습니다.');
            return;
        } else if (reformedTel.length !== 11) {
            alert('휴대폰 번호는 11자리 숫자여야 합니다.');
            return;
        }

        setLoading(prev => ({ ...prev, requestVerification: true }));

        // @ts-ignore
        setRequestedRevisingPhoneNumber(formatPhoneNumber(reformedTel));

        try {
            // 인증번호 요청 API 호출
            const response = await axios.post(callVerifyPhoneNumber,
                {
                    email: userRealData.email,
                    targetPhoneNumber: reformedTel,
                    validationType: 'PROFILE_UPDATE'
                },
                {withCredentials: true}
            );

            if (response.data === true) {
                setPhoneVerification({
                    isCodeSent: true,
                    verificationCode: '',
                    timeLeft: 180,
                    isVerified: false,
                    step: 'sent',
                    canResend: false
                });
            }

            alert(`${formData.tel}로 인증번호가 발송되었습니다.`);
        } catch (error) {
            console.error('인증번호 요청 실패:', error);
            alert('인증번호 요청에 실패했습니다.');
        } finally {
            setLoading(prev => ({ ...prev, requestVerification: false }));
        }
    };

    // 인증번호 확인
    const handleVerifyCode = async () => {
        if (!phoneVerification.verificationCode.trim()) {
            alert('인증번호를 입력해주세요.');
            return;
        }

        if (phoneVerification.verificationCode.length !== 6) {
            alert('인증번호는 6자리입니다.');
            return;
        }

        setLoading(prev => ({ ...prev, verifyCode: true }));

        try {
            const reformedTel = await formData.tel.replace(/[^0-9]/g, '');

            // 인증번호 확인 API 호출
            const response = await axios.get(
                callVerifyPhoneNumber + "?targetPhoneNumber=" + reformedTel
                    + "&compNumber=" + phoneVerification.verificationCode,
                { withCredentials: true }
            );

            if (response.data === true) {
                setPhoneVerification(prev => ({
                    ...prev,
                    isVerified: true,
                    step: 'verified'
                }));
            } else {
                alert('인증번호가 일치하지 않습니다. 다시 확인해주세요.');
                setPhoneVerification(prev => ({
                    ...prev,
                    verificationCode: ''
                }));
            }
        } catch (error) {
            console.error('인증번호 확인 실패:', error);
            alert('인증 확인에 실패했습니다.');
        } finally {
            setLoading(prev => ({ ...prev, verifyCode: false }));
        }
    };

    // 시간 포맷팅 함수
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // 전화번호 포맷팅
    const formatPhoneNumber = (value: string) => {
        const numbers = value.replace(/[^\d]/g, '');
        if (numbers.length <= 3) return numbers;
        if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    };

    const completionScore = userData ? [
        userData.name,
        userData.nickname,
        userData.tel
    ].filter(Boolean).length : 0;

    const profileComplete = completionScore >= 2;
    const completionPercentage = userData ? Math.round(([userData.name, userData.nickname, userData.tel].filter(Boolean).length / 3) * 100) : 0;


    // 로딩 처리 추가
    if (!userRealData) {
        return (
            <OverlayLoadingPage word={"로딩중"}/>
        );
    }

    return (
        <div className="profile-edit-container">
            {/* Header */}
            <header className="profile-header">
                <div className="header-content">
                    <button
                        onClick={() => window.location.href = "/v2/mypage"}
                        className="back-btn"
                    >
                        <LeftOutlined/>
                    </button>
                    <h1 className="header-title">내 정보</h1>
                    <div className="header-spacer"/>
                </div>
            </header>

            {/* Main Content */}
            <main className="profile-main">
                {/* Profile Summary */}
                <section className="profile-summary">
                    <div className="user-profile">
                        <div className="user-avatar-wrapper">
                            <div className="user-avatar-large">
                                <UserOutlined/>
                            </div>
                            <div className="avatar-badge">
                                <SafetyCertificateOutlined/>
                            </div>
                        </div>
                        <div className="user-greeting">
                            <h2 className="greeting-text">
                                {userData?.nickname || userData?.name || '사용자'}
                            </h2>
                            <p className="greeting-subtitle">호빵고객님</p>
                        </div>
                    </div>

                    {/* Profile Completion */}
                    <div className="completion-card">
                        <div className="completion-header">
                            <span className="completion-label">프로필 완성도</span>
                            <span className="completion-percentage">
                                {completionPercentage}%
                            </span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{width: `${completionPercentage}%`}}
                            />
                        </div>
                        {profileComplete ? (
                            <div className="completion-status complete">
                                <CheckCircleOutlined/>
                                <span>프로필이 완성되었어요! ✨</span>
                            </div>
                        ) : (
                            <div className="completion-status incomplete">
                                <ExclamationCircleOutlined/>
                                <span>조금만 더 완성해보세요!</span>
                            </div>
                        )}
                    </div>
                </section>

                {/* Information Sections */}
                <div className="info-sections">
                    {/* Real Name Section */}
                    <section className="info-card">
                        <div className="info-header">
                            <div className="info-label">
                                <div className="info-icon nickname-icon">
                                    <UserOutlined/>
                                </div>
                                <span>이름</span>
                            </div>
                            <button
                                onClick={() => handleEdit('name')}
                                className="edit-btn"
                            >
                                <EditOutlined/>
                            </button>
                        </div>

                        {editMode.name ? (
                            <div className="edit-form">
                                <input
                                    type="text"
                                    value={formData.name}
                                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                                        const value = e.currentTarget.value;
                                        const filtered = value.replace(/[^a-zA-Zㄱ-ㅎㅏ-ㅣ가-힣]/g, '');
                                        setFormData(prev => ({ ...prev, name: filtered }));
                                    }}
                                    className="form-input"
                                    placeholder="실명을 입력하세요"
                                    disabled={loading.name}
                                />
                                <div className="notification">
                                    <p>• 닉네임은 <strong>한글, 영어</strong>만 사용할 수 있습니다.</p>
                                    <p>• 띄어쓰기, 특수문자, 이모지는 입력할 수 없습니다.</p>
                                    <p>• 이름은 <strong>최대 10자까지</strong> 입력할 수 있습니다.</p>
                                </div>
                                <div className="form-actions">
                                    <button
                                        onClick={() => handleSave('name')}
                                        disabled={
                                            !formData.name.trim() ||
                                            formData.name.trim() === userRealData.name
                                        }
                                        className="save-btn"
                                    >
                                        {loading.name ? '저장 중...' : '저장'}
                                    </button>
                                    <button
                                        onClick={() => handleEdit('name')}
                                        className="cancel-btn"
                                        disabled={loading.name}
                                    >
                                        취소
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="info-display">
                                <span className="info-value">{userData?.name || ''}</span>
                                <CheckCircleOutlined className="status-icon verified"/>
                            </div>
                        )}
                    </section>

                    {/* Nickname Section */}
                    <section className="info-card">
                        <div className="info-header">
                            <div className="info-label">
                                <div className="info-icon realname-icon">
                                    <IdcardOutlined/>
                                </div>
                                <span>닉네임</span>
                            </div>
                            <button
                                onClick={() => handleEdit('nickname')}
                                className="edit-btn"
                            >
                                <EditOutlined/>
                            </button>
                        </div>

                        {editMode.nickname ? (
                            <div className="edit-form">
                                <input
                                    type="text"
                                    value={formData.nickname}
                                    onChange={
                                        (e) => {
                                            const value = e.currentTarget.value;
                                            const filtered = value.replace(/[^a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣_-]/g, '');
                                            setFormData(prev => ({ ...prev, nickname: filtered }));
                                        }
                                    }
                                    className="form-input"
                                    placeholder="닉네임을 입력하세요"
                                    disabled={loading.nickname}
                                />
                                <div className="notification">
                                    <p>• 닉네임은 <strong>한글, 영어, 숫자, '-'와 '_'</strong>만 사용할 수 있습니다.</p>
                                    <p>• 띄어쓰기, 특수문자, 이모지는 입력할 수 없습니다.</p>
                                    <p>• 닉네임은 <strong>최대 15자까지</strong> 입력할 수 있습니다.</p>
                                </div>
                                <div className="form-actions">
                                    <button
                                        onClick={() => handleSave('nickname')}
                                        disabled={
                                            !formData.nickname ||
                                            formData.nickname.trim() === '' ||
                                            formData.nickname.trim() === userRealData.nickname
                                        }
                                        className="save-btn"
                                    >
                                        {loading.nickname ? '저장 중...' : '저장'}
                                    </button>
                                    <button
                                        onClick={() => handleEdit('nickname')}
                                        className="cancel-btn"
                                        disabled={loading.nickname}
                                    >
                                        취소
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="info-display">
                                <span className="info-value">{userData?.nickname || ''}</span>
                                {userData?.nickname ?
                                    <CheckCircleOutlined className="status-icon verified"/> :
                                    <CheckCircleOutlined className="status-icon unverified"/>
                                }
                            </div>
                        )}
                    </section>

                    {/* Phone Section */}
                    <section className="info-card">
                        <div className="info-header">
                            <div className="info-label">
                                <div className="info-icon phone-icon">
                                    <PhoneOutlined/>
                                </div>
                                <span>휴대폰</span>
                            </div>
                            <div className="header-actions">
                                {userData?.tel ? (
                                    <span className="status-badge verified">
                                        인증완료
                                    </span>
                                ) : (
                                    <span className="status-badge unverified">
                                        인증필요
                                    </span>
                                )}
                                <button
                                    onClick={() => handleEdit('tel')}
                                    className="edit-btn"
                                >
                                    <EditOutlined/>
                                </button>
                            </div>
                        </div>

                        {editMode.tel ? (
                            <div className="edit-form">
                                {/* 휴대폰 번호 입력 */}
                                <div className="phone-verification-container">
                                    <div className="phone-input-wrapper">
                                        <input
                                            type="tel"
                                            inputMode="numeric"
                                            value={formData.tel}
                                            onChange={(e) => {
                                                const formatted = formatPhoneNumber(e.target.value);
                                                setFormData(prev => ({...prev, tel: formatted}));
                                            }}
                                            className="form-input phone-input"
                                            placeholder="010-1234-5678"
                                            disabled={loading.tel || phoneVerification.isCodeSent}
                                            maxLength={13}
                                        />

                                        {phoneVerification.step !== 'verified' &&
                                            <button
                                                onClick={handleRequestVerificationCode}
                                                disabled={
                                                    (formData.tel.replace(/[^0-9]/g, '').length < 11) ||
                                                    (formData.tel.replace(/[^0-9]/g, '') === userRealData.tel) ||
                                                    (phoneVerification.isCodeSent && !phoneVerification.canResend)
                                                }
                                                className={`verification-request-btn ${phoneVerification.isCodeSent ? 'resend' : ''}`}
                                            >
                                                {loading.requestVerification ? (
                                                    <>
                                                        <div className="mini-spinner"></div>
                                                        요청중...
                                                    </>
                                                ) : phoneVerification.isCodeSent && !phoneVerification.canResend ? (
                                                    <>
                                                        발송됨
                                                    </>
                                                ) : (
                                                    <>
                                                        <SendOutlined/>
                                                        {phoneVerification.isCodeSent ? '재전송' : '인증번호 요청'}
                                                    </>
                                                )}
                                            </button>
                                        }
                                    </div>

                                    {/* 인증번호 입력 섹션 */}
                                    {phoneVerification.step === 'sent' && (
                                        <div className="verification-code-section">
                                            <div className="verification-status">
                                                <div className="status-indicator sending">
                                                    <SendOutlined/>
                                                </div>
                                                <div className="status-text">
                                                    <div className="status-title">인증번호가 발송되었습니다</div>
                                                    <div className="status-subtitle">
                                                        {requestedRevisingPhoneNumber}로 전송된 6자리 숫자를 입력해주세요
                                                    </div>
                                                </div>
                                                <div className="timer-display">
                                                    <ClockCircleOutlined/>
                                                    <span>{formatTime(phoneVerification.timeLeft)}</span>
                                                </div>
                                            </div>

                                            <div className="verification-input-group">
                                                <input
                                                    inputMode="numeric"
                                                    value={phoneVerification.verificationCode}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/[^0-9]/g, '');
                                                        if (value.length <= 6) {
                                                            setPhoneVerification(prev => ({
                                                                ...prev,
                                                                verificationCode: value
                                                            }));
                                                        }
                                                    }}
                                                    className="verification-code-input"
                                                    placeholder="인증번호"
                                                    maxLength={6}
                                                    disabled={loading.verifyCode}
                                                />
                                                <button
                                                    onClick={handleVerifyCode}
                                                    disabled={
                                                        loading.verifyCode ||
                                                        phoneVerification.verificationCode.length !== 6
                                                    }
                                                    className="verify-code-btn"
                                                >
                                                    {loading.verifyCode ? (
                                                        <>
                                                            <div className="mini-spinner"></div>
                                                            확인중...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircleOutlined/>
                                                            확인
                                                        </>
                                                    )}
                                                </button>
                                            </div>

                                            <div className="verification-help">
                                                <p>• 인증번호가 수신되지 않나요? <strong>SMS 차단 설정</strong>을 확인하시고, <strong>재시도</strong>해주세요.</p>
                                                <p>• 그래도 메시지를 수신하지 못하셨다면, <strong>스팸 메시지함</strong>을 확인해주세요.</p>
                                                <p>• 여전히 수신되지 않는 경우, <strong><u><a href="/v2/counsel">고객센터</a></u></strong>로 문의해 주시면 안내해드립니다.</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* 인증 완료 섹션 */}
                                    {phoneVerification.step === 'verified' && (
                                        <div className="verification-success-section">
                                            <div className="verification-status success">
                                                <div className="status-indicator verified">
                                                    <CheckCircleOutlined/>
                                                </div>
                                                <div className="status-text">
                                                    <div className="status-title">휴대폰 인증이 완료되었습니다!</div>
                                                    <div className="status-subtitle">
                                                        이제 휴대폰 번호를 저장할 수 있습니다
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="form-actions">
                                    {
                                        <button
                                            onClick={() => handleSave('tel')}
                                            disabled={
                                                !(phoneVerification.isVerified && phoneVerification.isCodeSent)
                                            }
                                            className="save-btn"
                                        >
                                            {loading.tel ? '저장 중...' : '저장'}
                                        </button>
                                    }
                                    <button
                                        onClick={() => handleEdit('tel')}
                                        className="cancel-btn"
                                        disabled={loading.tel}
                                    >
                                        취소
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="info-content">
                                <div className="info-display">
                                    <span className="info-value">{userData?.tel || ''}</span>
                                    {userData?.tel ? (
                                        <CheckCircleOutlined className="status-icon verified"/>
                                    ) : (
                                        <ExclamationCircleOutlined className="status-icon unverified"/>
                                    )}
                                </div>
                            </div>
                        )}
                    </section>
                </div>

                {/* Security Info */}
                <section className="security-info">
                    <div className="security-content">
                        <div className="security-icon">
                            <SafetyCertificateOutlined/>
                        </div>
                        <div className="security-text">
                            <h3>🔒 개인정보 보호</h3>
                            <p>
                                호빵은 회원님의 개인정보를 안전하게 보호합니다.
                                모든 정보는 암호화되어 저장되며, 본인만 수정 가능합니다.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default ProfileEditPage;
