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
import {Unit} from "../../../definition/unit";
import {InfoCircleOutlined} from "@ant-design/icons";
import {Tooltip} from "antd";


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
        const totalDiscountWithSurtx = result.discountedWholeCalculatedFeeWithSurtax;
        const originalPrice = result.wholeCalculatedFee + result.surtax;

        return (
            <div className="result-card" key={index}>
                <div className="company-header">
                    <span className="company-name">{companyName}</span>
                </div>

                <div className="price-summary">
                    <div className="price-label">최종 견적 금액</div>
                    <div className="total-price">{addCommasToNumber(originalPrice)}원</div>
                    {totalDiscount > 0 && (
                        <div className="original-price">{addCommasToNumber(originalPrice)}원</div>
                    )}
                </div>

                <div className="details-section">
                    <div className="materials-header">
                        <div className="materials-icon">🏗️</div>
                        <div className="details-title">재료비</div>
                    </div>
                    <div className="materials-grid">
                        {result.chassisPriceResultList.map((item: any, idx: number) => {
                            const isCm = location.state.unit === Unit.CM;
                            const width = isCm ? item.width / 10 : item.width;
                            const height = isCm ? item.height / 10 : item.height;

                            return (
                                <div className="material-card" key={idx}>
                                    <div className="material-type">
                                        <span className="material-type-label">{getLabelOfChassisType(item.chassisType)}</span>
                                    </div>
                                    <div className="material-specs">
                                        <div className="spec-item">
                                            <span className="spec-icon">📏</span>
                                            <span className="spec-value">{width}{location.state.unit} × {height}{location.state.unit}</span>
                                        </div>
                                    </div>
                                    <div className="material-price">
                                        <span className="price-amount">{addCommasToNumber(item.price)}원</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <hr className="section-divider"/>

                    <div className="details-title" style={{marginTop: '20px'}}>부가 비용</div>
                    <div className="cost-table">
                        <div className="cost-table-row">
                            <div className="cost-item-label">
                                <span className="cost-icon">🔧</span>
                                철거비
                            </div>
                            <div className="cost-item-value">{addCommasToNumber(result.demolitionFee)}원</div>
                        </div>

                        <div className="cost-table-row">
                            <div className="cost-item-label">
                                <span className="cost-icon">🚛</span>
                                사다리차비 ({result.customerFloor}층)
                            </div>
                            <div className="cost-item-value">{addCommasToNumber(result.ladderFee)}원</div>
                        </div>

                        <div className="cost-table-row">
                            <div className="cost-item-label">
                                <span className="cost-icon">🛡️</span>
                                보양비
                            </div>
                            <div className="cost-item-value">{addCommasToNumber(result.maintenanceFee)}원</div>
                        </div>

                        <div className="cost-table-row">
                            <div className="cost-item-label">
                                <span className="cost-icon">📦</span>
                                기타비용
                            </div>
                            <div className="cost-item-value">{addCommasToNumber(result.deliveryFee)}원</div>
                        </div>

                        <div className="cost-table-row">
                            <div className="cost-item-label">
                                <span className="cost-icon">📄</span>
                                부가세
                            </div>
                            <div className="cost-item-value">{addCommasToNumber(result.surtax)}원</div>
                        </div>

                        <div className="cost-table-row">
                            <div className="cost-item-label">
                                <span className="cost-icon">👷</span>
                                시공비
                                <div className="tooltip-container">
                                    <Tooltip title="총합계에 이미 포함된 금액입니다.">
                                        <InfoCircleOutlined style={{ color: '#888' }}/>
                                    </Tooltip>
                                </div>
                            </div>
                            <div className="cost-item-value">{addCommasToNumber(result.laborFee)}원</div>
                        </div>

                        {totalDiscount > 0 && (
                            <div className="cost-table-row discount-row">
                                <div className="cost-item-label">
                                    <span className="cost-icon">💰</span>
                                    할인 금액
                                </div>
                                <div className="cost-item-value discount-value">-{addCommasToNumber(totalDiscount)}원</div>
                            </div>
                        )}
                    </div>
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
