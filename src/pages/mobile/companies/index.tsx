import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { companyTypeOptionsString } from '../../../definition/companyType';

import './styles.css';

import ExitModal from "../../../component/V2/ExitModal";
import { LeftOutlined } from '@ant-design/icons';


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


    return (
        <div className="app-container">
            <header className="app-header">
                <div className="header-content">
                    <button className="back-button" onClick={handleExitClick}>
                        <LeftOutlined/>
                    </button>
                    <div className="header-title">샷시 회사 선택</div>
                </div>
            </header>

            <main className="main-content">
                <div className="progress-indicator">
                    <div className="step active"></div>
                    <div className="step"></div>
                    <div className="step"></div>
                </div>
                <h2 className="main-title">어떤 브랜드의 샷시로<br/>견적을 받아보시겠어요?</h2>
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

            {/* 종료 모달 */}
            {showExitModal && (<ExitModal setShowExitModal={setShowExitModal}/>)}
        </div>
    );
};

export default MobileCompaniesScreen;
