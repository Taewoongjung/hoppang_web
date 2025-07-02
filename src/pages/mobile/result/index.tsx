import React, {useEffect, useState} from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import axios from 'axios';

import './styles.css';
import '../versatile-styles.css';

import {
    addCommasToNumber,
    getLabelOfChassisType,
    mappedCompanyByValue,
} from "../../../util";
import {calculateChassisCall} from "../../../definition/apiPath";
import {Unit} from "../../../definition/unit";
import {InfoCircleOutlined} from "@ant-design/icons";
import {Tooltip} from "antd";
import {HYUNDAI, KCC_GLASS, LX} from "../../../definition/companyType";
import {RegisterChassisPayload} from "../../../definition/interfacesV2";
import InquiryEstimateChassis from "../../../component/V2/InquiryEstimateChassis";
import ExitModal from "../../../component/V2/CalculationExitModal";


const MobileResultScreen = () => {
    const history = useHistory();
    const location = useLocation<any>();

    const [results, setResults] = useState<any[]>([]);
    const [requestObject, setRequestObject] = useState<any>(null);
    const [inquiryEstimationId, setInquiryEstimationId] = useState();
    const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);
    const [inquiredList, setInquiredList] = useState<any[]>([]);

    const [yetCalculatedCompanyList, setYetCalculatedCompanyList] = useState<string[]>([
        HYUNDAI, LX, KCC_GLASS
    ]);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const [showExitModal, setShowExitModal] = useState(false);


    useEffect(() => {
        if (location.state && location.state.calculatedResult) {
            setResults([location.state.calculatedResult]);
            setRequestObject(location.state.requestObject);
        } else {
            history.replace('/calculator/agreement');
        }
    }, [location, history]);

    const getOtherEstimates = (estimatingCompany: string) => {
        if (!requestObject) return;

        const alreadyCalculatedCompanies = results.map(r => mappedCompanyByValue(r.company)) as string[];
        if (alreadyCalculatedCompanies.length >= 3) {
            setError('모든 회사의 견적을 받았습니다.');
            return;
        }

        if (yetCalculatedCompanyList.length === 0) {
            setError('더 이상 조회할 회사가 없습니다.');
            return;
        }

        setIsLoading(true);
        setError('');

        const payload: RegisterChassisPayload = {
            zipCode: requestObject.zipCode,
            state: requestObject.state,
            city: requestObject.city,
            town: requestObject.town,
            bCode: requestObject.bCode,
            remainAddress: requestObject.remainAddress,
            buildingNumber: requestObject.buildingNumber,
            isApartment: requestObject.isApartment,
            isExpanded: requestObject.isExpanded,
            reqCalculateChassisPriceList: requestObject.reqCalculateChassisPriceList.map((item: any) => ({
                ...item,
                companyType: estimatingCompany,
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
                setError(err.response?.data?.message || `[${mappedCompanyByValue(estimatingCompany)}] 견적을 받아오는데 실패했습니다.`);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    // 추가 견적 받을 리스트 소거
    useEffect(() => {
        if (!results || results.length === 0) return;

        const usedCompanies: string[] = results.map(r => r.company);

        setYetCalculatedCompanyList(prev =>
            prev.filter(company => !usedCompanies.includes(company))
        );
    }, [results]);

    const handleNewEstimate = () => {
        history.push('/calculator/agreement');
    };

    const renderResultCard = (result: any, index: number) => {
        const companyName = mappedCompanyByValue(result.company);
        const totalDiscount = result.discountedWholeCalculatedFeeAmount;
        const totalDiscountWithSurtx = result.discountedWholeCalculatedFeeWithSurtax;
        const originalPrice = result.wholeCalculatedFee + result.surtax;

        return (
            <div className="result-card" key={index}>
                {/* Company Header */}
                <div className="company-header">
                    <div className="company-badge">
                        <span className="company-name">{companyName}</span>
                    </div>
                </div>

                {/* Price Summary */}
                <div className="price-summary">
                    <div className="price-label">총 견적 금액</div>
                    <div className="total-price">
                        {addCommasToNumber(originalPrice)}
                        <span className="price-unit">원</span>
                    </div>
                    {totalDiscount > 0 && (
                        <div className="discount-info">
                            <span className="original-price">{addCommasToNumber(originalPrice)}원</span>
                            <span className="discount-badge">-{addCommasToNumber(totalDiscount)}원 할인</span>
                        </div>
                    )}
                </div>

                {/* Materials Section */}
                <div className="section">
                    <div className="section-header">
                        <h3 className="section-title">창호 항목</h3>
                    </div>
                    <div className="materials-list">
                        {result.chassisPriceResultList.map((item: any, idx: number) => {
                            const isCm = location.state.unit === Unit.CM;
                            const width = isCm ? item.width / 10 : item.width;
                            const height = isCm ? item.height / 10 : item.height;

                            return (
                                <div className="material-item" key={idx}>
                                    <div className="material-info">
                                        <span className="material-type">
                                            {getLabelOfChassisType(item.chassisType)}
                                        </span>
                                        <span className="material-size">
                                            {width}{location.state.unit} × {height}{location.state.unit}
                                        </span>
                                    </div>
                                    <div className="material-price">
                                        {addCommasToNumber(item.price)}원
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Additional Costs Section */}
                <div className="section">
                    <div className="section-header">
                        <h3 className="section-title">부가 비용</h3>
                    </div>
                    <div className="cost-list">
                        <div className="cost-item">
                            <span className="cost-label">철거비</span>
                            <span className="cost-value">{addCommasToNumber(result.demolitionFee)}원</span>
                        </div>
                        <div className="cost-item">
                            <span className="cost-label">사다리차비 ({result.customerFloor}층)</span>
                            <span className="cost-value">{addCommasToNumber(result.ladderFee)}원</span>
                        </div>
                        <div className="cost-item">
                            <span className="cost-label">보양비</span>
                            <span className="cost-value">{addCommasToNumber(result.maintenanceFee)}원</span>
                        </div>
                        <div className="cost-item">
                            <span className="cost-label">기타비용</span>
                            <span className="cost-value">{addCommasToNumber(result.deliveryFee)}원</span>
                        </div>
                        <div className="cost-item">
                            <div className="cost-label-with-info">
                                <span>시공비</span>
                                <Tooltip title="총합계에 이미 포함된 금액입니다.">
                                    <InfoCircleOutlined className="info-icon"/>
                                </Tooltip>
                            </div>
                            <span className="cost-value">{addCommasToNumber(result.laborFee)}원</span>
                        </div>
                        <div className="cost-item">
                            <span className="cost-label">부가세</span>
                            <span className="cost-value">{addCommasToNumber(result.surtax)}원</span>
                        </div>
                        {totalDiscount > 0 && (
                            <div className="cost-item discount-item">
                                <span className="cost-label">할인 금액</span>
                                <span className="cost-value discount-value">-{addCommasToNumber(totalDiscount)}원</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Button */}
                <div className="action-section">
                    {inquiredList.includes(result.estimationId) ? (
                        <button className="button-completed" disabled>
                            <span className="check-icon">✓</span>
                            문의 완료
                        </button>
                    ) : (
                        <button
                            className="button-primary"
                            onClick={() => {
                                setInquiryEstimationId(result.estimationId);
                                setIsInquiryModalOpen(true);
                            }}
                        >
                            이 견적으로 문의하기
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="app-container">
            {isLoading && (
                <div className="loading-overlay">
                    <div className="loading-content">
                        <div className="loading-spinner"></div>
                        <span>견적을 계산중입니다...</span>
                    </div>
                </div>
            )}

            <header className="app-header">
                <div className="header-content">
                    <div className="logo-container" onClick={() => setShowExitModal(true)}>
                        <img src="/assets/hoppang-character.png" alt="Hoppang Logo" className="logo-img"/>
                        <span className="logo-text">호빵</span>
                    </div>
                    <div className="header-title">견적 결과</div>
                </div>
            </header>

            <main className="main-content">
                <div className="result-header">
                    <h2 className="result-title">견적 계산 완료</h2>
                    <p className="result-subtitle">선택하신 조건에 맞는 예상 견적입니다</p>
                </div>

                {results.map(renderResultCard)}

                {/* Additional Estimates */}
                {yetCalculatedCompanyList?.length > 0 && (
                    <div className="additional-estimates">
                        <div className="additional-header">
                            <h3 className="additional-title">다른 브랜드도 비교해보세요</h3>
                            <p className="additional-subtitle">더 나은 조건을 찾아보세요</p>
                        </div>
                        <div className="company-options">
                            {yetCalculatedCompanyList.map((company) => (
                                <button
                                    key={company}
                                    className="company-option"
                                    onClick={() => getOtherEstimates(company)}
                                    disabled={isLoading}
                                >
                                    <span className="company-option-name">{mappedCompanyByValue(company)}</span>
                                    <span className="company-option-action">견적받기 →</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {error && (
                    <div className="error-banner">
                        <span className="error-icon">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {/* New Estimate Button */}
                <div className="new-estimate-section">
                    <button
                        className="button-new-estimate"
                        onClick={handleNewEstimate}
                    >
                        <span className="new-estimate-icon">🔄</span>
                        다시 견적 받으러 가기
                    </button>
                </div>
            </main>

            <InquiryEstimateChassis
                estimationId={inquiryEstimationId}
                isInquiryModalOpen={isInquiryModalOpen}
                setIsInquiryModalOpen={setIsInquiryModalOpen}
                finishedInquiry={() => {
                    setInquiredList(prev =>
                        prev.includes(inquiryEstimationId) ? prev : [...prev, inquiryEstimationId]
                    );
                }}
            />

            {showExitModal && (<ExitModal setShowExitModal={setShowExitModal}/>)}
        </div>
    );
};

export default MobileResultScreen;
