import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { companyTypeOptionsString } from '../../../definition/companyType';
import './styles.css';

const MobileCompaniesScreen = () => {
    const history = useHistory();
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
    const [showExitModal, setShowExitModal] = useState(false);

    const handleCompanySelect = (company: string) => {
        setSelectedCompany(company);
    };

    const handleNext = () => {
        if (selectedCompany) {
            history.push('/v2/calculator', { companyType: selectedCompany });
        }
    };

    const handleExitClick = () => {
        setShowExitModal(true);
    };

    const handleExitConfirm = () => {
        history.push('/'); // 홈으로 이동
    };

    const handleExitCancel = () => {
        setShowExitModal(false);
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <div className="header-content">
                    <div className="logo-container" onClick={() => history.push('/')}>
                        <img src="/assets/hoppang-character.png" alt="Hoppang Logo" className="logo-img"/>
                    </div>
                    <div className="header-title">창호 회사 선택</div>
                    <div
                        className="header-title-exit"
                        onClick={handleExitClick}
                    >
                        종료
                    </div>
                </div>
            </header>

            <main className="main-content">
                <div className="progress-indicator">
                    <div className="step active"></div>
                    <div className="step"></div>
                    <div className="step"></div>
                </div>
                <h2 className="main-title">어떤 브랜드의 창호로<br/>견적을 받아보시겠어요?</h2>
                <p className="subtitle">원하시는 브랜드를 선택해주세요</p>
                <div className="company-list">
                    {companyTypeOptionsString.map((company) => (
                        <button
                            key={company}
                            className={`company-card ${selectedCompany === company ? 'selected' : ''}`}
                            onClick={() => handleCompanySelect(company)}
                        >
                            <span className="company-name">{company}</span>
                            {selectedCompany === company && (
                                <div className="check-icon">✓</div>
                            )}
                        </button>
                    ))}
                </div>
            </main>

            <footer className="footer-actions">
                <button
                    className="button-primary"
                    onClick={handleNext}
                    disabled={!selectedCompany}
                >
                    다음 단계로
                </button>
            </footer>

            {/* Exit Confirmation Modal */}
            {showExitModal && (
                <div className="modal-overlay">
                    <div className="modal-container">
                        <div className="modal-content">
                            <div className="modal-icon">⚠️</div>
                            <h3 className="modal-title">견적 받기를 종료하시겠어요?</h3>
                            <p className="modal-message">
                                지금까지 입력하신 정보가 모두 사라집니다.<br/>
                                정말 종료하시겠어요?
                            </p>
                            <div className="modal-actions">
                                <button
                                    className="modal-button cancel"
                                    onClick={handleExitCancel}
                                >
                                    계속하기
                                </button>
                                <button
                                    className="modal-button confirm"
                                    onClick={handleExitConfirm}
                                >
                                    종료하기
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MobileCompaniesScreen;
