import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { companyTypeOptionsString } from '../../../definition/companyType';
import './styles.css';

const MobileCompaniesScreen = () => {
    const history = useHistory();
    const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

    const handleCompanySelect = (company: string) => {
        setSelectedCompany(company);
    };

    const handleNext = () => {
        if (selectedCompany) {
            history.push('/v2/calculator', { companyType: selectedCompany });
        }
    };

    return (
        <div className="app-container">
            <header className="app-header">
                <div className="header-content">
                    <div className="logo-container" onClick={() => history.push('/')}>
                         <img src="/assets/hoppang-character.png" alt="Hoppang Logo" className="logo-img"/>
                         <span className="logo-text">호빵</span>
                     </div>
                     <div className="header-title">창호 회사 선택</div>
                 </div>
            </header>
            <main className="main-content">
                <div className="progress-indicator">
                    <div className="step active"></div>
                    <div className="step"></div>
                    <div className="step"></div>
                </div>
                <h2 className="main-title">어떤 브랜드의 창호로<br/>견적을 받아보시겠어요?</h2>
                <p className="subtitle"/>
                <div className="company-list">
                    {companyTypeOptionsString.map((company) => (
                        <button
                            key={company}
                            className={`company-card ${selectedCompany === company ? 'selected' : ''}`}
                            onClick={() => handleCompanySelect(company)}
                        >
                            {company}
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
                    다음
                </button>
            </footer>
        </div>
    );
};

export default MobileCompaniesScreen;
