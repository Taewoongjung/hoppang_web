import React, {useEffect, useState} from 'react';
import '../styles.css';
import {Col, Row, message, Select, InputNumber, Button, Divider, List, Steps} from "antd";
import { Typography } from 'antd';
import chassisTypeOptions from "../../../definition/chassisType";
import {InputStatus} from "antd/es/_util/statusUtils";
import CalculatorSecondStep from "../../../component/CalculatorSecondStep";
import RegisteringChassis from "../../../definition/interfaces";
import {DeleteOutlined, RightOutlined} from "@ant-design/icons";
import InitialScreen from '../InitialScreen';
import BottomNavigator from "../../../component/BottomNavigator";

const { Title } = Typography;

const CalculationScreen = () => {

    const ContainerHeight = 300;

    const [messageApi, contextHolder] = message.useMessage();

    const [secondStep, setSecondStep] = useState(false);

    const [registeredList, setRegisteredList] = useState<RegisteringChassis[]>([]);
    const [companyType, setCompany] = useState<string>('선택안함');
    const [chassisType, setChassisType] = useState<string>('선택안함');
    const [width, setWidth] = useState<number | null>();
    const [height, setHeight] = useState<number | null>();

    // 인풋 각각 입력 상태값
    const [companyTypeStatus, setCompanyTypeStatus] = useState<InputStatus>('');
    const [chassisTypeStatus, setChassisTypeStatus] = useState<InputStatus>('');
    const [widthStatus, setWidthStatus] = useState<InputStatus>('');
    const [heightStatus, setHeightStatus] = useState<InputStatus>('');

    // 진행사항 변수
    const [current, setCurrent] = useState(0);


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
        if (width.target.value < 300) {
            setIsValidWidthMin(false);
            return;
        } else if (width.target.value > 5000) {
            setIsValidWidthMax(false);
            return;
        }
        setIsValidWidthMin(true);
        setIsValidWidthMax(true);
    };

    const handleBlurHeight = (height:any) => {
        if (height.target.value < 300) {
            setIsValidHeightMin(false);
            return;
        } else if (height.target.value > 2600) {
            setIsValidHeightMax(false);
            return;
        }
        setIsValidHeightMin(true);
        setIsValidHeightMax(true);
    };



    return (
        <>
            {contextHolder}
            <div className="whole-app">
                <div className="app">
                    <header className="app-header">
                        <h1>호빵</h1>
                    </header>
                    <main className="app-main">
                        {/*<aside className="banner">*/}
                        {/*    <p>광고 베너 칸</p>*/}
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
                                        {!(!secondStep && companyType !== '선택안함') &&
                                            <InitialScreen secondStep={secondStep}
                                                           companyType={companyType}
                                                           setCompanyType={(target: any) => setCompany(target)}
                                                           companyTypeStatus={companyTypeStatus}
                                                           setCompanyTypeStatus={(target: any) => setCompanyTypeStatus(target)}
                                                           current={current}
                                                           setCurrent={(target: any) => setCurrent(target)}
                                            />
                                        }

                                        {(!secondStep && companyType !== '선택안함') &&
                                            <>
                                                {/*상황 진척도*/}
                                                {/*<div style={{width: "700px"}}>*/}
                                                {/*    <Steps*/}
                                                {/*        current={current}*/}
                                                {/*        size="small"*/}
                                                {/*        items={[*/}
                                                {/*            {*/}
                                                {/*                title: '회사선택',*/}
                                                {/*                description: companyType*/}
                                                {/*            },*/}
                                                {/*            {*/}
                                                {/*                title: '창호 입력',*/}
                                                {/*            },*/}
                                                {/*            {*/}
                                                {/*                title: '주소 입력',*/}
                                                {/*            },*/}
                                                {/*            {*/}
                                                {/*                title: '기타 사항 입력',*/}
                                                {/*            },*/}
                                                {/*            {*/}
                                                {/*                title: '계산시작',*/}
                                                {/*            },*/}
                                                {/*        ]}*/}
                                                {/*    />*/}
                                                {/*</div>*/}
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
                                                                    onChange={setChassisType}
                                                                    options={chassisTypeOptions}/>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td colSpan={2}>
                                                                <div style={{marginTop:'46px'}}>
                                                                    <div style={{color: 'grey', textDecorationLine: 'underline'}}>
                                                                        *가로 세로 수치는 10mm 단위로 작성 해주세요
                                                                    </div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td colSpan={2}>
                                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    <div style={{ color: 'red', fontSize: 16, marginTop: '10px' }}>*</div>
                                                                    <Title level={4}>
                                                                        창호 가로 (w) :
                                                                    </Title>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td colSpan={2}>
                                                                <InputNumber style={{ width: 200 }}
                                                                             addonAfter="mm"
                                                                             min={0}
                                                                             status={widthStatus}
                                                                             onChange={setWidth}
                                                                             onBlur={handleBlurWidth}
                                                                             inputMode="numeric"
                                                                             pattern="\d*"
                                                                />
                                                                {!isValidWidthMax && <div className="caution">입력 값이 너무 큽니다. 최대값은 5000mm 입니다.</div>}
                                                                {!isValidWidthMin && <div className="caution">입력 값이 너무 작습니다. 최소값은 300mm 입니다.</div>}
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td colSpan={2}>
                                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    <div style={{ color: 'red', fontSize: 16, marginTop: '10px' }}>*</div>
                                                                    <Title level={4}>
                                                                        창호 세로 (h) :
                                                                    </Title>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td colSpan={2}>
                                                                <InputNumber style={{ width: 200 }}
                                                                             addonAfter="mm"
                                                                             min={0}
                                                                             status={heightStatus}
                                                                             onChange={setHeight}
                                                                             onBlur={handleBlurHeight}
                                                                             inputMode="numeric"
                                                                             pattern="\d*"
                                                                />
                                                                {!isValidHeightMax && <div className="caution">입력 값이 너무 큽니다. 최대값은 2600mm 입니다.</div>}
                                                                {!isValidHeightMin && <div className="caution">입력 값이 너무 작습니다. 최소값은 300mm 입니다.</div>}
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
                                                                         maxWidth: 350,       // 최대 너비 지정
                                                                         width: '100%',       // 나머지는 화면에 맞게
                                                                         margin: '0 auto',    // 수평 중앙 정렬
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
                                                                                width: window.innerWidth > 768 ? '90%' : '40%',      // 화면 크기에 따라 유동적으로 조절
                                                                                maxWidth: '400px',  // 버튼이 너무 길어지지 않도록 최대 너비 지정
                                                                                minWidth: '150px',  // 너무 작아지지 않도록 최소 너비 지정
                                                                                padding: '10px 0',   // 버튼 안 텍스트가 적절하게 정렬되도록 설정
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
                                                current={current}
                                                setCurrent={setCurrent}
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
                        {/*<aside className="banner">*/}
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
