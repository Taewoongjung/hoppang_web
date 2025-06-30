import React, {useEffect, useState} from 'react';
import { useHistory } from 'react-router-dom';
import axios from "axios";

import './styles.css';
import './current1-styles.css';
import '../versatile-styles.css';

import chassisTypeOptions from "../../../definition/chassisType";
import type { RegisteringChassisV2 } from "../../../definition/interfacesV2";
import {Unit} from "../../../definition/unit";
import {calculateChassisCall, callMeData} from "../../../definition/apiPath";
import {mappedValueByCompany} from "../../../util";
import {LeftOutlined} from "@ant-design/icons";
import {companyTypeOptionsString} from "../../../definition/companyType";
import ExitModal from "../../../component/V2/ExitModal";
import AddressInputModal from "../../../component/V2/AddressInputModal";
import useSWR from "swr";
import fetcher from "../../../util/fetcher";
import {RegisterChassisPayload} from "../../../definition/interfacesV2";


const MobileCalculationScreen = () => {
    const history = useHistory();

    const { data: userData, error, mutate } = useSWR(callMeData, fetcher, {
        dedupingInterval: 2000
    });

    const [showExitModal, setShowExitModal] = useState(false);

    useEffect(() => {
        // 뒤로가기 감지
        const unblock = history.block((location: any, action: string) => {
            if (action === 'POP') {
                setShowExitModal(true); // 상태만 바꾸고
                return false; // 페이지 이동을 막음
            }

            return true; // 나머지는 허용
        });

        return () => {
            unblock(); // cleanup
        };
    }, [history]);


    // Screen State
    const [currentStep, setCurrentStep] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Step 0: 샷시 회사 선택
    const [selectedCompany, setSelectedCompany] = useState('');

    // Step 1: Chassis Info
    const [registeredList, setRegisteredList] = useState<RegisteringChassisV2[]>([]);
    const [chassisType, setChassisType] = useState<string>('선택안함');
    const [width, setWidth] = useState<number | string>('');
    const [height, setHeight] = useState<number | string>('');
    const [unit, setUnit] = useState<string>(Unit.MM);

    // Step 2: 주소
    const [showAddressModal, setShowAddressModal] = useState<boolean>(false);
    const [address, setAddress] = useState<string>('');
    const [addressZoneCode, setAddressZoneCode] = useState<string>('');
    const [remainAddress, setRemainAddress] = useState<string>('');
    const [addressBuildingNum, setAddressBuildingNum] = useState<string>('');
    const [sido, setSido] = useState<string>('');
    const [siGunGu, setSiGunGu] = useState<string>('');
    const [yupMyeonDong, setYupMyeonDong] = useState<string>('');
    const [bCode, setBCode] = useState<string>('');
    const [isApartment, setIsApartment] = useState<boolean>(false);

    // Step 3: 기타 추가 정보
    const [floor, setFloor] = useState<number | undefined>();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isScheduledForDemolition, setIsScheduledForDemolition] = useState(true);
    const [isResident, setIsResident] = useState(true);

    // Error State
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validateStep1 = () => {
        const newErrors: { [key: string]: string } = {};
        if (chassisType === '선택안함') newErrors.chassisType = '샷시 종류를 선택해주세요.';
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
        if (!validateStep1() || !selectedCompany) return;

        const newItem: RegisteringChassisV2 = {
            index: registeredList.length > 0 ? Math.max(...registeredList.map(item => item.index)) + 1 : 1,
            chassisType: chassisType,
            width: Number(width),
            height: Number(height),
            companyType: selectedCompany,
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

        if (registeredList.length > 0) {
            const updatedList = registeredList.map(item => ({
                ...item,
                width: newUnit === "cm" ? item.width / 10 : item.width * 10,
                height: newUnit === "cm" ? item.height / 10 : item.height * 10,
            }));

            setRegisteredList(updatedList);
        }

        setUnit(newUnit); // 기존 단위를 업데이트
    };

    const handleCalculate = async () => {
        if (!validateStep2() || !selectedCompany) return;

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

        const payload: RegisterChassisPayload = {
            zipCode: addressZoneCode,
            state: sido,
            city: siGunGu,
            town: yupMyeonDong,
            bCode: bCode,
            remainAddress: remainAddress,
            buildingNumber: addressBuildingNum,
            isApartment: isApartment,
            isExpanded: isExpanded,
            reqCalculateChassisPriceList
        };

        axios.post(calculateChassisCall, payload, {
            withCredentials: true,
            headers: { Authorization: localStorage.getItem("hoppang-token") },
        }).then((response) => {
                const resultData: RegisterChassisPayload = payload;
                history.push('/calculator/result', {
                    calculatedResult: response.data,
                    requestObject: resultData,
                    companyType: selectedCompany,
                    unit: unit
                });
            })
            .catch((error) => {
                setErrors({ general: error.response?.data?.message || '견적 계산에 실패했습니다. 다시 시도해주세요.' });
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handleAddressSelect = (newAddress: any) => {
        setAddress(newAddress.address); // input 창에 주소 표시 전용
        setAddressZoneCode(newAddress.zonecode); // 우편번호
        setAddressBuildingNum(newAddress.buildingCode); // 빌딩번호
        setSido(newAddress.sido); // 시도
        setSiGunGu(newAddress.sigungu); // 시군구
        setYupMyeonDong(newAddress.bname); // 읍면동
        setBCode(newAddress.bcode); // 법정동코드

        if (newAddress.apartment === "Y") {
            setIsApartment(true) // 아파트 여부 (디폴트 false)
        }

        // 주소 선택 후 에러 클리어
        if (errors.address) {
            setErrors(prev => ({ ...prev, address: '' }));
        }
    };

    const renderContent = () => {
        if (currentStep === 0) {
            return (
                <>
                    <div className="progress-indicator">
                        <div className="step active"/>
                        <div className="step"/>
                        <div className="step"/>
                        <div className="step"/>
                    </div>
                    <h2 className="main-title">어떤 브랜드의 샷시로<br/>견적을 받아보시겠어요?</h2>
                    <p className="subtitle">원하시는 브랜드를 선택해주세요</p>

                    <div className="company-list">
                        {companyTypeOptionsString.map((company) => (
                            <button
                                key={company}
                                className={`company-card ${selectedCompany === company ? 'selected' : ''}`}
                                onClick={() => setSelectedCompany(company)}
                            >
                                <span className="company-name">{company}</span>
                                {selectedCompany === company && (
                                    <div className="check-icon">✓</div>
                                )}
                            </button>
                        ))}
                    </div>
                </>
            );
        } else if (currentStep === 1) {
            return (
                <>
                    <div className="progress-indicator">
                        <div className="step done"/>
                        <div className="step active"/>
                        <div className="step"/>
                        <div className="step"/>
                    </div>
                    <h2 className="main-title">견적받을 샷시의<br/>정보를 입력해주세요.</h2>

                    <div className="form-group">
                        <label className="form-label">선택 된 샷시 회사</label>
                        <p className="company-display">{selectedCompany}</p>
                    </div>

                    <div className="form-group">
                        <label className="form-label">샷시 종류</label>
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
                            <input type="number" inputMode="numeric" value={width} onChange={(e) => setWidth(e.target.value)} placeholder="" className={`custom-input ${errors.width ? 'error' : ''}`} />
                            {errors.width && <p className="error-message">{errors.width}</p>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">세로 길이 ({unit})</label>
                            <input type="number" inputMode="numeric" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="" className={`custom-input ${errors.height ? 'error' : ''}`} />
                            {errors.height && <p className="error-message">{errors.height}</p>}
                        </div>
                    </div>

                    <button className="add-button" onClick={handleRegisterChassis}>+ 추가하기</button>

                    <div className="list-section">
                        <h3 className="section-title">
                            추가된 샷시 목록
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
                                    <p className="empty-title">아직 추가된 샷시가 없어요</p>
                                    <p className="empty-description">위에서 샷시 정보를 입력하고 추가해주세요.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            );
        } else if (currentStep === 2) {
            return (
                <>
                    <div className="progress-indicator">
                        <div className="step done"/>
                        <div className="step done"/>
                        <div className="step active"/>
                        <div className="step"/>
                    </div>
                    <h2 className="main-title">견적을 원하는 주소가 어디신가요?</h2>

                    <div className="form-group">
                        <label className="form-label">주소</label>
                        <div
                            className={`address-input-wrapper ${errors.address ? 'error' : ''}`}
                            onClick={() => setShowAddressModal(true)}
                        >
                            <div className="address-input-content">
                                {address ? (
                                    <>
                                        <div className="address-display">
                                            <span className="address-text">{address}</span>
                                            <span className="address-zone">({addressZoneCode})</span>
                                        </div>
                                        <div className="address-change-hint">주소 변경하기</div>
                                    </>
                                ) : (
                                    <div className="address-placeholder">
                                        <span className="address-placeholder-icon">🏠</span>
                                        <span className="address-placeholder-text">주소를 검색해주세요</span>
                                    </div>
                                )}
                                <div className="address-input-arrow">📍</div>
                            </div>
                        </div>
                        {errors.address && <p className="error-message">{errors.address}</p>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">상세주소</label>
                        <input
                            type="text"
                            value={remainAddress}
                            onChange={(e) => setRemainAddress(e.target.value)}
                            placeholder="동, 호수 등 상세주소를 입력하세요"
                            className="custom-input"
                        />
                    </div>
                </>
            );
        } else if (currentStep === 3) {
            return (
                <>
                    <div className="progress-indicator">
                        <div className="step done"/>
                        <div className="step done"/>
                        <div className="step done"/>
                        <div className="step active"/>
                    </div>
                    <h2 className="main-title">견적을 위한 추가정보를 입력해주세요.</h2>

                    <div className="form-group">
                        <label className="form-label">거주 층수</label>
                        <input
                            type="number"
                            inputMode="numeric"
                            value={floor || ''}
                            onChange={(e) => setFloor(e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="예: 5"
                            className={`custom-input ${errors.floor ? 'error' : ''}`}
                        />
                        {errors.floor && <p className="error-message">{errors.floor}</p>}

                        {/* 안내사항 추가 */}
                        <div className="info-notice">
                            <p className="info-text">
                                *사다리차 작업 불가 시 가격 변동 및 작업 불가 가능성 있습니다.
                            </p>
                            <p className="info-text">
                                *층수에 따라 가격이 변동됩니다. (사다리차 등)
                            </p>
                            <p className="info-text">
                                *사다리차 대여 비용은 기본 2 시간으로 측정됩니다.
                            </p>
                        </div>
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

    const renderFooter = () => {
        if (currentStep === 0) {
            return (
                <button
                    className="button-primary"
                    onClick={() => {
                        if (!selectedCompany) {
                            setErrors({general: '샷시 브랜드는 필수값 입니다.'});
                            return;
                        }
                        setSelectedCompany(selectedCompany);
                        setCurrentStep(1);
                    }}
                    disabled={!selectedCompany}
                >
                    다음
                </button>
            )
        } else if (currentStep === 1) {
            return (
                <button
                    className="button-primary"
                    onClick={() => {
                        if (registeredList.length === 0) {
                            setErrors({general: '샷시를 하나 이상 추가해주세요.'});
                            return;
                        }
                        setErrors({});
                        setCurrentStep(2);
                    }}
                    disabled={registeredList.length === 0}
                >
                    다음
                </button>
            );
        } else if (currentStep === 2) {
            return (
                <button
                    className="button-primary"
                    onClick={() => {
                        if (registeredList.length === 0) {
                            setErrors({general: '주소를 입력해주세요.'});
                            return;
                        }
                        setErrors({});
                        setCurrentStep(3);
                    }}
                    disabled={!address || !remainAddress}
                >
                    다음
                </button>
            );
        } else if (currentStep === 3) {
            return (
                <button className="button-primary" onClick={handleCalculate} disabled={!floor}>
                    {isLoading ? '계산중...' : '견적 계산하기'}
                </button>
            );
        }
    }


     return (
        <div className="app-container">
            {isLoading && <div className="loading-overlay"><span>견적을 계산중입니다...</span></div>}

            <header className="app-header">
                <div className="header-content">
                    <button className="back-button" onClick={() => {
                        if (currentStep < 1) {
                            setShowExitModal(true);
                            return;
                        }
                        setCurrentStep(currentStep - 1);
                    }}>
                        <LeftOutlined/>
                    </button>
                    <div className="header-title">샷시 견적</div>
                </div>
            </header>

            <main className="main-content">
                <div className="form-content">
                    {renderContent()}
                </div>

                {errors.general && <p className="error-message general-error">{errors.general}</p>}
            </main>

            <footer className="footer-actions">
                {renderFooter()}
            </footer>

            {/* 주소 입력 모달 */}
            {showAddressModal &&
                <AddressInputModal
                    onClose={() => setShowAddressModal(false)}
                    onAddressSelect={handleAddressSelect}
                    currentAddress={address}
                />
            }

            {/* 종료 모달 */}
            {showExitModal && (<ExitModal setShowExitModal={setShowExitModal}/>)}
        </div>
    );
};

export default MobileCalculationScreen;
