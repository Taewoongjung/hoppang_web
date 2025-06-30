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
                                철거비
                            </div>
                            <div className="cost-item-value">{addCommasToNumber(result.demolitionFee)}원</div>
                        </div>

                        <div className="cost-table-row">
                            <div className="cost-item-label">
                                사다리차비 ({result.customerFloor}층)
                            </div>
                            <div className="cost-item-value">{addCommasToNumber(result.ladderFee)}원</div>
                        </div>

                        <div className="cost-table-row">
                            <div className="cost-item-label">
                                보양비
                            </div>
                            <div className="cost-item-value">{addCommasToNumber(result.maintenanceFee)}원</div>
                        </div>

                        <div className="cost-table-row">
                            <div className="cost-item-label">
                                기타비용
                            </div>
                            <div className="cost-item-value">{addCommasToNumber(result.deliveryFee)}원</div>
                        </div>

                        <div className="cost-table-row">
                            <div className="cost-item-label">
                                시공비
                                <div className="tooltip-container">
                                    <Tooltip title="총합계에 이미 포함된 금액입니다.">
                                        <InfoCircleOutlined style={{ color: '#888' }}/>
                                    </Tooltip>
                                </div>
                            </div>
                            <div className="cost-item-value">{addCommasToNumber(result.laborFee)}원</div>
                        </div>

                        <div className="cost-table-row">
                            <div className="cost-item-label">
                                부가세
                            </div>
                            <div className="cost-item-value">{addCommasToNumber(result.surtax)}원</div>
                        </div>

                        {totalDiscount > 0 && (
                            <div className="cost-table-row discount-row">
                                <div className="cost-item-label">
                                    할인 금액
                                </div>
                                <div className="cost-item-value discount-value">-{addCommasToNumber(totalDiscount)}원</div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="inquiry-section">
                    {inquiredList.includes(result.estimationId) ?
                        <button className="button-disabled" disabled>
                            ✔ 문의 완료
                        </button>

                        :

                        <button
                            className="button-primary"
                            onClick={() => {
                                setInquiryEstimationId(result.estimationId);
                                setIsInquiryModalOpen(true);
                            }}
                        >
                            해당 견적 문의
                        </button>
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
                    <div className="logo-container" onClick={() => history.push('/chassis/v2/calculator')}>
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

                {/* 추가견적 받기 */}
                {yetCalculatedCompanyList?.length > 0 && (
                    <div className="extra-estimate-wrapper">
                        <p className="extra-estimate-title">다른 회사도 비교해보세요 👀</p>
                        <div className="company-estimate-options">
                            {yetCalculatedCompanyList.map((company) => (
                                <div className="company-estimate-card" key={company}>
                                    <button
                                        className="company-estimate-button"
                                        onClick={() => getOtherEstimates(company)}
                                        disabled={isLoading}
                                    >
                                        <div className="company-name">{mappedCompanyByValue(company)}</div>
                                        <div className="cta-text">견적받기 →</div>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                {error && <p style={{color: 'red', textAlign: 'center', marginTop: '20px'}}>{error}</p>}

            </main>

            {/*<footer className="footer-actions">*/}
            {/*    <button className="button-secondary" disabled={isLoading}>*/}
            {/*        하이*/}
            {/*    </button>*/}
            {/*</footer>*/}

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
        </div>
    );
};

export default MobileResultScreen;
