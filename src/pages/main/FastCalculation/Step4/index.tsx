import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import './styles.css';
import '../../versatile-styles.css';
import { getItemWithTTL, setItemWithTTL } from '../util';

interface ResidentOption {
    id: string;
    status: string;
    label: string;
}

const Step4ResidentSelection = () => {
    const history = useHistory();
    const [selectedResident, setSelectedResident] = useState<string>('');
    const [selectedArea, setSelectedArea] = useState<string>('');
    const [selectedBay, setSelectedBay] = useState<string>('');
    const [selectedExpansion, setSelectedExpansion] = useState<string>('');


    // 컴포넌트 마운트 시 스크롤 맨 위로
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        // 이전 단계에서 선택한 정보 가져오기
        const area = getItemWithTTL<string>('simple-estimate-area');
        const bay = getItemWithTTL<string>('simple-estimate-bay');
        const expansion = getItemWithTTL<string>('simple-estimate-expansion');

        if (!area || !bay || !expansion) {
            // 이전 단계를 거치지 않았다면 Step 1로 돌아가기
            history.push('/calculator/simple/step1');
        } else {
            setSelectedArea(typeof area === 'string' ? area : JSON.stringify(area));
            setSelectedBay(bay);
            setSelectedExpansion(expansion);
        }

        // 이전에 선택한 resident 값이 있으면 복원
        const savedResident = getItemWithTTL<string>('simple-estimate-resident');
        if (savedResident) {
            setSelectedResident(savedResident);
        }
    }, [history]);

    const residentOptions: ResidentOption[] = [
        {
            id: 'resident',
            status: '거주 중',
            label: '현재 거주하고 있어요'
        },
        {
            id: 'not-resident',
            status: '비거주',
            label: '거주하고 있지 않아요'
        }
    ];

    const handleNext = () => {
        if (selectedResident) {
            setItemWithTTL('simple-estimate-resident', selectedResident);
            history.push('/calculator/simple/step5');
        }
    };

    const getAreaLabel = () => {
        const areaData = getItemWithTTL<{type: string}>('simple-estimate-area');

        if (!areaData) {
            history.push('/calculator/simple/step1');
            return;
        }

        return areaData.type;
    }

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
                    <div className="progress-fill" style={{ width: '84%' }}></div>
                </div>
                <p className="progress-text">5/6 단계</p>
            </div>

            {/* Main Content */}
            <main className="simple-estimate-content">
                <div className="step-intro">
                    <h2 className="step-title">현재 거주 중이신가요?</h2>
                    <p className="step-subtitle">시공 시 거주 여부를 알려주세요</p>
                </div>

                <div className="expansion-options-container">
                    {residentOptions.map((option) => (
                        <div
                            key={option.id}
                            className={`expansion-card ${selectedResident === option.id ? 'selected' : ''}`}
                            onClick={() => setSelectedResident(option.id)}
                        >
                            <div className="expansion-check">
                                {selectedResident === option.id && (
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
                {selectedArea && selectedBay && selectedExpansion && (
                    <div className="selection-summary">
                        <p className="summary-title">선택하신 정보</p>
                        <div className="summary-items">
                            <div className="summary-item">
                                <span className="summary-label">평수</span>
                                <span className="summary-value">
                                    {getAreaLabel()}
                                </span>
                            </div>
                            <div className="summary-divider"></div>
                            <div className="summary-item">
                                <span className="summary-label">베이</span>
                                <span className="summary-value">
                                    {selectedBay === '2' && '2 베이'}
                                    {selectedBay === '3' && '3 베이'}
                                </span>
                            </div>
                            <div className="summary-divider"></div>
                            <div className="summary-item">
                                <span className="summary-label">확장</span>
                                <span className="summary-value">
                                    {selectedExpansion === 'expanded' ? '확장 O' : '확장 X'}
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
                    className={`nav-button primary ${!selectedResident ? 'disabled' : ''}`}
                    onClick={handleNext}
                    disabled={!selectedResident}
                >
                    다음
                </button>
            </div>
        </div>
    );
};

export default Step4ResidentSelection;
