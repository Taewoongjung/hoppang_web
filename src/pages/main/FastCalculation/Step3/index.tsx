import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import './styles.css';
import '../../versatile-styles.css';

interface ExpansionOption {
    id: string;
    status: string;
    label: string;
}

const Step3ExpansionSelection = () => {
    const history = useHistory();
    const [selectedExpansion, setSelectedExpansion] = useState<string>('');
    const [selectedArea, setSelectedArea] = useState<string>('');
    const [selectedBay, setSelectedBay] = useState<string>('');


    // 컴포넌트 마운트 시 스크롤 맨 위로
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        // 이전 단계에서 선택한 정보 가져오기
        const area = localStorage.getItem('simple-estimate-area');
        const bay = localStorage.getItem('simple-estimate-bay');

        if (!area || !bay) {
            // 이전 단계를 거치지 않았다면 Step 1로 돌아가기
            history.push('/calculator/simple/step1');
        } else {
            setSelectedArea(area);
            setSelectedBay(bay);
        }
    }, [history]);

    const expansionOptions: ExpansionOption[] = [
        {
            id: 'expanded',
            status: '확장 O',
            label: '베란다 확장됨'
        },
        {
            id: 'not-expanded',
            status: '확장 X',
            label: '베란다 미확장'
        }
    ];

    const handleNext = () => {
        if (selectedExpansion) {
            localStorage.setItem('simple-estimate-expansion', selectedExpansion);
            history.push('/calculator/simple/step4');
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
                    <div className="progress-fill" style={{ width: '75%' }}></div>
                </div>
                <p className="progress-text">3/4 단계</p>
            </div>

            {/* Main Content */}
            <main className="simple-estimate-content">
                <div className="step-intro">
                    <h2 className="step-title">베란다가<br/>확장되어 있나요?</h2>
                    <p className="step-subtitle">베란다 확장 여부를 알려주세요</p>
                </div>

                <div className="expansion-options-container">
                    {expansionOptions.map((option) => (
                        <div
                            key={option.id}
                            className={`expansion-card ${selectedExpansion === option.id ? 'selected' : ''}`}
                            onClick={() => setSelectedExpansion(option.id)}
                        >
                            <div className="expansion-check">
                                {selectedExpansion === option.id && (
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

                            <div className="expansion-content">
                                <div className="expansion-status-badge">
                                    {option.status}
                                </div>
                                <h3 className="expansion-label">{option.label}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Selection Summary */}
                {selectedArea && selectedBay && (
                    <div className="selection-summary">
                        <p className="summary-title">선택하신 정보</p>
                        <div className="summary-items">
                            <div className="summary-item">
                                <span className="summary-label">평수</span>
                                <span className="summary-value">
                                    {selectedArea === 'small' && '23 ~ 25평'}
                                    {selectedArea === 'medium' && '27 ~ 29평'}
                                    {selectedArea === 'large' && '31 ~ 34평'}
                                </span>
                            </div>
                            <div className="summary-divider"></div>
                            <div className="summary-item">
                                <span className="summary-label">Bay</span>
                                <span className="summary-value">
                                    {selectedBay === '2bay' && '2Bay'}
                                    {selectedBay === '3bay' && '3Bay'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
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
                    className={`nav-button primary ${!selectedExpansion ? 'disabled' : ''}`}
                    onClick={handleNext}
                    disabled={!selectedExpansion}
                >
                    다음
                </button>
            </div>
        </div>
    );
};

export default Step3ExpansionSelection;
