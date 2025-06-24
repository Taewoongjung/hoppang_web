import React, {useEffect, useState} from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import axios from 'axios';
import './styles.css';

import {
    getYetCalculatedCompanyList,
    addCommasToNumber,
    getLabelOfChassisType,
    mappedCompanyByValue,
    mappedValueByCompany
} from "../../../util";
import {calculateChassisCall} from "../../../definition/apiPath";
import chassisTypeOptions from "../../../definition/chassisType";
import {Unit} from "../../../definition/unit";

const MobileResultScreen = () => {
    const history = useHistory();
    const location = useLocation<any>();

    const [results, setResults] = useState<any[]>([]);
    const [requestObject, setRequestObject] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (location.state && location.state.calculatedResult) {
            setResults([location.state.calculatedResult]);
            setRequestObject(location.state.requestObject);
        } else {
            // Handle case where user directly navigates to this page
            history.replace('/calculator/agreement');
        }
    }, [location, history]);
    
    const getOtherEstimates = () => {
        if (!requestObject) return;

        const alreadyCalculatedCompanies = results.map(r => mappedCompanyByValue(r.company)) as string[];
        if (alreadyCalculatedCompanies.length >= 3) {
            setError('모든 회사의 견적을 받았습니다.');
            return;
        }

        const firstCompany = mappedCompanyByValue(results[0].company);
        const yetCalculatedCompanies = getYetCalculatedCompanyList(firstCompany || '')?.filter(c => !alreadyCalculatedCompanies.includes(c)) || [];

        if (yetCalculatedCompanies.length === 0) {
            setError('더 이상 조회할 회사가 없습니다.');
            return;
        }

        setIsLoading(true);
        setError('');

        const companyToFetchKo = yetCalculatedCompanies[0];
        const companyToFetchValue = mappedValueByCompany(companyToFetchKo);

        const payload = {
            ...requestObject,
            reqCalculateChassisPriceList: requestObject.reqCalculateChassisPriceList.map((item: any) => ({
                ...item,
                companyType: companyToFetchValue,
            }))
        };
        
        axios.post(calculateChassisCall, payload, {
            withCredentials: true,
            headers: { Authorization: localStorage.getItem("hoppang-token") },
        })
        .then(response => {
            setResults(prev => [...prev, response.data]);
        })
        .catch(err => {
            setError(err.response?.data?.message || `[${companyToFetchKo}] 견적을 받아오는데 실패했습니다.`);
        })
        .finally(() => {
            setIsLoading(false);
        });
    };

    const renderResultCard = (result: any, index: number) => {
        const companyName = mappedCompanyByValue(result.company);
        const totalDiscount = result.discountedWholeCalculatedFeeAmount;
        const finalPrice = result.discountedWholeCalculatedFeeWithSurtax;
        const originalPrice = result.wholeCalculatedFee + result.surtax;

        return (
            <div className="result-card" key={index}>
                <div className="company-header">
                    <span className="company-name">{companyName}</span>
                </div>

                <div className="price-summary">
                    <div className="price-label">최종 견적 금액</div>
                    <div className="total-price">{addCommasToNumber(finalPrice)}원</div>
                    {totalDiscount > 0 && (
                        <div className="original-price">{addCommasToNumber(originalPrice)}원</div>
                    )}
                </div>

                <div className="details-section">
                    <div className="details-title">재료비</div>
                    <div className="sub-details">
                         {result.chassisPriceResultList.map((item: any, idx: number) => (
                            <div className="sub-detail-item" key={idx}>
                                <span>{getLabelOfChassisType(item.chassisType)}</span>
                                <span>{addCommasToNumber(item.discountedPrice || item.price)}원</span>
                            </div>
                        ))}
                    </div>
                     <div className="detail-item">
                        <span className="detail-item-label">재료비 합계</span>
                        <span className="detail-item-value">{addCommasToNumber(result.wholeMaterialsFee)}원</span>
                    </div>

                    <div className="details-title" style={{marginTop: '20px'}}>부가 비용</div>
                     <div className="detail-item">
                        <span className="detail-item-label">시공비</span>
                        <span className="detail-item-value">{addCommasToNumber(result.laborFee)}원</span>
                    </div>
                     <div className="detail-item">
                        <span className="detail-item-label">부가세</span>
                        <span className="detail-item-value">{addCommasToNumber(result.surtax)}원</span>
                    </div>
                    {totalDiscount > 0 &&
                        <div className="detail-item">
                            <span className="detail-item-label" style={{color: '#2563eb'}}>할인 금액</span>
                            <span className="detail-item-value" style={{color: '#2563eb'}}>-{addCommasToNumber(totalDiscount)}원</span>
                        </div>
                    }
                </div>
            </div>
        );
    };

    return (
        <div className="app-container">
            {isLoading && <div className="loading-overlay"><span>견적을 계산중입니다...</span></div>}
            <header className="app-header">
                <div className="header-content">
                    <div className="logo-container" onClick={() => history.push('/')}>
                        <img src="/assets/hoppang-character.png" alt="Hoppang Logo" className="logo-img"/>
                        <span className="logo-text">호빵</span>
                    </div>
                    <div className="header-title">견적 결과</div>
                </div>
            </header>

            <main className="main-content">
                <div className="result-header">
                    <h2 className="result-title">샷시 견적 결과</h2>
                    <p className="result-subtitle">선택하신 조건의 예상 견적입니다.</p>
                </div>
                
                {results.map(renderResultCard)}
                
                {error && <p style={{color: 'red', textAlign: 'center', marginTop: '20px'}}>{error}</p>}

            </main>
            
            <footer className="footer-actions">
                <button className="button-secondary" onClick={getOtherEstimates} disabled={isLoading}>
                    다른 회사 견적받기
                </button>
                <button className="button-primary" onClick={() => alert('견적 문의 기능은 준비중입니다.')}>
                    견적 문의하기
                </button>
            </footer>
        </div>
    );
};

export default MobileResultScreen; 