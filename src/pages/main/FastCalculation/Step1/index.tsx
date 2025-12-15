import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import './styles.css';
import '../../versatile-styles.css';


interface AreaOption {
    id: string;
    range: string;
    label: string
}

const Step1AreaSelection = () => {
    const history = useHistory();
    const [selectedArea, setSelectedArea] = useState<string>('');

    useEffect(() => {
        // Step0에서 주소를 입력했는지 확인
        const address = localStorage.getItem('simple-estimate-address');
        if (!address) {
            // 주소를 입력하지 않았다면 Step0로 돌아가기
            history.push('/calculator/simple/step0');
        }
    }, [history]);

    const areaOptions: AreaOption[] = [
        {
            id: 'small',
            range: '23~25평',
            label: '23 ~ 25평'
        },
        {
            id: 'medium',
            range: '27~29평',
            label: '27 ~ 29평'
        },
        {
            id: 'large',
            range: '31~34평',
            label: '31 ~ 34평'
        }
    ];

    const handleNext = () => {
        if (selectedArea) {
            // 선택한 평수를 localStorage에 저장 (다음 step에서 사용)
            localStorage.setItem('simple-estimate-area', selectedArea);
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
                <p className="progress-text">1/4 단계</p>
            </div>

            {/* Main Content */}
            <main className="simple-estimate-content">
                <div className="step-intro">
                    <h2 className="step-title">평수를 선택해주세요</h2>
                    <p className="step-subtitle">집의 전체 평수를 알려주세요</p>
                </div>

                <div className="options-grid">
                    {areaOptions.map((option) => (
                        <div
                            key={option.id}
                            className={`option-card ${selectedArea === option.id ? 'selected' : ''}`}
                            onClick={() => setSelectedArea(option.id)}
                        >
                            <div className="option-check">
                                {selectedArea === option.id && (
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
                                <h3 className="option-label">{option.label}</h3>
                                {/*<p className="option-description">{option.description}</p>*/}
                            </div>
                        </div>
                    ))}
                </div>

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
                    className={`nav-button primary ${!selectedArea ? 'disabled' : ''}`}
                    onClick={handleNext}
                    disabled={!selectedArea}
                >
                    다음
                </button>
            </div>
        </div>
    );
};

export default Step1AreaSelection;
