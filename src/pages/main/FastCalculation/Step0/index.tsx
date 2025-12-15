import React, {useEffect, useState} from 'react';
import { useHistory } from 'react-router-dom';

import './styles.css';
import '../../versatile-styles.css';
import AddressInputModal from "../../../../component/V2/AddressInputModal";

// 주소 타입 정의
interface AddressInfo {
    zipCode: string;           // 우편번호
    state: string;             // 시/도
    city: string;              // 시/군/구
    town: string;              // 읍/면/동
    bCode: string;             // 법정동코드
    remainAddress: string;     // 상세주소 (사용자 입력)
    buildingNumber: string;    // 빌딩번호
    fullAddress: string;       // 전체 주소 (표시용)
}


const Step0AddressInput = () => {
    const history = useHistory();
    const [errors, setErrors] = useState<{address?: string, remainAddress?: string}>({});

    const [addressInfo, setAddressInfo] = useState<AddressInfo | null>(null);

    const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
    const [address, setAddress] = useState<string>('');
    const [addressZoneCode, setAddressZoneCode] = useState<string>('');
    const [remainAddress, setRemainAddress] = useState<string>('');
    const [addressBuildingNum, setAddressBuildingNum] = useState<string>('');
    const [sido, setSido] = useState<string>('');
    const [siGunGu, setSiGunGu] = useState<string>('');
    const [yupMyeonDong, setYupMyeonDong] = useState<string>('');
    const [bCode, setBCode] = useState<string>('');
    const [isApartment, setIsApartment] = useState<boolean>(false);


    // 컴포넌트 마운트 시 localStorage에서 복원
    useEffect(() => {
        const savedAddress = localStorage.getItem('simple-estimate-address');
        if (savedAddress) {
            try {
                const parsed = JSON.parse(savedAddress);
                setAddressInfo(parsed);
                setRemainAddress(parsed.remainAddress || '');
            } catch (e) {
                console.error('주소 정보 복원 실패:', e);
            }
        }
    }, []);


    const handleAddressComplete = (data: any) => {
        let fullAddress = data.address;
        let extraAddress = '';

        if (data.addressType === 'R') {
            if (data.bname !== '') {
                extraAddress += data.bname;
            }
            if (data.buildingName !== '') {
                extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
            }
            fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
        }

        setAddress(fullAddress);
        setAddressZoneCode(data.zonecode);
        setShowAddressModal(false);

        // 에러 제거
        setErrors({ ...errors, address: undefined });
    };

    const handleAddressSelect = (newAddress: any) => {
        setAddress(newAddress.address); // input 창에 주소 표시 전용
        setAddressZoneCode(newAddress.zonecode); // 우편번호
        setAddressBuildingNum(newAddress.buildingCode); // 빌딩번호
        setSido(newAddress.sido); // 시도
        setSiGunGu(newAddress.sigungu); // 시군구
        setYupMyeonDong(newAddress.bname); // 읍면동
        setBCode(newAddress.bcode); // 법정동코드

        if (newAddress.apartment === "Y") {
            setIsApartment(true) // 아파트 여부 (디폴트 false)
        }

        let extraAddress = '';
        let fullAddress = newAddress.address;

        if (newAddress.addressType === 'R') {
            if (newAddress.bname !== '') {
                extraAddress += newAddress.bname;
            }
            if (newAddress.buildingName !== '') {
                extraAddress += extraAddress !== '' ? `, ${newAddress.buildingName}` : newAddress.buildingName;
            }
            fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
        }

        const newAddressInfo: AddressInfo = {
            zipCode: newAddress.zonecode,                    // 우편번호
            state: newAddress.sido,                          // 시/도
            city: newAddress.sigungu,                        // 시/군/구
            town: newAddress.bname || newAddress.bname1 || '',     // 법정동명
            bCode: newAddress.bcode,                         // 법정동코드
            buildingNumber: newAddress.buildingCode || '',   // 건물관리번호
            remainAddress: extraAddress,              // 상세주소 (나중에 추가)
            fullAddress: fullAddress                 // 전체 주소 (표시용)
        };

        setAddressInfo(newAddressInfo);

        // 주소 선택 후 에러 클리어
        if (errors.address) {
            setErrors(prev => ({ ...prev, address: '' }));
        }
    };

    const handleNext = () => {
        // 유효성 검사
        const newErrors: {address?: string, remainAddress?: string} = {};

        if (!address) {
            newErrors.address = '주소를 입력해주세요';
        }

        if (!remainAddress.trim()) {
            newErrors.remainAddress = '상세주소를 입력해주세요';
        }

        if (Object.keys(newErrors).length > 0) {
            console.log("??? = ", newErrors);
            setErrors(newErrors);
            return;
        }

        // 상세주소 추가
        const completeAddressInfo: AddressInfo = {
            ...addressInfo!,
            remainAddress: remainAddress.trim()
        };

        // localStorage에 JSON 문자열로 저장
        localStorage.setItem('simple-estimate-address', JSON.stringify(completeAddressInfo));

        // 주소 정보 저장
        // localStorage.setItem('simple-estimate-address', address);
        // localStorage.setItem('simple-estimate-address-zone', addressZoneCode);
        // localStorage.setItem('simple-estimate-address-detail', remainAddress);

        history.push('/calculator/simple/step1');
    };

    const handleBack = () => {
        // step0
        localStorage.removeItem('simple-estimate-address')

        // step1
        localStorage.removeItem('simple-estimate-area')

        // step2
        localStorage.removeItem('simple-estimate-bay')

        // step3
        localStorage.removeItem('simple-estimate-expansion')

        // step4
        localStorage.removeItem('simple-estimate-data')


        window.location.href = '/calculator/simple';
    };


    return (
        <div className="simple-estimate-container">
            {/* Header */}
            <header className="simple-estimate-header">
                <button
                    className="back-button"
                    onClick={handleBack}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M15 18L9 12L15 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>
                <h1 className="header-title">간편견적</h1>
                <div style={{ width: '24px' }}></div>
            </header>

            {/* Progress Bar */}
            <div className="progress-container">
                <div className="progress-bar">
                    <div className="progress-fill" style={{ width: '20%' }}></div>
                </div>
                <p className="progress-text">1/5 단계</p>
            </div>

            {/* Main Content */}
            <main className="simple-estimate-content">
                <div className="step-intro">
                    <div className="step-icon-large">🏠</div>
                    <h2 className="step-title">견적을 원하는<br/>주소를 알려주세요</h2>
                    <p className="step-subtitle">정확한 견적을 위해 주소가 필요해요</p>
                </div>

                <div className="address-section">
                    {/* 주소 입력 */}
                    <div className="form-group-custom">
                        <label className="form-label-custom">
                            <span className="label-text">주소</span>
                            <span className="label-required">*</span>
                        </label>
                        <div
                            className={`address-card ${errors.address ? 'error' : ''} ${address ? 'filled' : ''}`}
                            onClick={() => setShowAddressModal(true)}
                        >
                            {addressInfo ? (
                                <div className="address-content">
                                    <div className="address-main">
                                        <span className="address-icon">📍</span>
                                        <div className="address-text-wrapper">
                                            <span className="address-text">{addressInfo?.fullAddress}</span>
                                            <span className="address-zone">우편번호: {addressInfo?.zipCode}</span>
                                        </div>
                                    </div>
                                    <div className="address-change">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                </div>
                            ) : (
                                <div className="address-placeholder-content">
                                    <div className="placeholder-icon-wrapper">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                            <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </div>
                                    <div className="placeholder-text-wrapper">
                                        <span className="placeholder-title">주소 검색하기</span>
                                        <span className="placeholder-subtitle">클릭하여 주소를 입력하세요</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        {errors.address && (
                            <div className="error-message-custom">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span>{errors.address}</span>
                            </div>
                        )}
                    </div>

                    {/* 상세주소 입력 */}
                    <div className="form-group-custom">
                        <label className="form-label-custom">
                            <span className="label-text">상세주소</span>
                            <span className="label-required">*</span>
                        </label>
                        <input
                            type="text"
                            value={remainAddress}
                            onChange={(e) => {
                                setRemainAddress(e.target.value);
                                if (e.target.value.trim()) {
                                    setErrors({ ...errors, remainAddress: undefined });
                                }
                            }}
                            placeholder="동, 호수 등 상세주소를 입력하세요"
                            className={`detail-input ${errors.remainAddress ? 'error' : ''}`}
                        />
                        {errors.remainAddress && (
                            <div className="error-message-custom">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span>{errors.remainAddress}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="info-box">
                    <span className="info-icon">💡</span>
                    <p className="info-text">
                        입력하신 주소는 <strong>정확한 견적 산출</strong>을 위해 사용되며,
                        개인정보는 안전하게 보호됩니다
                    </p>
                </div>
            </main>

            {/* Bottom Navigation */}
            <div className="bottom-nav">
                <button
                    className="nav-button secondary"
                    onClick={handleBack}
                >
                    이전
                </button>
                <button
                    className={`nav-button primary ${(!addressInfo || !addressInfo.remainAddress.trim()) ? 'disabled' : ''}`}
                    onClick={handleNext}
                    disabled={!addressInfo || !addressInfo.remainAddress.trim()}
                >
                    다음
                </button>
            </div>

            {showAddressModal && (
                <div className="address-modal-backdrop" onClick={() => setShowAddressModal(false)}>
                        <AddressInputModal
                            onClose={() => setShowAddressModal(false)}
                            onAddressSelect={handleAddressSelect}
                            currentAddress={address}
                        />
                </div>
            )}
        </div>
    );
};

export default Step0AddressInput;
