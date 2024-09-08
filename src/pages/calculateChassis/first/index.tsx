import React, {useEffect, useState} from 'react';
import '../styles.css';
import {Col, Divider, InputNumber, Row, Select, List, message, Button, } from "antd";
import { Typography } from 'antd';
import chassisTypeOptions from "../../../definition/chassisType";
import {DeleteOutlined, RightOutlined} from "@ant-design/icons";
import {InputStatus} from "antd/es/_util/statusUtils";
import CalculatorSecondStep from "../../../component/CalculatorSecondStep";
import RegisteringChassis from "../../../definition/interfaces";
import CalculatorFirstStep from "../../../component/CalculatorFirstStep";

const { Title } = Typography;

const FirstScreen = () => {

    const ContainerHeight = 200;

    const [messageApi, contextHolder] = message.useMessage();

    const [secondStep, setSecondStep] = useState(false);

    const [registeredList, setRegisteredList] = useState<RegisteringChassis[]>([]);
    const [chassisType, setChassisType] = useState<string>('선택안함');
    const [width, setWidth] = useState<number | null>();
    const [height, setHeight] = useState<number | null>();

    // 인풋 각각 입력 상태값
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
        if (chassisType !== '선택안함' && chassisType !== undefined) {
            setChassisTypeStatus('');
        }

        if (width !== null) {
            setWidthStatus('');
        }

        if (height !== null) {
            setHeightStatus('');
        }

    }, [chassisType, width, height]);

    const handleRegisterChassis = () => {

        if (chassisType === '선택안함' || chassisType === undefined) {
            errorModal("샤시 종류를 선택해주세요.");
            setChassisTypeStatus('error');
            return;
        }

        if (width === null || width === undefined) {
            errorModal("샤시 가로 정보를 입력해주세요.");
            setWidthStatus('error');
            return;
        }

        if (height === null || height === undefined) {
            errorModal("샤시 세로 정보를 입력해주세요.");
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


    return (
        <>
            {contextHolder}
            <div className="app">
                <header className="app-header">
                    <h1>호구 빵명 프로젝트</h1>
                </header>
                <main className="app-main">
                    <aside className="banner">
                        <p>광고 베너 칸</p>
                    </aside>
                    <div className="content">
                        <Row>

                            <Col xs={2} sm={4} md={6} lg={8} xl={5} />

                            <Col xs={20} sm={16} md={12} lg={8} xl={14}
                                 style={{textAlign: 'center', marginTop: '2%'}}
                            >
                                {!secondStep &&
                                    <CalculatorFirstStep
                                        registeredList={registeredList}
                                        setRegisteredList={setRegisteredList}
                                        setSecondStep={setSecondStep} />
                                }

                                { secondStep && <CalculatorSecondStep registeredList={registeredList} /> }

                            </Col>

                            <Col xs={2} sm={4} md={6} lg={8} xl={5} />

                        </Row>
                    </div>
                    <aside className="banner">
                        <p>광고 베너 칸</p>
                    </aside>
                </main>
            </div>
        </>
    );
}

export default FirstScreen;
