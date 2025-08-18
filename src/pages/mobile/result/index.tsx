import React, {useEffect, useState} from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import axios from 'axios';

import './styles.css';
import '../versatile-styles.css';

import {
    addCommasToNumber,
    getLabelOfChassisType,
    mappedCompanyByValue, mappedCompanyLogoPathByValue,
} from "../../../util";
import {calculateChassisCall} from "../../../definition/apiPath";
import {Unit} from "../../../definition/unit";
import {InfoCircleOutlined} from "@ant-design/icons";
import {Tooltip} from "antd";
import {HYUNDAI, KCC_GLASS, LX} from "../../../definition/companyType";
import {RegisterChassisPayload} from "../../../definition/interfacesV2";
import InquiryEstimateChassis from "../../../component/V2/InquiryEstimateChassis";
import CalculationResultExitModal from "../../../component/V2/Modal/CalculationResultExitModal";
import LaborFeeAlertModal from "../../../component/V2/Modal/LaborFeeAlertModal";
import {EnhancedGoToTopButton} from "../../../util/renderUtil";


interface InquiryStatus {
    kakao: boolean;
    call: boolean;
    callback: boolean;
}

interface EstimationInquiryStatus {
    [estimationId: string]: InquiryStatus;
}

const MobileResultScreen = () => {
    const history = useHistory();
    const location = useLocation<any>();

    const [results, setResults] = useState<any[]>([]);
    const [requestObject, setRequestObject] = useState<any>(null);
    const [inquiryEstimationId, setInquiryEstimationId] = useState();
    const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

    // 📌 기존의 단순 배열 대신 개별 견적별 문의 상태 관리
    const [inquiryStatuses, setInquiryStatuses] = useState<EstimationInquiryStatus>({});

    const [yetCalculatedCompanyList, setYetCalculatedCompanyList] = useState<string[]>([
        HYUNDAI, LX, KCC_GLASS
    ]);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showExitModal, setShowExitModal] = useState(false);

    const [isLaborFeeMinimumSize, setIsLaborFeeMinimumSize] = useState(false);
    const [showMinimumLaborFeeModal, setShowMinimumLaborFeeModal] = useState(false);
    const [hasShownMinimumLaborFeeModal, setHasShownMinimumLaborFeeModal] = useState(false);

    // 📌 문의 완료 핸들러 - 특정 견적의 특정 문의 방식 업데이트
    const handleInquiryComplete = (estimationId: any, inquiryTypes: string[]) => {
        setInquiryStatuses(prev => {
            const currentStatus = prev[estimationId] || { kakao: false, call: false, callback: false };
            const updatedStatus = { ...currentStatus };

            // 완료된 문의 타입들을 true로 설정
            inquiryTypes.forEach(type => {
                if (type in updatedStatus) {
                    updatedStatus[type as keyof InquiryStatus] = true;
                }
            });

            return {
                ...prev,
                [estimationId]: updatedStatus
            };
        });
    };

    useEffect(() => {
        // 첫 번째 결과가 있을 때 기본시공비 여부 확인
        if (!hasShownMinimumLaborFeeModal) {
            if (results.length === 1 || results.length === 3) {
                const firstResult = results[0];
                const hasLaborFee = !!(firstResult.laborFee && firstResult.laborFee > 0);
                setIsLaborFeeMinimumSize(hasLaborFee);
                setShowMinimumLaborFeeModal(hasLaborFee);
            }
        }
    }, [results]);

    // 📌 특정 견적의 문의 상태 확인 헬퍼 함수
    const getInquiryStatus = (estimationId: any) => {
        const status = inquiryStatuses[estimationId];
        if (!status) {
            return {
                hasAnyInquiry: false,
                completedCount: 0,
                inquiryStatus: { kakao: false, call: false, callback: false }
            };
        }

        const completedCount = Object.values(status).filter(Boolean).length;
        const hasAnyInquiry = completedCount > 0;

        return {
            hasAnyInquiry,
            completedCount,
            inquiryStatus: status
        };
    };

    // 기존 useEffect들 유지...
    useEffect(() => {
        const unblock = history.block((location: any, action: string) => {
            if (action === 'POP') {
                setShowExitModal(true);
                return false;
            }
            return true;
        });

        return () => {
            unblock();
        };
    }, [history]);

    useEffect(() => {
        if (location.state && (location.state.calculatedResult || location.state.calculatedResults)) {

            location.state.calculatedResult ?
                setResults([location.state.calculatedResult]) // 특정 하나의 창호 브랜드일 때
                :
                setResults(location.state.calculatedResults) // '모르겠어요' 일 때 전체를 나타내줘야할 때

            setRequestObject(location.state.requestObject);

        } else {
            window.location.href = '/calculator/agreement';
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

    useEffect(() => {
        if (!results || results.length === 0) return;

        const usedCompanies: string[] = results.map(r => r.company);

        setYetCalculatedCompanyList(prev =>
            prev.filter(company => !usedCompanies.includes(company))
        );
    }, [results]);

    const handleNewEstimate = () => {
        window.location.href = '/calculator/agreement';
    };

    // 📌 브랜드 비교 요약 표 렌더링
    const renderComparisonTable = () => {
        if (results.length < 2) return null;

        const sortedResults = [...results].sort((a, b) => {
            const priceA = a.wholeCalculatedFee + a.surtax - (a.discountedWholeCalculatedFeeAmount || 0);
            const priceB = b.wholeCalculatedFee + b.surtax - (b.discountedWholeCalculatedFeeAmount || 0);
            return priceA - priceB;
        });

        const scrollToCard = (estimationId: any) => {
            const cardElement = document.getElementById(`result-card-${estimationId}`);
            if (cardElement) {
                cardElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                    inline: 'nearest'
                });
                // 부드러운 하이라이트 효과
                cardElement.classList.add('highlight-card');
                setTimeout(() => {
                    cardElement.classList.remove('highlight-card');
                }, 2000);
            }
        };

        return (
            <div className="comparison-table-container">
                <div className="comparison-header">
                    <h3 className="comparison-title">브랜드 비교</h3>
                    <p className="comparison-subtitle">총 견적 금액순으로 정렬된 견적을 확인하세요</p>
                </div>

                <div className="comparison-table">
                    {sortedResults.map((result, index) => {
                        const finalPrice = result.wholeCalculatedFee + result.surtax - (result.discountedWholeCalculatedFeeAmount || 0);
                        const { hasAnyInquiry, completedCount } = getInquiryStatus(result.estimationId);
                        const isLowest = index === 0;

                        return (
                            <div
                                key={result.estimationId}
                                className={`comparison-row ${isLowest ? 'lowest-price' : ''}`}
                                onClick={() => scrollToCard(result.estimationId)}
                            >
                                <div className="comparison-company">
                                    <div className="company-rank-badge">
                                        {index + 1}
                                    </div>
                                    <div className="company-info">
                                        <span className="company-name-text">
                                            <img
                                                src={mappedCompanyLogoPathByValue(result.company)}
                                                style={{width:'100%'}}
                                            />
                                        </span>
                                        {hasAnyInquiry && (
                                            <span className="inquiry-badge-small">
                                                문의완료({completedCount})
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="comparison-price">
                                    {isLowest && (
                                        <span className="lowest-badge">최저가</span>
                                    )}
                                    <span className="price-amount">{addCommasToNumber(finalPrice)}원</span>
                                    {result.discountedWholeCalculatedFeeAmount > 0 && (
                                        <span className="discount-info-small">
                                            {addCommasToNumber(result.discountedWholeCalculatedFeeAmount)}원 할인
                                        </span>
                                    )}
                                </div>

                                <br/>
                                <div className="comparison-action">
                                    <span className="action-text">상세보기</span>
                                    <span className="action-arrow">→</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/*<div className="comparison-footer">*/}
                {/*    <p className="comparison-note">*/}
                {/*        💡 가격은 최종 금액입니다*/}
                {/*    </p>*/}
                {/*</div>*/}
            </div>
        );
    };

    // 📌 개별 견적 상태 반영
    const renderResultCard = (result: any, index: number) => {
        const totalDiscount = result.discountedWholeCalculatedFeeAmount;
        const totalDiscountWithSurtx = result.discountedWholeCalculatedFeeWithSurtax;
        const originalPrice = result.wholeCalculatedFee + result.surtax;

        // 📌 현재 견적의 문의 상태 확인
        const { hasAnyInquiry, completedCount, inquiryStatus } = getInquiryStatus(result.estimationId);

        return (
            <div className="result-card" key={index} id={`result-card-${result.estimationId}`}>
                {/* Company Header */}
                <div className="company-header">
                    <div className="company-badge">
                        <span className="company-name">
                            <img
                                src={mappedCompanyLogoPathByValue(result.company)}
                                style={{width:'100%'}}
                            />
                        </span>
                        {/* 📌 문의 상태 표시 추가 */}
                        {hasAnyInquiry && (
                            <span className="inquiry-indicator">
                                ✓ 문의완료({completedCount})
                            </span>
                        )}
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
                        {isLaborFeeMinimumSize &&
                            <div className="cost-item">
                                <div className="cost-label-with-info">
                                    <span>시공비</span>
                                    <Tooltip title="총합계에 이미 포함된 금액입니다.">
                                        <InfoCircleOutlined className="info-icon"/>
                                    </Tooltip>
                                </div>
                                <span className="cost-value">{addCommasToNumber(result.laborFee)}원</span>
                            </div>
                        }
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

                {/* 📌 개별 견적별 Action Section */}
                <div className="action-section">
                    {hasAnyInquiry ? (
                        // 문의 완료 상태 - 개별 견적
                        <div className="inquiry-status-container">
                            <div className="inquiry-status-header">
                                <div className="inquiry-status-badge">
                                    <span className="status-icon">✓</span>
                                    <span className="status-text">
                                        문의 완료 ({completedCount}개 방법)
                                    </span>
                                </div>
                            </div>

                            {/* 📌 완료된 문의 방법 표시 */}
                            <div className="inquiry-methods">
                                {inquiryStatus.kakao && (
                                    <div className="inquiry-method completed">
                                        <span className="method-icon">💬</span>
                                        <span className="method-text">카카오톡</span>
                                    </div>
                                )}
                                {inquiryStatus.call && (
                                    <div className="inquiry-method completed">
                                        <span className="method-icon">📞</span>
                                        <span className="method-text">전화연결</span>
                                    </div>
                                )}
                                {inquiryStatus.callback && (
                                    <div className="inquiry-method completed">
                                        <span className="method-icon">📋</span>
                                        <span className="method-text">상담신청</span>
                                    </div>
                                )}
                            </div>

                            <p className="inquiry-status-message">
                                담당자가 빠르게 연락드릴 예정입니다
                            </p>

                            <button
                                className="button-secondary"
                                onClick={() => {
                                    setInquiryEstimationId(result.estimationId);
                                    setIsInquiryModalOpen(true);
                                }}
                            >
                                <span className="button-icon">💬</span>
                                추가 문의하기
                            </button>
                        </div>
                    ) : (
                        // 기본 상태 - 개별 견적
                        <button
                            className="button-primary"
                            onClick={() => {
                                setInquiryEstimationId(result.estimationId);
                                setIsInquiryModalOpen(true);
                            }}
                        >
                            <span className="button-icon">💬</span>
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
                </div>
            </header>

            <main className="main-content">
                {results.length === 1 &&
                    <div className="result-header">
                        <h2 className="result-title">🎉견적 계산 완료</h2>
                        <p className="result-subtitle">
                            {location.state.userData.nickname ?
                                location.state.userData.nickname : location.state.userData.name}님이 요청하신 견적입니다
                        </p>
                    </div>
                }

                {renderComparisonTable()}

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
                                    <span className="company-option-name">
                                        {
                                            <img
                                                src={mappedCompanyLogoPathByValue(company)}
                                                style={{width:'150px'}}
                                            />
                                        }
                                    </span><br/>
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
                        다시 견적 받으러 가기
                    </button>
                </div>
            </main>

            {/* 📌 개별 견적 상태를 전달하는 모달 */}
            <InquiryEstimateChassis
                estimationId={inquiryEstimationId}
                isInquiryModalOpen={isInquiryModalOpen}
                setIsInquiryModalOpen={setIsInquiryModalOpen}
                finishedInquiry={(inquiryTypes: string[]) => {
                    if (inquiryEstimationId) {
                        handleInquiryComplete(inquiryEstimationId, inquiryTypes);
                    }
                }}
                // 📌 현재 견적의 기존 문의 상태 전달
                initialInquiryStatus={inquiryEstimationId ?
                    getInquiryStatus(inquiryEstimationId).inquiryStatus :
                    { kakao: false, call: false, callback: false }
                }
            />

            {showExitModal && (<CalculationResultExitModal setShowExitModal={setShowExitModal}/>)}

            <LaborFeeAlertModal
                isOpen={showMinimumLaborFeeModal}
                onClose={() => {
                    setShowMinimumLaborFeeModal(false);
                    setHasShownMinimumLaborFeeModal(true);
                }}
            />

            <EnhancedGoToTopButton
                onGoToList={undefined}
                showListButton={false}
            />
        </div>
    );
};

export default MobileResultScreen;
