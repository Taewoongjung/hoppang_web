import React, {useEffect, useState} from 'react';
import { Helmet } from 'react-helmet-async';
import { useHistory } from 'react-router-dom';

import './styles.css';
import '../../versatile-styles.css';
import {invalidateMandatoryData, getItemWithTTL, setItemWithTTL} from "../util";
import CalculationExitModal from "../../../../component/V2/Modal/CalculationExitModal";
import { trackEvent } from '../../../../util/analytics';
import CommonHeader from '../../../../component/CommonHeader';

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
    isApartment: boolean;      // 아파트 여부
    floorCustomerLiving?: number; // 층수
}


const Step0AddressInput = () => {
    const history = useHistory();
    const [errors, setErrors] = useState<{address?: string, remainAddress?: string, floorCustomerLiving?: string}>({});
    const [showExitModal, setShowExitModal] = useState(false);

    const [addressInfo, setAddressInfo] = useState<AddressInfo | null>(null);
    const [remainAddress, setRemainAddress] = useState<string>('');
    const [floorCustomerLiving, setFloorCustomerLiving] = useState<string>('');


    // 컴포넌트 마운트 시 스크롤 맨 위로
    useEffect(() => {
        window.scrollTo(0, 0);

        // GA4 퍼널 스텝 이벤트 (플랫폼 정보 자동 포함)
        trackEvent('funnel_step_view', {
            page_title: '간편견적 - 주소 입력',
            page_location: window.location.href,
            page_path: '/calculator/simple/step0',
            funnel_type: 'simple_estimate',
            funnel_step: 'address_input',
            step_number: 1
        });
    }, []);

    // 컴포넌트 마운트 시 localStorage에서 복원
    useEffect(() => {
        const savedAddress = getItemWithTTL<AddressInfo>('simple-estimate-address');
        if (savedAddress) {
            setAddressInfo(savedAddress);
            setRemainAddress(savedAddress.remainAddress || '');
            setFloorCustomerLiving(savedAddress.floorCustomerLiving?.toString() || '');
        }
    }, []);

    // 주소 검색 페이지에서 돌아왔을 때 결과 확인
    useEffect(() => {
        const selectedAddressStr = sessionStorage.getItem('selected-address');
        if (selectedAddressStr) {
            try {
                const selectedAddress = JSON.parse(selectedAddressStr);
                handleAddressSelect(selectedAddress);
                sessionStorage.removeItem('selected-address');
            } catch (e) {
                console.error('Failed to parse selected address', e);
            }
        }
    }, []);

    const handleAddressSelect = (newAddress: any) => {

        let isApartment = false;
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

        if (newAddress.apartment === "Y") {
            isApartment = true // 아파트 여부 (디폴트 false)
        }

        const newAddressInfo: AddressInfo = {
            zipCode: newAddress.zonecode,                    // 우편번호
            state: newAddress.sido,                          // 시/도
            city: newAddress.sigungu,                        // 시/군/구
            town: newAddress.bname || newAddress.bname1 || '',     // 법정동명
            bCode: newAddress.bcode,                         // 법정동코드
            buildingNumber: newAddress.buildingCode || '',   // 건물관리번호
            remainAddress: extraAddress,              // 상세주소 (나중에 추가)
            fullAddress: fullAddress,                 // 전체 주소 (표시용)
            isApartment: isApartment,                 // 아파트 여부
        };

        setAddressInfo(newAddressInfo);

        // 주소 선택 후 에러 클리어
        if (errors.address) {
            setErrors(prev => ({ ...prev, address: '' }));
        }
    };

    // 주소 검색 페이지로 이동
    const handleAddressSearch = () => {
        history.push('/address-search?redirect=/calculator/simple/step0');
    };

    const handleNext = () => {
        // 유효성 검사
        const newErrors: {addressInfo?: string, remainAddress?: string, floorCustomerLiving?: string} = {};

        if (!addressInfo) {
            newErrors.addressInfo = '주소를 입력해주세요';
        }

        if (!remainAddress.trim()) {
            newErrors.remainAddress = '상세주소를 입력해주세요';
        }

        if (!floorCustomerLiving) {
            newErrors.floorCustomerLiving = '층수를 입력해주세요';
        } else if (parseInt(floorCustomerLiving) < 1) {
            newErrors.floorCustomerLiving = '1층 이상 입력해주세요';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // 상세주소 및 층수 추가
        const completeAddressInfo: AddressInfo = {
            ...addressInfo!,
            remainAddress: remainAddress.trim(),
            floorCustomerLiving: parseInt(floorCustomerLiving)
        };

        setItemWithTTL('simple-estimate-address', completeAddressInfo);

        history.push('/calculator/simple/step1');
    };

    const handleBack = () => {

        invalidateMandatoryData();

        setShowExitModal(true);
    };


    return (
        <>
            <Helmet>
                <meta name="robots" content="noindex, nofollow"/>
            </Helmet>
            <div className="simple-estimate-container">
            {/* Header */}
            <CommonHeader title="간편견적" onBack={handleBack} />

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
                            className={`address-card ${errors.address ? 'error' : ''} ${addressInfo ? 'filled' : ''}`}
                            onClick={handleAddressSearch}
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

                    {/* 층수 입력 */}
                    <div className="form-group-custom">
                        <label className="form-label-custom">
                            <span className="label-text">층수</span>
                            <span className="label-required">*</span>
                        </label>
                        <div className="floor-input-wrapper">
                            <input
                                type="number"
                                inputMode="numeric"
                                value={floorCustomerLiving}
                                onChange={(e) => {
                                    setFloorCustomerLiving(e.target.value);
                                    if (e.target.value.trim() && parseInt(e.target.value) >= 1) {
                                        setErrors({ ...errors, floorCustomerLiving: undefined });
                                    }
                                }}
                                placeholder="층수를 입력하세요"
                                className={`detail-input floor-input ${errors.floorCustomerLiving ? 'error' : ''}`}
                                min="1"
                            />
                            <span className="floor-suffix">층</span>
                        </div>
                        {errors.floorCustomerLiving && (
                            <div className="error-message-custom">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                                <span>{errors.floorCustomerLiving}</span>
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
                    className={`nav-button primary ${(!addressInfo || !remainAddress.trim() || !floorCustomerLiving) ? 'disabled' : ''}`}
                    onClick={handleNext}
                    disabled={!addressInfo || !remainAddress.trim() || !floorCustomerLiving}
                >
                    다음
                </button>
            </div>

            {showExitModal && (<CalculationExitModal setShowExitModal={setShowExitModal}/>)}
        </div>
        </>
    );
};

export default Step0AddressInput;
