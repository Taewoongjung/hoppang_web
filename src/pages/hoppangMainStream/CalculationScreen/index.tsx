import React, {useEffect, useState, useMemo} from 'react';
import '../styles.css';
import {Col, Row, message, Select, InputNumber, Button, Divider, List, Modal, Tooltip} from "antd";
import { Typography } from 'antd';
import chassisTypeOptions from "../../../definition/chassisType";
import {InputStatus} from "antd/es/_util/statusUtils";
import CalculatorSecondStep from "../../../component/CalculatorSecondStep";
import RegisteringChassis from "../../../definition/interfaces";
import {DeleteOutlined, LeftOutlined, RightOutlined} from "@ant-design/icons";
import BottomNavigator from "../../../component/BottomNavigator";
import {companyTypeOptionsString, HYUNDAI_ko} from "../../../definition/companyType";
import OverlayLoadingPage from "../../../component/Loading/OverlayLoadingPage";
import {Unit} from "../../../definition/unit";

const { Option } = Select;
const { Title } = Typography;


const CalculationScreen = () => {

    const ContainerHeight = 300;

    const memoizedOptions = useMemo(() => companyTypeOptionsString, []);

    const [messageApi, contextHolder] = message.useMessage();

    const [secondStep, setSecondStep] = useState(false);

    const [registeredList, setRegisteredList] = useState<RegisteringChassis[]>([]);
    const [companyType, setCompanyType] = useState<string>('선택안함');
    const [chassisType, setChassisType] = useState<string>('선택안함');
    const [width, setWidth] = useState<number | null>();
    const [height, setHeight] = useState<number | null>();
    const [unit, setUnit] = useState<string>(Unit.MM);

    // 인풋 각각 입력 상태값
    const [companyTypeStatus, setCompanyTypeStatus] = useState<InputStatus>('');
    const [chassisTypeStatus, setChassisTypeStatus] = useState<InputStatus>('');
    const [widthStatus, setWidthStatus] = useState<InputStatus>('');
    const [heightStatus, setHeightStatus] = useState<InputStatus>('');

    // 진행사항 변수
    const [current, setCurrent] = useState(0);

    const [isLoading, setIsLoading] = useState(true);
    const [isToolTipOn, setIsToolTipOn] = useState(false);

    const success = (successMsg:string) => {
        messageApi.open({
            type: 'success',
            content: successMsg,
        });
    };

    const errorModal = (errorMsg:string) => {
        messageApi.open({
            type: 'error',
            content: errorMsg
        });
    };

    useEffect(() => {
        setCompanyType('선택안함');
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (companyType !== '선택안함' && companyType !== undefined) {
            setCompanyTypeStatus('');
        }

        if (chassisType !== '선택안함' && chassisType !== undefined) {
            setChassisTypeStatus('');
        }

        if (width !== null) {
            setWidthStatus('');
        }

        if (height !== null) {
            setHeightStatus('');
        }

    }, [companyType, chassisType, width, height]);

    const handleRegisterChassis = () => {

        if (!isValidHeightMin || !isValidHeightMax || !isValidWidthMin || !isValidWidthMax) {
            errorModal("가로/세로를 확인해주세요.");
            return;
        }

        if (companyType === '선택안함' || companyType === undefined) {
            errorModal("창호 회사를 선택해주세요.");
            setCompanyTypeStatus('error');
            return;
        }

        if (chassisType === '선택안함' || chassisType === undefined) {
            errorModal("창호 종류를 선택해주세요.");
            setChassisTypeStatus('error');
            return;
        }

        if (width === null || width === undefined) {
            errorModal("창호 가로 정보를 입력해주세요.");
            setWidthStatus('error');
            return;
        }

        if (height === null || height === undefined) {
            errorModal("창호 세로 정보를 입력해주세요.");
            setHeightStatus('error');
            return;
        }

        let newItem: RegisteringChassis = {
            index: registeredList.length + 1,
            chassisType: chassisType,
            width: width,
            height: height
        };

        setRegisteredList([
            ...registeredList,
            newItem
        ]);

        success("추가 완료");
    };

    const getLabelOfChassisType = (target:string) => {
        return chassisTypeOptions.find(
            (a) => a.value === target
        )?.label;
    }

    const deleteRegisteredChassis = (index: number) => {
        setRegisteredList((prevList) => prevList.filter(item => item.index !== index));
    };

    const CompleteOnFirstScreen = () => {
        setSecondStep(true);
        setCurrent(current + 1);
    };

    const clickBackButton = () => {
        setSecondStep(false);
    }

    // 최소/최대 입력값 검증
    const [isValidWidthMin, setIsValidWidthMin] = useState(true);
    const [isValidWidthMax, setIsValidWidthMax] = useState(true);

    const [isValidHeightMin, setIsValidHeightMin] = useState(true);
    const [isValidHeightMax, setIsValidHeightMax] = useState(true);

    const handleBlurWidth = (width:any) => {

        if (!width.target.value) {
            setIsValidWidthMin(true);
            setIsValidWidthMax(true);
            return;
        }

        let minimumWidth;
        let maximumWidth;

        if (unit === Unit.MM) {
            minimumWidth = 300;
            maximumWidth = 5000;
        } else {
            minimumWidth = 30;
            maximumWidth = 500;
        }

        if (width.target.value < minimumWidth) {
            setIsValidWidthMin(false);
            setIsValidWidthMax(true);
            return;
        } else if (width.target.value > maximumWidth) {
            setIsValidWidthMax(false);
            setIsValidWidthMin(true);
            return;
        }
        setIsValidWidthMin(true);
        setIsValidWidthMax(true);
    };

    const handleBlurHeight = (height:any) => {

        if (!height.target.value) {
            setIsValidHeightMin(true);
            setIsValidHeightMax(true);
        }

        let minimumHeight;
        let maximumHeight;

        if (unit === Unit.MM) {
            minimumHeight = 300;
            maximumHeight = 2600;
        } else {
            minimumHeight = 30;
            maximumHeight = 260;
        }

        if (height.target.value < minimumHeight) {
            setIsValidHeightMin(false);
            setIsValidHeightMax(true);
            return;
        } else if (height.target.value > maximumHeight) {
            setIsValidHeightMax(false);
            setIsValidHeightMin(true);
            return;
        }
        setIsValidHeightMin(true);
        setIsValidHeightMax(true);
    };

    const handleBack = () => {
        window.location.href = "/chassis/calculator";
    }

    const [selectedOption, setSelectedOption] = useState(null);

    const handleSelect = (option: any) => {
        setSelectedOption(option);
        setCompanyType(option);
        setCurrent(current + 1);
        setIsToolTipOn(true);
    };

    const handleUnitChange = (newUnit: string) => {
        if (unit !== newUnit) {
            if (registeredList.length > 0 || width || height) {
                Modal.confirm({
                    title: "단위 변경 시 기존 입력 및 리스트가 초기화됩니다.",
                    okText: "변경",
                    cancelText: "취소",
                    onOk: () => {
                        setUnit(newUnit);
                        setChassisType('선택안함')
                        setWidth(null);
                        setHeight(null);
                        setRegisteredList([]);
                        setIsValidWidthMin(true);
                        setIsValidWidthMax(true);
                        setIsValidHeightMin(true);
                        setIsValidHeightMax(true);
                    }
                });
            } else{
                setUnit(newUnit);
            }
        } else{
            setUnit(newUnit);
        }
    };

    const unitSelector = (
        <Tooltip
            title="mm 외 단위 선택도 가능합니다!"
            placement="top"
            open={isToolTipOn}
        >
            <Select defaultValue="mm" onClick={() => setIsToolTipOn(false)} onChange={handleUnitChange}>
                <Option value="mm">{Unit.MM}</Option>
                <Option value="cm">{Unit.CM}</Option>
            </Select>
        </Tooltip>
    );


    return (
        <>
            {contextHolder}

            {isLoading && <OverlayLoadingPage word={"이동중"}/>}

            <div className="whole-app">
                <div className="app">
                    <header className="app-header">
                        <h1>호빵</h1>
                    </header>
                    <main className="app-main">
                        {/*<aside className="top-banner">*/}
                        {/*    <TopBanner/>*/}
                        {/*</aside>*/}
                        <div className="content">
                            <Row>
                                <div>
                                    <Col
                                        xs={24}
                                        sm={20}
                                        md={12}
                                        lg={10}
                                        xl={12}
                                        style={{ textAlign: 'center' }}
                                    >
                                        {!(companyType !== '선택안함') &&
                                            <div style={{width: '700px'}}>
                                                {/*뒤로가기*/}
                                                <div onClick={handleBack} style={{color: "blue", marginRight: "40%", marginTop: '50px'}}>
                                                    <LeftOutlined/>
                                                </div>
                                                <table>
                                                    <tbody>
                                                    <tr>
                                                        <td colSpan={2}>
                                                            <div style={{
                                                                position: 'relative',
                                                                display: 'flex',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                width: '100%',
                                                                padding: '0 10px'
                                                            }}>
                                                                <Title
                                                                    level={2}
                                                                    style={{
                                                                        margin: 0,
                                                                        whiteSpace: 'nowrap',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        position: 'relative'
                                                                    }}
                                                                >
                                                                    창호 회사 선택
                                                                </Title>
                                                            </div>
                                                            <Divider
                                                                style={{
                                                                    borderColor: '#a4a3a3',
                                                                    width: '100%',
                                                                    margin: '10px auto'
                                                                }}
                                                            />
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td colSpan={2}>
                                                            <div style={{
                                                                display: 'flex',
                                                                flexDirection: window.innerWidth < 600 ? 'column' : 'row', // 화면 크기에 따라 가로/세로 변경
                                                                gap: '10px',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                flexWrap: 'wrap',
                                                                marginBottom: '10%'
                                                            }}>

                                                                {memoizedOptions.map((option, index) =>
                                                                    option === HYUNDAI_ko ? (
                                                                        <div key={index} className="ribbon-container">
                                                                            {/*<div*/}
                                                                            {/*    className={`ribbon ribbonRed`}*/}
                                                                            {/*    style={{*/}
                                                                            {/*        display: 'flex',*/}
                                                                            {/*        alignItems: 'center',*/}
                                                                            {/*        justifyContent: 'center',*/}
                                                                            {/*        gap: '5px',*/}
                                                                            {/*        backgroundColor: '#D32F2F',*/}
                                                                            {/*        color: 'white',*/}
                                                                            {/*        fontWeight: 'bold',*/}
                                                                            {/*        padding: '5px 10px',*/}
                                                                            {/*        borderRadius: '5px',*/}
                                                                            {/*        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.3)',*/}
                                                                            {/*        textAlign: 'center'*/}
                                                                            {/*    }}*/}
                                                                            {/*>*/}
                                                                            {/*    <span style={{*/}
                                                                            {/*        fontSize: '14px',*/}
                                                                            {/*        letterSpacing: '1px',*/}
                                                                            {/*        textTransform: 'uppercase'*/}
                                                                            {/*    }}*/}
                                                                            {/*    >*/}
                                                                            {/*        할인중*/}
                                                                            {/*    </span>*/}
                                                                            {/*    <div style={{*/}
                                                                            {/*        width: '20px',*/}
                                                                            {/*        height: '20px',*/}
                                                                            {/*        backgroundColor: 'white',*/}
                                                                            {/*        borderRadius: '50%',*/}
                                                                            {/*        display: 'flex',*/}
                                                                            {/*        alignItems: 'center',*/}
                                                                            {/*        justifyContent: 'center'*/}
                                                                            {/*    }}>*/}
                                                                            {/*        <img*/}
                                                                            {/*            src="/assets/ChassisCalculator/discount_arrow.png"*/}
                                                                            {/*            alt="discount_arrow"*/}
                                                                            {/*            style={{ width: '14px', height: '14px' }}*/}
                                                                            {/*        />*/}
                                                                            {/*    </div>*/}
                                                                            {/*</div>*/}
                                                                            <div
                                                                                onClick={() => handleSelect(option)}
                                                                                style={{
                                                                                    width: '150px',
                                                                                    height: '50px',
                                                                                    display: 'flex',
                                                                                    justifyContent: 'center',
                                                                                    alignItems: 'center',
                                                                                    border: '2px solid',
                                                                                    borderColor: selectedOption === option ? 'green' : '#ccc',
                                                                                    borderRadius: '8px',
                                                                                    transition: 'border-color 0.3s ease',
                                                                                    background: 'white',
                                                                                    fontWeight: 600
                                                                                }}
                                                                            >
                                                                                {option}
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <div key={index} className="ribbon-container">
                                                                            {/*<div*/}
                                                                            {/*    className={`ribbon ribbon-blue`}*/}
                                                                            {/*    style={{*/}
                                                                            {/*        display: 'flex',*/}
                                                                            {/*        alignItems: 'center',*/}
                                                                            {/*        justifyContent: 'center',*/}
                                                                            {/*        gap: '5px',*/}
                                                                            {/*        backgroundColor: '#0063f6',*/}
                                                                            {/*        color: 'white',*/}
                                                                            {/*        fontWeight: 'bold',*/}
                                                                            {/*        padding: '5px 10px',*/}
                                                                            {/*        borderRadius: '5px',*/}
                                                                            {/*        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.3)',*/}
                                                                            {/*        textAlign: 'center',*/}
                                                                            {/*        zIndex: 10*/}
                                                                            {/*    }}*/}
                                                                            {/*>*/}
                                                                            {/*        <span style={{*/}
                                                                            {/*            fontSize: '14px',*/}
                                                                            {/*            letterSpacing: '1px',*/}
                                                                            {/*            textTransform: 'uppercase'*/}
                                                                            {/*        }}*/}
                                                                            {/*        >*/}
                                                                            {/*            할인중*/}
                                                                            {/*        </span>*/}
                                                                            {/*    <div style={{*/}
                                                                            {/*        width: '20px',*/}
                                                                            {/*        height: '20px',*/}
                                                                            {/*        backgroundColor: 'white',*/}
                                                                            {/*        borderRadius: '50%',*/}
                                                                            {/*        display: 'flex',*/}
                                                                            {/*        alignItems: 'center',*/}
                                                                            {/*        justifyContent: 'center'*/}
                                                                            {/*    }}>*/}
                                                                            {/*        <img*/}
                                                                            {/*            src="/assets/ChassisCalculator/discount_arrow.png"*/}
                                                                            {/*            alt="discount_arrow"*/}
                                                                            {/*            style={{ width: '14px', height: '14px' }}*/}
                                                                            {/*        />*/}
                                                                            {/*    </div>*/}
                                                                            {/*</div>*/}
                                                                            <div
                                                                                key={index}
                                                                                onClick={() => handleSelect(option)}
                                                                                style={{
                                                                                    width: '150px',
                                                                                    height: '50px',
                                                                                    display: 'flex',
                                                                                    justifyContent: 'center',
                                                                                    alignItems: 'center',
                                                                                    border: '2px solid',
                                                                                    borderColor: selectedOption === option ? 'green' : '#ccc',
                                                                                    borderRadius: '8px',
                                                                                    transition: 'border-color 0.3s ease',
                                                                                    fontWeight: 600
                                                                                }}
                                                                            >
                                                                                {option}
                                                                            </div>
                                                                        </div>
                                                                    )
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        }

                                        {(!secondStep && companyType !== '선택안함') &&
                                            <>
                                                <table style={{width: "700px"}}>
                                                    <tbody>
                                                        {/*<tr>*/}
                                                        {/*    <td colSpan={2}>*/}
                                                        {/*        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>*/}
                                                        {/*            <Title level={5}>*/}
                                                        {/*                {!isRevising && <Text keyboard> {mappedCompanyByValue(companyType)} </Text> }*/}
                                                        {/*                {!isRevising &&*/}
                                                        {/*                    <Tooltip title="회사 재설정하기">*/}
                                                        {/*                        <AnimatedIcon*/}
                                                        {/*                            className={isBlinking ? 'blink' : ''}*/}
                                                        {/*                            onClick={handleIconClick}*/}
                                                        {/*                        />*/}
                                                        {/*                    </Tooltip>*/}
                                                        {/*                }*/}
                                                        {/*                {isRevising &&*/}
                                                        {/*                    <Select*/}
                                                        {/*                        status={companyTypeStatus}*/}
                                                        {/*                        value={companyType}*/}
                                                        {/*                        style={{ width: 150 }}*/}
                                                        {/*                        onChange={handleChangeCompanyType}*/}
                                                        {/*                        options={companyTypeOptions}/>*/}
                                                        {/*                }*/}
                                                        {/*            </Title>*/}
                                                        {/*        </div>*/}
                                                        {/*    </td>*/}
                                                        {/*</tr>*/}
                                                        <tr>
                                                            <td colSpan={2}>
                                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '40px' }}>
                                                                    <div style={{ color: 'red', fontSize: 16 }}>*</div>
                                                                    <Title level={4}>
                                                                        창호 종류 선택 :
                                                                    </Title>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td colSpan={2}>
                                                                <Select
                                                                    status={chassisTypeStatus}
                                                                    defaultValue="창호 종류 선택"
                                                                    style={{ width: 200 }}
                                                                    value={chassisType}
                                                                    onChange={setChassisType}
                                                                    onClick={() => {
                                                                        if (isToolTipOn) {
                                                                            setIsToolTipOn(false);
                                                                        }
                                                                    }}
                                                                    options={chassisTypeOptions}/>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td colSpan={2}>
                                                                <div style={{ marginTop: '35px', textAlign: 'center' }}>
                                                                    <div style={{color: 'grey', fontSize: 14, textDecorationLine: 'underline'}}>
                                                                        *가로 세로 수치를&nbsp;
                                                                            {unit === Unit.MM && '10mm'}
                                                                            {unit === Unit.CM && '10cm'}
                                                                        &nbsp;단위로 작성 해주세요
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td colSpan={2}>
                                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    <div style={{ color: 'red', fontSize: 16, marginTop: '10px' }}>*</div>
                                                                    <Title level={4}>
                                                                        창호 가로 (W) :
                                                                    </Title>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td colSpan={2}>
                                                                <InputNumber style={{ width: 200 }}
                                                                             value={width}
                                                                             addonAfter={unitSelector}
                                                                             min={0}
                                                                             status={widthStatus}
                                                                             onChange={setWidth}
                                                                             onBlur={handleBlurWidth}
                                                                             inputMode="numeric"
                                                                             pattern="\d*"
                                                                />
                                                                {!isValidWidthMax &&
                                                                    <div className="caution">
                                                                        입력 값이 너무 큽니다. 최대값은&nbsp;
                                                                        {unit === Unit.MM && '5000mm'}
                                                                        {unit === Unit.CM && '500cm'}
                                                                        &nbsp;입니다.
                                                                    </div>
                                                                }
                                                                {!isValidWidthMin &&
                                                                    <div className="caution">
                                                                        입력 값이 너무 작습니다. 최소값은&nbsp;
                                                                        {unit === Unit.MM && '300mm'}
                                                                        {unit === Unit.CM && '30cm'}
                                                                        &nbsp;입니다.
                                                                    </div>
                                                                }
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td colSpan={2}>
                                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    <div style={{ color: 'red', fontSize: 16, marginTop: '10px' }}>*</div>
                                                                    <Title level={4}>
                                                                        창호 세로 (H) :
                                                                    </Title>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td colSpan={2}>
                                                                <InputNumber style={{ width: 200 }}
                                                                             value={height}
                                                                             addonAfter={unit}
                                                                             min={0}
                                                                             status={heightStatus}
                                                                             onChange={setHeight}
                                                                             onBlur={handleBlurHeight}
                                                                             inputMode="numeric"
                                                                             pattern="\d*"
                                                                />
                                                                {!isValidHeightMax &&
                                                                    <div className="caution">
                                                                        입력 값이 너무 큽니다. 최대값은&nbsp;
                                                                        {unit === Unit.MM && '2600mm'}
                                                                        {unit === Unit.CM && '260cm'}
                                                                        &nbsp;입니다.
                                                                    </div>
                                                                }
                                                                {!isValidHeightMin &&
                                                                    <div className="caution">
                                                                        입력 값이 너무 작습니다. 최소값은&nbsp;
                                                                        {unit === Unit.MM && '300mm'}
                                                                        {unit === Unit.CM && '30cm'}
                                                                        &nbsp;입니다.
                                                                    </div>
                                                                }
                                                            </td>
                                                        </tr>

                                                        <tr>
                                                            <td colSpan={2}>
                                                                <Button
                                                                    type="dashed"
                                                                    shape="round"
                                                                    style={{marginTop: '5%', width: '45%'}}
                                                                    onClick={handleRegisterChassis}
                                                                >
                                                                    추가
                                                                </Button>

                                                                <Divider style={{ marginTop: '10%' }}>추가리스트</Divider>
                                                                <div id="scrollableDiv"
                                                                     style={{
                                                                         height: ContainerHeight,
                                                                         overflow: 'auto',
                                                                         maxWidth: 350,
                                                                         width: '100%',
                                                                         margin: '0 auto',
                                                                         border: '1px solid grey',
                                                                         borderRadius: '5px'
                                                                     }}
                                                                >
                                                                    <List
                                                                        itemLayout={"horizontal"}
                                                                        dataSource={registeredList}
                                                                        renderItem={(item: RegisteringChassis, index) => (
                                                                            <List.Item key={item.index}>
                                                                                <List.Item.Meta
                                                                                    title={getLabelOfChassisType(item.chassisType)}
                                                                                    description={
                                                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                                            <table className="narrow-table">
                                                                                                <tbody>
                                                                                                <tr>
                                                                                                    <td>가로 :</td>
                                                                                                    <td>{item.width}</td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td>세로 :</td>
                                                                                                    <td>{item.height}</td>
                                                                                                </tr>
                                                                                                </tbody>
                                                                                            </table>
                                                                                        </div>
                                                                                    }
                                                                                />
                                                                                <div
                                                                                    style={{fontSize:18, color: 'red', marginRight: 10}}
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation(); // 이벤트 전파 중단
                                                                                        deleteRegisteredChassis(item.index);
                                                                                    }}
                                                                                >
                                                                                    <DeleteOutlined/>
                                                                                </div>
                                                                            </List.Item>
                                                                        )}
                                                                    />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td colSpan={2}>
                                                                {registeredList.length > 0 &&
                                                                    <div>
                                                                        <Button
                                                                            type="primary"
                                                                            size="large"
                                                                            onClick={CompleteOnFirstScreen}
                                                                            style={{
                                                                                width: window.innerWidth > 768 ? '90%' : '40%',
                                                                                maxWidth: '400px',
                                                                                minWidth: '150px',
                                                                                padding: '10px 0',
                                                                                fontSize: '16px'
                                                                            }}
                                                                        >
                                                                            확정 <RightOutlined />
                                                                        </Button>
                                                                    </div>
                                                                }
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </>
                                        }

                                        {/* 두 번째 화면 렌더링 */}
                                        {secondStep &&
                                            <CalculatorSecondStep
                                                registeredList={registeredList}
                                                companyType={companyType}
                                                clickBackButton={clickBackButton}
                                                setCurrent={setCurrent}
                                                selectedUnit={unit}
                                            />
                                        }
                                    </Col>
                                </div>
                            </Row>
                            {/*/!* 사업자 정보 푸터는 첫 화면만 나오게 *!/*/}
                            {/*{current === 0 &&*/}
                            {/*    <Divider/>*/}
                            {/*}*/}
                            {/*{current === 0 &&*/}
                            {/*    <footer className="footer">*/}
                            {/*        인트로 정일윤 | 주소 : 울산광역시남구삼산로318번길12,2층(삼산동) | 사업자등록번호 : 175-24-00881*/}
                            {/*    </footer>*/}
                            {/*}*/}
                        </div>
                        {/*<aside className="bottom-banner">*/}
                        {/*    <p>광고 베너 칸</p>*/}
                        {/*</aside>*/}
                    </main>
                    <div>
                        <BottomNavigator/>
                    </div>
                </div>
            </div>
        </>
    );
}

export default CalculationScreen;
