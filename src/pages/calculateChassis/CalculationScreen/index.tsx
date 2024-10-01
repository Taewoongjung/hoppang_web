import React, {useEffect, useState} from 'react';
import '../styles.css';
import {Col, Row, message, Select, InputNumber, Button, Divider, List, Tooltip} from "antd";
import { Typography } from 'antd';
import chassisTypeOptions from "../../../definition/chassisType";
import {InputStatus} from "antd/es/_util/statusUtils";
import CalculatorSecondStep from "../../../component/CalculatorSecondStep";
import RegisteringChassis from "../../../definition/interfaces";
import {DeleteOutlined, RightOutlined, SwapOutlined} from "@ant-design/icons";
import InitialScreen from '../InitialScreen';
import styled, { keyframes } from "styled-components";
import companyTypeOptions from "../../../definition/companyType";
import {mappedCompanyByValue} from "../../../util";

const { Title, Text } = Typography;

const blink = keyframes`
      0% { opacity: 1; }
      50% { opacity: 0; }
      100% { opacity: 1; }
`;

const AnimatedIcon = styled(SwapOutlined)`
  color: #ababab;
  width: 15px;
  margin-left: 8px;
  cursor: pointer;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.2);
  }

  &.blink {
    animation: ${blink} 0.5s linear;
  }
`;

const CalculationScreen = () => {

    const ContainerHeight = 200;

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
    };

    const clickBackButton = () => {
        setSecondStep(false);
    }

    const [deviceId, setDeviceId] = useState<string>();
    const [deviceType, setDeviceType] = useState<string>();

    useEffect(() => {
        const deviceIdFromLocal = localStorage.getItem('deviceId');
        const deviceTypeFromLocal = localStorage.getItem('deviceType');

        if (deviceIdFromLocal && deviceTypeFromLocal) {
            setDeviceId(deviceIdFromLocal);
            setDeviceType(deviceTypeFromLocal);
        } else {
            console.log('No deviceId found in localStorage');
        }
    }, []);

    const [isBlinking, setIsBlinking] = useState(false);
    const [isRevising, setIsRevising] = useState(false);

    const handleIconClick = () => {
        setIsBlinking(true);
        setIsRevising(true);
        setTimeout(() => setIsBlinking(false), 500);
    };

    const handleChangeCompanyType = (target : any) => {
        setCompany(target);
        setIsRevising(false);
    }


    return (
        <>
            {contextHolder}
            <div className="app">
                <header className="app-header">
                    <h1>호빵</h1>
                    <div>디바이스 아이디 :({deviceType}) {deviceId}</div>
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
                                        />
                                    }

                                    {(!secondStep && companyType !== '선택안함') &&
                                        <table>
                                            <tbody>
                                                <tr>
                                                    <td colSpan={2}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Title level={5}>
                                                                {!isRevising && <Text keyboard> {mappedCompanyByValue(companyType)} </Text> }
                                                                {!isRevising &&
                                                                    <Tooltip title="회사 재설정하기">
                                                                        <AnimatedIcon
                                                                            className={isBlinking ? 'blink' : ''}
                                                                            onClick={handleIconClick}
                                                                        />
                                                                    </Tooltip>
                                                                }
                                                                {isRevising &&
                                                                    <Select
                                                                        status={companyTypeStatus}
                                                                        value={companyType}
                                                                        style={{ width: 150 }}
                                                                        onChange={handleChangeCompanyType}
                                                                        options={companyTypeOptions}/>
                                                                }
                                                            </Title>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colSpan={2}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <div style={{ color: 'red', fontSize: 16, marginTop: '10px' }}>*</div>
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
                                                            style={{ width: 150 }}
                                                            onChange={setChassisType}
                                                            options={chassisTypeOptions}/>
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td colSpan={2}>
                                                        <div style={{marginTop:'12%', marginBottom:'-28%'}}>
                                                            <div style={{color: 'grey', textDecorationLine: 'underline'}}>
                                                                *가로 세로 수치는 10mm 단위로 작성 해주세요
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colSpan={2}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '15%' }}>
                                                            <div style={{ color: 'red', fontSize: 16, marginTop: '10px' }}>*</div>
                                                            <Title level={4}>
                                                                창호 가로 (w) :
                                                            </Title>
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colSpan={2}>
                                                        <InputNumber style={{ width: 150 }}
                                                                     addonAfter="mm"
                                                                     min={0}
                                                                     status={widthStatus}
                                                                     onChange={setWidth}
                                                        />
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
                                                        <InputNumber style={{ width: 150 }}
                                                                     addonAfter="mm"
                                                                     min={0}
                                                                     status={heightStatus}
                                                                     onChange={setHeight}
                                                        />
                                                    </td>
                                                </tr>

                                                <tr>
                                                    <td colSpan={2}>
                                                        <Button
                                                            type="dashed"
                                                            shape="round"
                                                            style={{marginTop: '15%', width: '45%'}}
                                                            onClick={handleRegisterChassis}
                                                        >
                                                            추가
                                                        </Button>

                                                        <Divider style={{ marginTop: '10%' }}>추가리스트</Divider>
                                                        <div id="scrollableDiv" style={{ height: ContainerHeight, overflow: 'auto', width: 400 }}>
                                                            <List
                                                                itemLayout={"horizontal"}
                                                                dataSource={registeredList}
                                                                renderItem={(item: RegisteringChassis, index) => (
                                                                    <List.Item key={item.index}>
                                                                        <List.Item.Meta
                                                                            title={getLabelOfChassisType(item.chassisType)}
                                                                            description={
                                                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                                    <table>
                                                                                        <tr>
                                                                                            <td>가로 :</td>
                                                                                            <td>{item.width}</td>
                                                                                        </tr>
                                                                                        <tr>
                                                                                            <td>세로 :</td>
                                                                                            <td>{item.height}</td>
                                                                                        </tr>
                                                                                    </table>
                                                                                </div>
                                                                            }
                                                                        />
                                                                        <div
                                                                            style={{fontSize:18, color: 'red', marginRight: 10}}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation(); // 이벤트 전파 중단
                                                                                console.log(`Deleting chassis with index: ${item.index}`); // 함수 호출 확인 로그
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
                                                            <div >
                                                                <Button type={'primary'} size={'large'} onClick={CompleteOnFirstScreen}>확정<RightOutlined /></Button>
                                                            </div>
                                                        }
                                                    </td>
                                                </tr>
                                            </tbody>
                                    </table>}

                                    {/* 두 번째 화면 렌더링 */}
                                    {secondStep && <CalculatorSecondStep registeredList={registeredList} companyType={companyType} clickBackButton={clickBackButton}/> }
                                </Col>
                            </div>
                        </Row>
                        <Divider/>
                        <footer className="footer">
                            인트로 정일윤 | 주소 : 울산광역시남구삼산로318번길12,2층(삼산동) | 사업자등록번호 : 175-24-00881
                        </footer>
                    </div>
                    {/*<aside className="banner">*/}
                    {/*    <p>광고 베너 칸</p>*/}
                    {/*</aside>*/}
                </main>
            </div>
        </>
    );
}

export default CalculationScreen;
