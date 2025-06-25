import React, {useState, useEffect} from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import axios from "axios";

import './styles.css';

import chassisTypeOptions from "../../../definition/chassisType";
import type { CalculateResult, RegisteringChassisV2 } from "../../../definition/interfaces";
import {Unit} from "../../../definition/unit";
import {calculateChassisCall} from "../../../definition/apiPath";
import {mappedValueByCompany} from "../../../util";

const MobileCalculationScreen = () => {
    const history = useHistory();
    const location = useLocation<{ companyType?: string }>();
    const companyType = location.state?.companyType;

    useEffect(() => {
        if (!companyType) {
            history.push('/mobile/companies');
        }
    }, [companyType, history]);

    // Screen State
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    // Step 1: Chassis Info
    const [registeredList, setRegisteredList] = useState<RegisteringChassisV2[]>([]);
    const [chassisType, setChassisType] = useState<string>('선택안함');
    const [width, setWidth] = useState<number | string>('');
    const [height, setHeight] = useState<number | string>('');
    const [unit, setUnit] = useState<string>(Unit.MM);

    // Step 2: Additional Info
    const [address, setAddress] = useState("");
    const [remainAddress, setRemainAddress] = useState("");
    const [floor, setFloor] = useState<number | undefined>();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isScheduledForDemolition, setIsScheduledForDemolition] = useState(true);
    const [isResident, setIsResident] = useState(true);

    // Error State
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateStep1 = () => {
        const newErrors: { [key: string]: string } = {};
        if (chassisType === '선택안함') newErrors.chassisType = '창호 종류를 선택해주세요.';
        if (!width) newErrors.width = '가로 길이를 입력해주세요.';
        if (!height) newErrors.height = '세로 길이를 입력해주세요.';

        const widthNum = Number(width);
        const heightNum = Number(height);
        const minWidth = unit === Unit.MM ? 300 : 30;
        const maxWidth = unit === Unit.MM ? 5000 : 500;
        const minHeight = unit === Unit.MM ? 300 : 30;
        const maxHeight = unit === Unit.MM ? 2600 : 260;

        if (widthNum < minWidth) newErrors.width = `최소 ${minWidth}${unit} 이상 입력해주세요.`;
        if (widthNum > maxWidth) newErrors.width = `최대 ${maxWidth}${unit} 이하로 입력해주세요.`;
        if (heightNum < minHeight) newErrors.height = `최소 ${minHeight}${unit} 이상 입력해주세요.`;
        if (heightNum > maxHeight) newErrors.height = `최대 ${maxHeight}${unit} 이하로 입력해주세요.`;

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const newErrors: { [key: string]: string } = {};
        if (!address.trim()) newErrors.address = '주소를 입력해주세요.';
        if (!floor) newErrors.floor = '층수를 입력해주세요.';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegisterChassis = () => {
        if (!validateStep1() || !companyType) return;

        const newItem: RegisteringChassisV2 = {
            index: registeredList.length > 0 ? Math.max(...registeredList.map(item => item.index)) + 1 : 1,
            chassisType: chassisType,
            width: Number(width),
            height: Number(height),
            companyType: companyType,
        };

        setRegisteredList([...registeredList, newItem]);
        setChassisType('선택안함');
        setWidth('');
        setHeight('');
        setErrors({});
    };

    const deleteRegisteredChassis = (index: number) => {
        setRegisteredList((prevList) => prevList.filter(item => item.index !== index));
    };

    const handleUnitChange = (newUnit: string) => {
        if (unit === newUnit) return;

        const isDirty = width || height || chassisType !== '선택안함' || registeredList.length > 0;
        if (isDirty) {
            const isConfirmed = window.confirm('단위 변경 시 기존 입력 및 리스트가 초기화됩니다. 변경하시겠습니까?');
            if (!isConfirmed) {
                return;
            }
        }

        setWidth('');
        setHeight('');
        setChassisType('선택안함');
        setRegisteredList([]);
        setErrors({});
        setUnit(newUnit);
    };

    const handleCalculate = () => {
        if (!validateStep2() || !companyType) return;

        setIsLoading(true);

        const reqCalculateChassisPriceList = registeredList.map((item) => {
            if (!item.companyType) return null;
            return {
                chassisType: item.chassisType,
                companyType: mappedValueByCompany(item.companyType),
                width: unit === Unit.CM ? (item.width * 10) : item.width,
                height: unit === Unit.CM ? (item.height * 10) : item.height,
                floorCustomerLiving: floor,
                isScheduledForDemolition,
                isResident
            }
        }).filter(Boolean);

        if (reqCalculateChassisPriceList.length !== registeredList.length) {
            setErrors({ general: '견적 항목에 오류가 있습니다. 다시 시도해주세요.' });
            setIsLoading(false);
            return;
        }

        const payload = {
            zipCode: "12345",
            sido: "서울특별시",
            siGunGu: "강남구",
            yupMyeonDong: "역삼동",
            bCode: "1168010100",
            remainAddress: remainAddress,
            buildingNumber: "123-45",
            isApartment: true,
            isExpanded: isExpanded,
            reqCalculateChassisPriceList
        };

        axios.post(calculateChassisCall, payload, {
            withCredentials: true,
            headers: { Authorization: localStorage.getItem("hoppang-token") },
        }).then((response) => {
                const resultData: CalculateResult = payload;
                history.push('/calculator/result', {
                    calculatedResult: response.data,
                    requestObject: resultData,
                    companyType: companyType
                });
            })
            .catch((error) => {
                console.error("Calculation failed:", error);
                setErrors({ general: error.response?.data?.message || '견적 계산에 실패했습니다. 다시 시도해주세요.' });
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    if (!companyType) {
        return <div className="app-container loading-container">창호 회사 선택 페이지로 이동합니다.</div>;
    }

    const renderContent = () => {
        if (currentStep === 1) {
            return (
                <>
                    <div className="form-group">
                        <label className="form-label">선택 된 창호 회사</label>
                        <p className="company-display">{companyType}</p>
                    </div>

                    <div className="form-group">
                        <label className="form-label">창호 종류</label>
                        <div className="select-container">
                            <select value={chassisType} onChange={(e) => setChassisType(e.target.value)} className={`custom-select ${errors.chassisType ? 'error' : ''}`}>
                                <option value="선택안함" disabled>종류를 선택하세요</option>
                                {chassisTypeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                            </select>
                            <span className="select-arrow">▼</span>
                        </div>
                        {errors.chassisType && <p className="error-message">{errors.chassisType}</p>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">사이즈 단위</label>
                        <div className="unit-toggle">
                            <button className={`unit-button ${unit === Unit.MM ? 'active' : ''}`} onClick={() => handleUnitChange(Unit.MM)}>mm</button>
                            <button className={`unit-button ${unit === Unit.CM ? 'active' : ''}`} onClick={() => handleUnitChange(Unit.CM)}>cm</button>
                        </div>
                    </div>

                    <div className="size-inputs">
                        <div className="form-group">
                            <label className="form-label">가로 길이 ({unit})</label>
                            <input type="number" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="" className={`custom-input ${errors.width ? 'error' : ''}`} />
                            {errors.width && <p className="error-message">{errors.width}</p>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">세로 길이 ({unit})</label>
                            <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="" className={`custom-input ${errors.height ? 'error' : ''}`} />
                            {errors.height && <p className="error-message">{errors.height}</p>}
                        </div>
                    </div>

                    <button className="add-button" onClick={handleRegisterChassis}>+ 추가하기</button>

                    <div className="list-section">
                        <h3 className="section-title">
                            추가된 창호 목록
                            <span className="item-count">{registeredList.length}</span>
                        </h3>
                        {registeredList.length > 0 ? (
                            <div className="registered-list">
                                {registeredList.map(item => (
                                    <div key={item.index} className="registered-item">
                                        <div className="item-content">
                                            <div className="item-icon">🪟</div>
                                            <div className="item-details">
                                                <span className="item-chassis">{chassisTypeOptions.find(o => o.value === item.chassisType)?.label}</span>
                                                <span className="item-size">{item.width}{unit} x {item.height}{unit}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => deleteRegisteredChassis(item.index)} className="delete-button">×</button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <div className="empty-icon">📦</div>
                                <div className="empty-text">
                                    <p className="empty-title">아직 추가된 창호가 없어요</p>
                                    <p className="empty-description">위에서 정보를 입력하고 추가해주세요.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            );
        } else {
            return (
                <>
                    <div className="form-group">
                        <label className="form-label">주소</label>
                        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="시/군/구 등 주소를 입력하세요" className={`custom-input ${errors.address ? 'error' : ''}`} />
                        {errors.address && <p className="error-message">{errors.address}</p>}
                    </div>
                     <div className="form-group">
                        <label className="form-label">상세주소</label>
                        <input type="text" value={remainAddress} onChange={(e) => setRemainAddress(e.target.value)} placeholder="상세주소를 입력하세요" className="custom-input" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">거주 층수</label>
                        <input type="number" value={floor || ''} onChange={(e) => setFloor(e.target.value ? Number(e.target.value) : undefined)} placeholder="예: 5" className={`custom-input ${errors.floor ? 'error' : ''}`} />
                        {errors.floor && <p className="error-message">{errors.floor}</p>}
                    </div>

                    <div className="switch-group">
                        <span className="switch-label">발코니 확장 여부</span>
                        <label className="custom-switch">
                            <input type="checkbox" checked={isExpanded} onChange={() => setIsExpanded(!isExpanded)} />
                            <span className="slider"></span>
                        </label>
                    </div>
                    <div className="switch-group">
                        <span className="switch-label">철거 진행 여부</span>
                         <label className="custom-switch">
                            <input type="checkbox" checked={isScheduledForDemolition} onChange={() => setIsScheduledForDemolition(!isScheduledForDemolition)} />
                            <span className="slider"></span>
                        </label>
                    </div>
                    <div className="switch-group">
                        <span className="switch-label">현재 거주 여부</span>
                         <label className="custom-switch">
                            <input type="checkbox" checked={isResident} onChange={() => setIsResident(!isResident)} />
                            <span className="slider"></span>
                        </label>
                    </div>
                </>
            );
        }
    };

     return (
        <div className="app-container">
            {isLoading && <div className="loading-overlay"><span>견적을 계산중입니다...</span></div>}
            <header className="app-header">
                <div className="header-content">
                    {/*TODO 입력한 것들이 초기화 된다고 알리기*/}
                    <button className="back-button" onClick={() => currentStep === 1 ? history.push('/mobile/companies') : setCurrentStep(1)}>‹</button>
                    <div className="header-title">샷시 견적</div>
                </div>

            </header>

            <main className="main-content">
                <div className="progress-indicator">
                    <div className="step done"></div>
                    <div className="step active"></div>
                    <div className="step"></div>
                </div>
                <h2 className="main-title">견적받을 창호의<br/>정보를 입력해주세요.</h2>

                {/*<div className="tabs">*/}
                {/*    <div className={`tab ${currentStep === 1 ? 'active' : ''}`} onClick={() => setCurrentStep(1)}>창호 정보</div>*/}
                {/*    <div className={`tab ${currentStep === 2 ? 'active' : ''}`} onClick={() => setCurrentStep(2)}>추가 정보</div>*/}
                {/*</div>*/}

                <div className="form-content">
                    {renderContent()}
                </div>

                {errors.general && <p className="error-message general-error">{errors.general}</p>}
            </main>

            <footer className="footer-actions">
                 {currentStep === 1 ? (
                    <button
                        className="button-primary"
                        onClick={() => {
                            if (registeredList.length === 0) {
                                setErrors({ general: '창호를 하나 이상 추가해주세요.' });
                                return;
                            }
                            setErrors({});
                            setCurrentStep(2);
                        }}
                        disabled={registeredList.length === 0}
                    >
                        다음
                    </button>
                 ) : (
                    <button className="button-primary" onClick={handleCalculate} disabled={isLoading}>
                        {isLoading ? '계산중...' : '견적 계산하기'}
                    </button>
                 )}
            </footer>
        </div>
    );
};

export default MobileCalculationScreen;
