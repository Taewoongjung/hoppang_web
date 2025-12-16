import React, { useState, useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';

import './styles.css';
import '../../versatile-styles.css';
import {HYUNDAI, KCC_GLASS, LX} from "../../../../definition/companyType";
import {getChassisTypeValue} from "../../../../definition/chassisType";
import axios from "axios";
import {calculateSimpleChassisCall, callMeData} from "../../../../definition/apiPath";
import {Unit} from "../../../../definition/unit";
import fetcher from "../../../../util/fetcher";
import useSWR from 'swr';
import { v4 as uuidv4 } from 'uuid';
import {invalidateMandatoryData} from "../util";


interface WindowInfo {
    id: string;
    name: string;
    typeKo: string;
    typeEn: string;
    width: number;
    height: number;
    color: string;
    companyType: string;
}

// 주소 정보 타입
interface AddressInfo {
    zipCode: string;
    state: string;
    city: string;
    town: string;
    bCode: string;
    remainAddress: string;
    buildingNumber: string;
    fullAddress: string;
    isApartment: boolean;
    floorCustomerLiving?: number;
}

const Step4FloorplanReview = () => {
    const history = useHistory();
    const [selectedArea, setSelectedArea] = useState<any>();
    const [selectedBay, setSelectedBay] = useState<string>('');
    const [selectedExpansion, setSelectedExpansion] = useState<string>('');
    const [windows, setWindows] = useState<WindowInfo[]>([]);
    const [editingWindow, setEditingWindow] = useState<string | null>(null);
    const [floorplanImage, setFloorplanImage] = useState<string>('');
    const [addressInfo, setAddressInfo] = useState<AddressInfo | null>(null);
    const [chassisSimpleEstimationSquareFeetId, setChassisSimpleEstimationSquareFeetId] = useState<number>();


    // 컴포넌트 마운트 시 스크롤 맨 위로
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const { data: userData, error, mutate } = useSWR(callMeData, fetcher, {
        dedupingInterval: 2000
    });

    useEffect(() => {

        // 각 필요 정보 확인
        validateMandatoryValue();

        const customerAddressInfo = localStorage.getItem('simple-estimate-address');
        const areaData = localStorage.getItem('simple-estimate-area');
        const bay = localStorage.getItem('simple-estimate-bay');
        const expansion = localStorage.getItem('simple-estimate-expansion');

        if (!areaData || !bay || !expansion) {
            // 이전 단계를 거치지 않았다면 Step 1로 돌아가기
            history.push('/calculator/simple/step1');
            return;
        }

        // 주소 정보 파싱 및 저장
        try {
            const parsedAddressInfo: AddressInfo = JSON.parse(customerAddressInfo!);
            setAddressInfo(parsedAddressInfo);
        } catch (e) {
            console.error('주소 정보 파싱 실패:', e);
            history.push('/calculator/simple/step0');
            return;
        }

        // 평수 정보 파싱 및 저장
        try {
            const parsedArea = JSON.parse(areaData);
            setSelectedArea(parsedArea);
            setChassisSimpleEstimationSquareFeetId(parsedArea.id);
        } catch (e) {
            console.error('평수 정보 파싱 실패:', e);
            history.push('/calculator/simple/step1');
            return;
        }

        setSelectedBay(bay);
        setSelectedExpansion(expansion);

        // 선택한 조건에 따라 도면 이미지와 창호 정보 설정
        setupFloorplanData(bay, expansion);
    }, [history]);

    // id별로 창호를 그룹화
    const groupedWindows = useMemo(() => {
        const groups: Record<string, WindowInfo[]> = {};

        windows.forEach((window) => {
            if (!groups[window.id]) {
                groups[window.id] = [];
            }
            groups[window.id].push(window);
        });

        return groups;
    }, [windows]);

    const validateMandatoryValue = () => {
        // 주소 정보 확인
        const customerAddressInfo = localStorage.getItem('simple-estimate-address');
        if (!customerAddressInfo) {
            // 주소 정보가 없으면 Step0로 이동
            history.push('/calculator/simple/step0');
            return;
        }

        // 평형대 정보 확인
        const chassisSimpleEstimationSquareFeet = localStorage.getItem('simple-estimate-area');
        if (!chassisSimpleEstimationSquareFeet) {
            // 평형대 정보가 없으면 Step1로 이동
            history.push('/calculator/simple/step1');
            return;
        }

        // 베이 정보 확인
        const bay = localStorage.getItem('simple-estimate-bay');
        if (!bay) {
            // 베이 정보가 없으면 Step2로 이동
            history.push('/calculator/simple/step2');
            return;
        }

        // 확장 여부 정보 확인
        const expansion = localStorage.getItem('simple-estimate-expansion');
        if (!expansion) {
            // 확장 여부 정보가 없으면 Step4로 이동
            history.push('/calculator/simple/step4');
            return;
        }
    }

    const setupFloorplanData = (bay: string, expansion: string) => {
        // 도면 이미지 설정 (선택한 조건에 따라 다른 이미지)
        const imagePath = `/assets/Floorplan/${bay}/${bay}-${expansion}.svg`;
        setFloorplanImage(imagePath);

        // 기본 창호 정보 설정 (Bay와 확장 여부에 따라)
        let defaultWindows: WindowInfo[] = [];

        if (bay === '2') {
            if (expansion === 'expanded') {
                defaultWindows = [
                    {
                        id: 'window-1',
                        name: '거실 및 주방',
                        typeKo: '발코니이중창',
                        typeEn: getChassisTypeValue('발코니이중창'),
                        width: 4000,
                        height: 2300,
                        color: '#818cf8',
                        companyType: ''
                    },
                    {
                        id: 'window-2',
                        name: '침실 1',
                        typeKo: '발코니이중창',
                        typeEn: getChassisTypeValue('발코니이중창'),
                        width: 1800,
                        height: 2300,
                        color: '#818cf8',
                        companyType: ''
                    },
                    {
                        id: 'window-2',
                        name: '침실 2',
                        typeKo: '내창이중창',
                        typeEn: getChassisTypeValue('내창이중창'),
                        width: 2000,
                        height: 2300,
                        color: '#a78bfa',
                        companyType: ''
                    },
                    {
                        id: 'window-2',
                        name: '베란다',
                        typeKo: '발코니단창',
                        typeEn: getChassisTypeValue('발코니단창'),
                        width: 3000,
                        height: 2300,
                        color: '#5eead4',
                        companyType: ''
                    },
                    {
                        id: 'window-2',
                        name: '베란다',
                        typeKo: '터닝도어',
                        typeEn: getChassisTypeValue('터닝도어'),
                        width: 900,
                        height: 2000,
                        color: '#e9edc9',
                        companyType: ''
                    },
                ];
            } else if (expansion === 'not-expanded') {
                defaultWindows = [
                    {
                        id: 'window-1',
                        name: '거실 및 주방',
                        typeKo: '거실분합창',
                        typeEn: getChassisTypeValue('거실분합창'),
                        width: 3000,
                        height: 2300,
                        color: '#f472b6',
                        companyType: ''
                    },
                    {
                        id: 'window-2',
                        name: '침실 1',
                        typeKo: '내창이중창',
                        typeEn: getChassisTypeValue('내창이중창'),
                        width: 1800,
                        height: 2300,
                        color: '#818cf8',
                        companyType: ''
                    },
                    {
                        id: 'window-2',
                        name: '침실 2',
                        typeKo: '내창이중창',
                        typeEn: getChassisTypeValue('내창이중창'),
                        width: 2000,
                        height: 2300,
                        color: '#a78bfa',
                        companyType: ''
                    },
                    {
                        id: 'window-3',
                        name: '베란다 (왼)',
                        typeKo: '발코니단창',
                        typeEn: getChassisTypeValue('발코니단창'),
                        width: 3000,
                        height: 2300,
                        color: '#5eead4',
                        companyType: ''
                    },
                    {
                        id: 'window-3',
                        name: '베란다 (오)',
                        typeKo: '발코니단창',
                        typeEn: getChassisTypeValue('발코니단창'),
                        width: 4000,
                        height: 2300,
                        color: '#5eead4',
                        companyType: ''
                    }
                ];
            }
        } else if (bay === '3') {
            if (expansion === 'expanded') {
                defaultWindows = [
                    {
                        id: 'window-1',
                        name: '주방',
                        typeKo: '발코니이중창',
                        typeEn: getChassisTypeValue('발코니이중창'),
                        width: 3000,
                        height: 1200,
                        color: '#818cf8',
                        companyType: ''
                    },
                    {
                        id: 'window-2',
                        name: '침실 2 베란다',
                        typeKo: '발코니단창',
                        typeEn: getChassisTypeValue('발코니단창'),
                        width: 2400,
                        height: 1200,
                        color: '#5eead4',
                        companyType: ''
                    },
                    {
                        id: 'window-3',
                        name: '침실 2',
                        typeKo: '거실분합창',
                        typeEn: getChassisTypeValue('거실분합창'),
                        width: 2000,
                        height: 2300,
                        color: '#f472b6',
                        companyType: ''
                    },
                    {
                        id: 'window-3',
                        name: '침실 1',
                        typeKo: '발코니이중창',
                        typeEn: getChassisTypeValue('발코니이중창'),
                        width: 3000,
                        height: 2300,
                        color: '#818cf8',
                        companyType: ''
                    },
                    {
                        id: 'window-3',
                        name: '침실 3',
                        typeKo: '발코니이중창',
                        typeEn: getChassisTypeValue('발코니이중창'),
                        width: 2000,
                        height: 2300,
                        color: '#818cf8',
                        companyType: ''
                    },
                    {
                        id: 'window-3',
                        name: '거실',
                        typeKo: '발코니이중창',
                        typeEn: getChassisTypeValue('발코니이중창'),
                        width: 4000,
                        height: 2400,
                        color: '#818cf8',
                        companyType: ''
                    }
                ];
            } else if (expansion === 'not-expanded') {
                defaultWindows = [
                    {
                        id: 'window-1',
                        name: '주방',
                        typeKo: '발코니단창',
                        typeEn: getChassisTypeValue('발코니단창'),
                        width: 3000,
                        height: 1200,
                        color: '#5eead4',
                        companyType: ''
                    },
                    {
                        id: 'window-1',
                        name: '주방',
                        typeKo: '거실분합창',
                        typeEn: getChassisTypeValue('거실분합창'),
                        width: 3000,
                        height: 2300,
                        color: '#f472b6',
                        companyType: ''
                    },
                    {
                        id: 'window-2',
                        name: '침실 2 베란다',
                        typeKo: '발코니단창',
                        typeEn: getChassisTypeValue('발코니단창'),
                        width: 2000,
                        height: 1200,
                        color: '#5eead4',
                        companyType: ''
                    },
                    {
                        id: 'window-3',
                        name: '침실 2',
                        typeKo: '거실분합창',
                        typeEn: getChassisTypeValue('거실분합창'),
                        width: 2000,
                        height: 2300,
                        color: '#f472b6',
                        companyType: ''
                    },
                    {
                        id: 'window-3',
                        name: '침실 1',
                        typeKo: '내창이중창',
                        typeEn: getChassisTypeValue('내창이중창'),
                        width: 3000,
                        height: 1800,
                        color: '#a78bfa',
                        companyType: ''
                    },
                    {
                        id: 'window-3',
                        name: '거실',
                        typeKo: '거실분합창',
                        typeEn: getChassisTypeValue('거실분합창'),
                        width: 4000,
                        height: 2400,
                        color: '#f472b6',
                        companyType: ''
                    },
                    {
                        id: 'window-3',
                        name: '베란다-1',
                        typeKo: '발코니단창',
                        typeEn: getChassisTypeValue('발코니단창'),
                        width: 4000,
                        height: 2300,
                        color: '#5eead4',
                        companyType: ''
                    },
                    {
                        id: 'window-3',
                        name: '베란다-2',
                        typeKo: '발코니단창',
                        typeEn: getChassisTypeValue('발코니단창'),
                        width: 3000,
                        height: 2300,
                        color: '#5eead4',
                        companyType: ''
                    },
                    {
                        id: 'window-3',
                        name: '침실 3',
                        typeKo: '거실분합창',
                        typeEn: getChassisTypeValue('거실분합창'),
                        width: 2000,
                        height: 2300,
                        color: '#f472b6',
                        companyType: ''
                    },
                    {
                        id: 'window-3',
                        name: '침실 3 베란다',
                        typeKo: '발코니단창',
                        typeEn: getChassisTypeValue('발코니단창'),
                        width: 2000,
                        height: 2300,
                        color: '#5eead4',
                        companyType: ''
                    }
                ];
            }
        }

        setWindows(defaultWindows);
    };

    const windowTypes = [
        '시스템창',
        '슬라이딩창',
        '여닫이창',
        '고정창',
        '단창',
        '이중창'
    ];

    const handleWindowUpdate = (windowId: string, windowName: string, field: string, value: any) => {
        setWindows(windows.map(w =>
            w.id === windowId && w.name === windowName ? {...w, [field]: value} : w
        ));
    };

    const handleCalculate = async () => {

        validateMandatoryValue();

        const groupId = uuidv4();
        const companies = [HYUNDAI, LX, KCC_GLASS];
        const promises = companies.map(async (companyType) => {
            const reqCalculateChassisPriceList = windows.map((item) => {

                return {
                    chassisType: item.typeEn,
                    companyType: companyType,
                    width: item.width,
                    height: item.height,
                    floorCustomerLiving: addressInfo?.floorCustomerLiving,
                    isScheduledForDemolition: true,
                    isResident: false
                };
            }).filter(Boolean);

            const payload = {
                zipCode: addressInfo?.zipCode,
                state: addressInfo?.state,
                city: addressInfo?.city,
                town: addressInfo?.town,
                bCode: addressInfo?.bCode,
                remainAddress: addressInfo?.remainAddress,
                buildingNumber: addressInfo?.buildingNumber,
                isApartment: addressInfo?.isApartment,
                isExpanded: selectedExpansion === 'expanded',
                chassisSimpleEstimationSquareFeetId: chassisSimpleEstimationSquareFeetId,
                bay: selectedBay,
                groupId: groupId,
                reqCalculateChassisPriceList
            };

            const response = await axios.post(calculateSimpleChassisCall, payload, {
                withCredentials: true,
                headers: { Authorization: localStorage.getItem("hoppang-token") },
            });

            return response.data;
        });

        const allResults = await Promise.all(promises);

        const requestObject = {
            zipCode: addressInfo?.zipCode,
            state: addressInfo?.state,
            city: addressInfo?.city,
            town: addressInfo?.town,
            bCode: addressInfo?.bCode,
            remainAddress: addressInfo?.remainAddress,
            buildingNumber: addressInfo?.buildingNumber,
            isApartment: addressInfo?.isApartment,
            isExpanded: selectedExpansion === 'expanded',
            chassisSimpleEstimationSquareFeetId: chassisSimpleEstimationSquareFeetId,
            bay: selectedBay,
            reqCalculateChassisPriceList: windows.flatMap((item) =>
                companies.map(companyType => ({
                    chassisType: item.typeEn,
                    companyType: companyType,
                    width: item.width,
                    height: item.height,
                    floorCustomerLiving: addressInfo?.floorCustomerLiving,
                    isScheduledForDemolition: true,
                    isResident: true
                }))
            )
        };

        await mutate();

        await invalidateMandatoryData();

        await history.push('/calculator/result', {
            calculatedResults: allResults,
            requestObject: requestObject,
            companyType: '모르겠어요',
            unit: Unit.MM,
            userData: userData
        });
    };

    const handleBack = () => {
        history.goBack();
    };

    const getAreaLabel = (area: any) => {
        return area?.type;
    }

    const getBayLabel = (bay: string) => {
        return bay === '2bay' ? '2Bay' : '3Bay';
    };

    const getExpansionLabel = (expansion: string) => {
        return expansion === 'expanded' ? '확장 O' : '확장 X';
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
                <div style={{width: '24px'}}></div>
            </header>

            {/* Progress Bar */}
            <div className="progress-container">
                <div className="progress-bar">
                    <div className="progress-fill" style={{width: '100%'}}></div>
                </div>
                <p className="progress-text">5/5 단계</p>
            </div>

            {/* Main Content */}
            <main className="simple-estimate-content floorplan-content">
                <div className="step-intro">
                    <h2 className="step-title">도면을 확인하고<br/>수정해주세요</h2>
                    <p className="step-subtitle">각 창호의 정보를 확인하고 수정할 수 있어요</p>
                </div>

                {/* Selection Summary */}
                <div className="selection-summary-detailed">
                    <div className="summary-item-inline">
                        <span className="summary-label-inline">평수</span>
                        <span className="summary-value-inline">{getAreaLabel(selectedArea)}</span>
                    </div>
                    <div className="summary-divider-inline"></div>
                    <div className="summary-item-inline">
                        <span className="summary-label-inline">Bay</span>
                        <span className="summary-value-inline">{getBayLabel(selectedBay)}</span>
                    </div>
                    <div className="summary-divider-inline"></div>
                    <div className="summary-item-inline">
                        <span className="summary-label-inline">확장</span>
                        <span className="summary-value-inline">{getExpansionLabel(selectedExpansion)}</span>
                    </div>
                </div>

                {/* Floorplan Image */}
                <div className="floorplan-image-container">
                    <div className="floorplan-image-wrapper">
                        <img
                            src={floorplanImage}
                            alt="도면"
                            className="floorplan-image"
                            onError={(e) => {
                                // 이미지 로드 실패 시 3bay 기본 이미지 사용
                                e.currentTarget.src = '/assets/Floorplan/3bay/3bay-not-expanded.svg';
                            }}
                        />
                    </div>
                </div>

                {/* Windows List - 그룹화된 창호 */}
                <div className="windows-section">
                    <div className="section-header-small">
                        <h3 className="section-title-small">창호 정보</h3>
                        <p className="section-subtitle-small">
                            {windows.length}개의 창호 ({Object.keys(groupedWindows).length}개 그룹)
                        </p>
                    </div>

                    <div className="windows-list">
                        {Object.entries(groupedWindows).map(([groupId, windowGroup]) => (
                            <div key={groupId} className="window-group">
                                <div className="window-group-header">
                                    <span className="window-group-badge">그룹 {groupId.split('-')[1]}</span>
                                    <span className="window-group-count">{windowGroup.length}개</span>
                                </div>

                                {windowGroup.map((window, index) => (
                                    <div
                                        key={`${window.id}-${window.name}-${index}`}
                                        className={`window-card ${editingWindow === `${window.id}-${window.name}` ? 'editing' : ''}`}
                                    >
                                        <div className="window-card-header">
                                            <div className="window-name-section">
                                                <h4 className="window-name">{window.name}</h4>
                                            </div>
                                            <button
                                                className="window-edit-button"
                                                onClick={() => setEditingWindow(
                                                    editingWindow === `${window.id}-${window.name}` ? null : `${window.id}-${window.name}`
                                                )}
                                            >
                                                {editingWindow === `${window.id}-${window.name}` ? (
                                                    <>
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                            <path d="M5 12L10 17L20 7" stroke="currentColor"
                                                                  strokeWidth="2" strokeLinecap="round"
                                                                  strokeLinejoin="round"/>
                                                        </svg>
                                                        <span>완료</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                            <path
                                                                d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
                                                                stroke="currentColor" strokeWidth="2"
                                                                strokeLinecap="round" strokeLinejoin="round"/>
                                                        </svg>
                                                        <span>수정</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        {editingWindow === `${window.id}-${window.name}` ? (
                                            <div className="window-edit-form">
                                                <div className="form-group">
                                                    <label className="form-label">창호 종류</label>
                                                    <select
                                                        className="form-select"
                                                        value={window.typeKo}
                                                        onChange={(e) => handleWindowUpdate(window.id, window.name, 'type', e.target.value)}
                                                    >
                                                        {windowTypes.map(type => (
                                                            <option key={type} value={type}>{type}</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className="form-row">
                                                    <div className="form-group">
                                                        <label className="form-label">너비 (mm)</label>
                                                        <input
                                                            type="number"
                                                            className="form-input"
                                                            value={window.width}
                                                            onChange={(e) => handleWindowUpdate(window.id, window.name, 'width', parseInt(e.target.value))}
                                                            min="100"
                                                            step="100"
                                                        />
                                                    </div>

                                                    <div className="form-group">
                                                        <label className="form-label">높이 (mm)</label>
                                                        <input
                                                            type="number"
                                                            className="form-input"
                                                            value={window.height}
                                                            onChange={(e) => handleWindowUpdate(window.id, window.name, 'height', parseInt(e.target.value))}
                                                            min="100"
                                                            step="100"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="window-info-display">
                                                <div className="info-item">
                                                    <span className="info-label">종류</span>
                                                    <span className="info-value">
                                                        <div
                                                            className="window-color-indicator"
                                                            style={{backgroundColor: window.color}}
                                                        ></div>
                                                        {window.typeKo}
                                                    </span>
                                                </div>
                                                <div className="info-item">
                                                    <span className="info-label">크기</span>
                                                    <span className="info-value">
                                                        {window.width} × {window.height} mm
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="info-box">
                    <span className="info-icon">💡</span>
                    <p className="info-text">
                        정확한 치수를 모르시면<br/>
                        <strong>수정하지 않고 그대로 진행</strong>하셔도 됩니다
                    </p>
                </div>
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
                    className="nav-button primary calculate-button"
                    onClick={handleCalculate}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{marginRight: '8px'}}>
                        <path
                            d="M9 7H6C5.46957 7 4.96086 7.21071 4.58579 7.58579C4.21071 7.96086 4 8.46957 4 9V18C4 18.5304 4.21071 19.0391 4.58579 19.4142C4.96086 19.7893 5.46957 20 6 20H15C15.5304 20 16.0391 19.7893 16.4142 19.4142C16.7893 19.0391 17 18.5304 17 18V15M9 12L12 15M20.385 6.585C20.7788 6.19115 21.0001 5.65698 21.0001 5.1C21.0001 4.54302 20.7788 4.00885 20.385 3.615C19.9912 3.22115 19.457 2.99989 18.9 2.99989C18.343 2.99989 17.8088 3.22115 17.415 3.615L9 12V15H12L20.385 6.585Z"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    견적 계산하기
                </button>
            </div>
        </div>
    );
};

export default Step4FloorplanReview;
