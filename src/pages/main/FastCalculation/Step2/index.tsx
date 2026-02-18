import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import './styles.css';
import '../../versatile-styles.css';
import { getItemWithTTL, setItemWithTTL } from '../util';


interface BayOption {
    id: string;
    type: string;
    label: string;
    description: string;
}

const Step2BaySelection = () => {
    const history = useHistory();
    const [selectedBay, setSelectedBay] = useState<string>('');


    // 컴포넌트 마운트 시 스크롤 맨 위로
    useEffect(() => {
        window.scrollTo(0, 0);

        // GA4 페이지뷰 이벤트
        if (window.gtag) {
            window.gtag('event', 'page_view', {
                page_title: '간편견적 - Bay 구조 선택',
                page_location: window.location.href,
                page_path: '/calculator/simple/step2',
                funnel_type: 'simple_estimate',
                funnel_step: 'bay_selection',
                step_number: 3
            });
        }
    }, []);

    useEffect(() => {
        // 이전 단계에서 선택한 평수 가져오기
        const area = getItemWithTTL('simple-estimate-area');
        if (!area) {
            // 평수를 선택하지 않았다면 Step 1로 돌아가기
            history.push('/calculator/simple/step1');
        }

        // 이전에 선택한 bay 값이 있으면 복원
        const savedBay = getItemWithTTL<string>('simple-estimate-bay');
        if (savedBay) {
            setSelectedBay(savedBay);
        }
    }, [history]);

    const bayOptions: BayOption[] = [
        {
            id: '2',
            type: '2Bay',
            label: '2Bay 구조',
            description: '거실 창이 2개로 나뉘어진 구조'
        },
        {
            id: '3',
            type: '3Bay',
            label: '3Bay 구조',
            description: '거실 창이 3개로 나뉘어진 구조'
        }
    ];

    const handleNext = () => {
        if (selectedBay) {
            setItemWithTTL('simple-estimate-bay', selectedBay);
            history.push('/calculator/simple/step3');
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
                    <div className="progress-fill" style={{ width: '50%' }}></div>
                </div>
                <p className="progress-text">3/5 단계</p>
            </div>

            {/* Main Content */}
            <main className="simple-estimate-content">
                <div className="info-box">
                    <span className="info-icon">💡</span>
                    <p className="info-text">
                        Bay 구조란<br/>
                        <strong>거실 창이 몇 개의 틀로</strong> 나뉘어져 있는지 세어보세요
                    </p>
                </div>

                <div className="step-intro">
                    <h2 className="step-title">거실 창 구조를<br/>선택해주세요</h2>
                    <p className="step-subtitle">거실의 베이 구조를 알려주세요</p>
                </div>

                <div className="bay-options-container">
                    {bayOptions.map((option) => (
                        <div
                            key={option.id}
                            className={`bay-card ${selectedBay === option.id ? 'selected' : ''}`}
                            onClick={() => setSelectedBay(option.id)}
                        >
                            <div className="bay-check">
                                {selectedBay === option.id && (
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

                            <div className="bay-visual">
                                <div className="bay-content">
                                    <h3 className="bay-type">{option.type}</h3>
                                    <p className="bay-description">{option.description}</p>
                                </div>
                                <div className="bay-illustration">
                                    {option.id === '2' ? (
                                        <img
                                            src={'/assets/Floorplan/2bay/2bay-예시.png'}
                                            alt={'2bay 예시'}
                                            className="bay-image"
                                        />
                                    ) : (
                                        <img
                                            src={'/assets/Floorplan/3bay/3bay-예시.png'}
                                            alt={'3bay 예시'}
                                            className="bay-image"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
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
                    className={`nav-button primary ${!selectedBay ? 'disabled' : ''}`}
                    onClick={handleNext}
                    disabled={!selectedBay}
                >
                    다음
                </button>
            </div>
        </div>
    );
};

export default Step2BaySelection;
