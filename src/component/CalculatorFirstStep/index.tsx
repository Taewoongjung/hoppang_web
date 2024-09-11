import React, {useEffect, useState} from 'react';
import RegisteringChassis from "../../definition/interfaces";
import {Button, Divider, InputNumber, List, message, Select, Typography} from "antd";
import chassisTypeOptions from "../../definition/chassisType";
import {DeleteOutlined, RightOutlined} from "@ant-design/icons";
import {InputStatus} from "antd/es/_util/statusUtils";

const { Title } = Typography;

const CalculatorFirstStep = (props: {
    registeredList: RegisteringChassis[],
    setRegisteredList: (list: RegisteringChassis[]) => void;
    setSecondStep: (target: boolean) => void;
}) => {

    const ContainerHeight = 200;

    const {registeredList, setRegisteredList, setSecondStep} = props;

    const [messageApi, contextHolder] = message.useMessage();

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
        // @ts-ignore
        setRegisteredList(prevList => prevList.filter((item, idx) => idx !== index));
    };

    const CompleteOnFirstScreen = () => {
        setSecondStep(true);
    };


    return (
        <>
            {contextHolder}
            <table>
                <tbody>
                    <tr>
                        <td colSpan={2}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ color: 'red', fontSize: 16, marginTop: '10px' }}>*</div>
                                <Title level={4}>
                                    샤시 종류 선택 :
                                </Title>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={2}>
                            <Select
                                status={chassisTypeStatus}
                                defaultValue="샤시 종류 선택"
                                style={{ width: 150, marginLeft: '20%' }}
                                onChange={setChassisType}
                                options={chassisTypeOptions}/>
                        </td>
                    </tr>

                    <tr>
                        <td colSpan={2}>
                            <div style={{marginTop:'30%', marginBottom:'-25%'}}>
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
                                    샤시 가로 (w) :
                                </Title>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={2}>
                            <InputNumber style={{ width: 150, marginLeft: '20%' }}
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
                                    샤시 세로 (h) :
                                </Title>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={2}>
                            <InputNumber style={{ width: 150, marginLeft: '20%' }}
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
                                style={{marginTop: '25%', width: '45%'}}
                                onClick={handleRegisterChassis}
                            >
                                추가
                            </Button>

                            <Divider style={{ marginTop: '10%' }}>추가리스트</Divider>
                            <div id="scrollableDiv" style={{ height: ContainerHeight, overflow: 'auto', width: 300 }}>
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
                                                style={{fontSize:18, color: 'red'}}
                                                onClick={() => deleteRegisteredChassis(item.index)}
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
                                <div style={{ marginTop: '20%'}}>
                                    <Button type={'primary'} size={'large'} onClick={CompleteOnFirstScreen}>확정<RightOutlined /></Button>
                                </div>
                            }
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    )
}

export default CalculatorFirstStep;
