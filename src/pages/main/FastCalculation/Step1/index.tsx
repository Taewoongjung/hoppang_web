import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';

import './styles.css';
import '../../versatile-styles.css';
import { callSimpleEstimationSquareFeetType } from '../../../../definition/apiPath';
import { getItemWithTTL, setItemWithTTL } from '../util';


interface AreaOption {
    id: number;
    type: string;
}

const Step1AreaSelection = () => {
    const history = useHistory();
    const [selectedArea, setSelectedArea] = useState<AreaOption | null>(null);
    const [areaOptions, setAreaOptions] = useState<AreaOption[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);


    // 컴포넌트 마운트 시 스크롤 맨 위로
    useEffect(() => {
        window.scrollTo(0, 0);

        // GA4 페이지뷰 이벤트
        if (window.gtag) {
            window.gtag('event', 'page_view', {
                page_title: '간편견적 - 평수 선택',
                page_location: window.location.href,
                page_path: '/calculator/simple/step1',
                funnel_type: 'simple_estimate',
                funnel_step: 'area_selection',
                step_number: 2
            });
        }
    }, []);

    useEffect(() => {
        // Step0에서 주소를 입력했는지 확인
        const address = getItemWithTTL('simple-estimate-address');
        if (!address) {
            // 주소를 입력하지 않았다면 Step0로 돌아가기
            history.push('/calculator/simple/step0');
            return;
        }

        // 평수 타입 API 호출
        fetchAreaOptions();
    }, [history]);

    const fetchAreaOptions = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await axios.get(callSimpleEstimationSquareFeetType);
            setAreaOptions(response.data);

            // 이전에 선택한 area 값이 있으면 복원
            const savedArea = getItemWithTTL<AreaOption>('simple-estimate-area');
            if (savedArea) {
                setSelectedArea(savedArea);
            }
        } catch (err) {
            console.error('평수 타입 조회 실패:', err);
            setError('평수 정보를 불러오는데 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleNext = () => {
        if (selectedArea !== null) {
            setItemWithTTL('simple-estimate-area', selectedArea);
            history.push('/calculator/simple/step2');
        }
    };

    const handleBack = () => {
        history.goBack();
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
                    <div className="progress-fill" style={{ width: '25%' }}></div>
                </div>
                <p className="progress-text">2/5 단계</p>
            </div>

            {/* Main Content */}
            <main className="simple-estimate-content">
                <div className="step-intro">
                    <h2 className="step-title">평수를 선택해주세요</h2>
                    <p className="step-subtitle">집의 전체 평수를 알려주세요</p>
                </div>

                {isLoading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p className="loading-text">평수 정보를 불러오는 중...</p>
                    </div>
                ) : error ? (
                    <div className="error-container">
                        <p className="error-text">{error}</p>
                        <button className="retry-button" onClick={fetchAreaOptions}>
                            다시 시도
                        </button>
                    </div>
                ) : (
                    <div className="options-grid">
                        {areaOptions.map((option) => (
                            <div
                                key={option.id}
                                className={`option-card ${selectedArea?.id === option.id ? 'selected' : ''}`}
                                onClick={() => setSelectedArea(option)}
                            >
                                <div className="option-check">
                                    {selectedArea?.id === option.id && (
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                            <path
                                                d="M16.6667 5L7.50004 14.1667L3.33337 10"
                                                stroke="white"
                                                strokeWidth="2.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    )}
                                </div>
                                <div className="option-content">
                                    <h3 className="option-label">{option.type}</h3>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="info-box">
                    <span className="info-icon">💡</span>
                    <p className="info-text">
                        이 외 평형대나 4bay 구조는 <strong>상세 견적</strong>을 이용해주세요
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
                    className={`nav-button primary ${selectedArea === null ? 'disabled' : ''}`}
                    onClick={handleNext}
                    disabled={selectedArea === null}
                >
                    다음
                </button>
            </div>
        </div>
    );
};

export default Step1AreaSelection;
