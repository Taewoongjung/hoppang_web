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
    IdcardOutlined
} from '@ant-design/icons';
import useSWR from "swr";
import {callMeData, callUserProfile} from "../../../../definition/apiPath";
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
    });

    const [editMode, setEditMode] = useState({
        name: false,
        nickname: false,
        tel: false,
    });

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
    };

    const handleSave = async (field: string) => {
        setLoading(prev => ({ ...prev, [field]: true }));

        try {
            // API 호출 시뮬레이션
            await new Promise(resolve => {
                let revisingName = null;
                let revisingNickname = null;
                let revisingPhoneNumber = null;

                if (field === 'name') {
                    revisingName = formData.name;
                } else if (field === 'nickname') {
                    revisingNickname = formData.nickname;
                } else if (field === 'tel') {
                    revisingPhoneNumber = formData.tel;
                }

                axios.put(
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

                        mutate();
                    })
            });

        } catch (error) {
            console.error('저장 실패:', error);
        } finally {
            setLoading(prev => ({ ...prev, [field]: false }));
        }
    };

    const handleVerification = async (type: string) => {
        const loadingKey = `${type}Verification`;
        setLoading(prev => ({ ...prev, [loadingKey]: true }));

        try {
            // 인증 API 호출 시뮬레이션
            await new Promise(resolve => setTimeout(resolve, 2000));

            if (type === 'tel') {
                setUserData((prev: any) => ({ ...prev, isPhoneVerified: true }));
            } else if (type === 'email') {
                setUserData((prev: any) => ({ ...prev, isEmailVerified: true }));
            }
        } catch (error) {
            console.error('인증 실패:', error);
        } finally {
            setLoading(prev => ({ ...prev, [loadingKey]: false }));
        }
    };

    const completionScore = userData ? [
        userData.name,
        userData.tel && userData.isPhoneVerified,
        userData.email && userData.isEmailVerified
    ].filter(Boolean).length : 0;

    const profileComplete = completionScore >= 2;
    const completionPercentage = userData ? Math.round(([userData.name, userData.isPhoneVerified, userData.isEmailVerified].filter(Boolean).length / 3) * 100) : 0;

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
                        <LeftOutlined />
                    </button>
                    <h1 className="header-title">내 정보</h1>
                    <div className="header-spacer" />
                </div>
            </header>

            {/* Main Content */}
            <main className="profile-main">
                {/* Profile Summary */}
                <section className="profile-summary">
                    <div className="user-profile">
                        <div className="user-avatar-wrapper">
                            <div className="user-avatar-large">
                                <UserOutlined />
                            </div>
                            <div className="avatar-badge">
                                <SafetyCertificateOutlined />
                            </div>
                        </div>
                        <div className="user-greeting">
                            <h2 className="greeting-text">
                                {userData?.nickname || userData?.name || '사용자'}님
                            </h2>
                            <p className="greeting-subtitle">호빵과 함께하는 창고 여행</p>
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
                                style={{ width: `${completionPercentage}%` }}
                            />
                        </div>
                        {profileComplete ? (
                            <div className="completion-status complete">
                                <CheckCircleOutlined />
                                <span>프로필이 완성되었어요! ✨</span>
                            </div>
                        ) : (
                            <div className="completion-status incomplete">
                                <ExclamationCircleOutlined />
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
                                <div className="info-icon realname-icon">
                                    <IdcardOutlined />
                                </div>
                                <span>이름</span>
                            </div>
                            <button
                                onClick={() => handleEdit('name')}
                                className="edit-btn"
                                disabled={loading.name}
                            >
                                <EditOutlined />
                            </button>
                        </div>

                        {editMode.name ? (
                            <div className="edit-form">
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="form-input"
                                    placeholder="실명을 입력하세요"
                                    disabled={loading.name}
                                />
                                <div className="form-actions">
                                    <button
                                        onClick={() => handleSave('name')}
                                        disabled={loading.name || !formData.name.trim()}
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
                                <CheckCircleOutlined className="status-icon verified" />
                            </div>
                        )}
                    </section>

                    {/* Nickname Section */}
                    <section className="info-card">
                        <div className="info-header">
                            <div className="info-label">
                                <div className="info-icon nickname-icon">
                                    <UserOutlined />
                                </div>
                                <span>닉네임</span>
                            </div>
                            <button
                                onClick={() => handleEdit('nickname')}
                                className="edit-btn"
                                disabled={loading.nickname}
                            >
                                <EditOutlined />
                            </button>
                        </div>

                        {editMode.nickname ? (
                            <div className="edit-form">
                                <input
                                    type="text"
                                    value={formData.nickname}
                                    onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                                    className="form-input"
                                    placeholder="닉네임을 입력하세요"
                                    disabled={loading.nickname}
                                />
                                <div className="form-actions">
                                    <button
                                        onClick={() => handleSave('nickname')}
                                        disabled={loading.nickname}
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
                                    <CheckCircleOutlined className="status-icon verified" /> :
                                    <CheckCircleOutlined className="status-icon unverified" />
                                }
                            </div>
                        )}
                    </section>

                    {/* Phone Section */}
                    <section className="info-card">
                        <div className="info-header">
                            <div className="info-label">
                                <div className="info-icon phone-icon">
                                    <PhoneOutlined />
                                </div>
                                <span>휴대폰</span>
                            </div>
                            <div className="header-actions">
                                {userData?.isPhoneVerified ? (
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
                                    disabled={loading.tel || loading.telVerification}
                                >
                                    <EditOutlined />
                                </button>
                            </div>
                        </div>

                        {editMode.tel ? (
                            <div className="edit-form">
                                <input
                                    type="tel"
                                    value={formData.tel}
                                    onChange={(e) => setFormData(prev => ({ ...prev, tel: e.target.value }))}
                                    className="form-input"
                                    placeholder="휴대폰 번호를 입력하세요"
                                    disabled={loading.tel}
                                />
                                <div className="form-actions">
                                    <button
                                        onClick={() => handleSave('tel')}
                                        disabled={loading.tel || !formData.tel.trim()}
                                        className="save-btn"
                                    >
                                        {loading.tel ? '저장 중...' : '저장'}
                                    </button>
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
                                    {userData?.isPhoneVerified ? (
                                        <CheckCircleOutlined className="status-icon verified" />
                                    ) : (
                                        <ExclamationCircleOutlined className="status-icon unverified" />
                                    )}
                                </div>
                                {!userData?.isPhoneVerified && (
                                    <button
                                        onClick={() => handleVerification('tel')}
                                        disabled={loading.telVerification}
                                        className="verify-btn phone-verify"
                                    >
                                        {loading.telVerification ? '인증 중...' : '📱 휴대폰 인증하기'}
                                    </button>
                                )}
                            </div>
                        )}
                    </section>
                </div>

                {/* Security Info */}
                <section className="security-info">
                    <div className="security-content">
                        <div className="security-icon">
                            <SafetyCertificateOutlined />
                        </div>
                        <div className="security-text">
                            <h3>🔒 개인정보 보호</h3>
                            <p>
                                호빵은 회원님의 개인정보를 안전하게 보호합니다.
                                모든 정보는 암호화되어 저장되며, 본인 확인 후에만 수정 가능합니다.
                            </p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default ProfileEditPage;
