import React, {useState} from 'react';
import {Switch, Typography, Form, Input, Popover, Row, Col, Button} from 'antd';
import RegisteringChassis from "../../definition/interfaces";
import SearchAddressPopUp from "../SearchAddressPopUp";
import {SearchOutlined} from "@ant-design/icons";

const { Title } = Typography;

const CalculatorSecondStep = (props: {registeredList: RegisteringChassis[]}) => {

    const [form] = Form.useForm();

    const {registeredList} = props;

    const [openSearchAddr, setOpenSearchAddr] = useState(false);
    const [address, setAddress] = useState('');
    const [addressZoneCode, setAddressZoneCode] = useState("");
    const [addressBuildingNum, setAddressBuildingNum] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [floor, setFloor] = useState('');

    const handleAddress = (newAddress:any) => {
        setAddress(newAddress.address);
        setAddressZoneCode(newAddress.zonecode);
        setAddressBuildingNum(newAddress.buildingCode);
    };

    const handleOpenSearchAddrChange = (newOpen: boolean) => {
        setOpenSearchAddr(newOpen);
    };

    const onChange = (checked: boolean) => {
        console.log(`switch to ${checked}`);
    };

    const showModal = () => {
        setIsModalOpen(true);
    };

    const formFields = [
        { name: ['zipCode'], value: addressZoneCode },
        { name: ['mainAddress'], value: address },
    ];

    const onFinish = async (values: any) => {
        const {companyName, zipCode, mainAddress, subAddress, tel} = values;
        const bdgNumber = addressBuildingNum;

    }

    const CallCalculate = () => {

    }


    return (
        <>
            <div>
                <table>
                    <tbody>
                        <tr>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ color: 'red', fontSize: 16, marginTop: '10px' }}>*</div>
                                    <Title level={4}>
                                        철거 여부 :
                                    </Title>
                                </div>
                            </td>
                            <td>
                                <Switch defaultChecked
                                        style={{ marginTop: '18px', marginLeft: '20%' }}
                                        onChange={onChange} />
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ color: 'red', fontSize: 16, marginTop: '10px' }}>*</div>
                                    <Title level={4}>
                                        주소 입력 :
                                    </Title>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2}>
                                <Form layout="vertical" form={form} onFinish={onFinish} fields={formFields}>
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item
                                                name="zipCode"
                                                label=""
                                                style={{ marginTop: '40px', marginLeft: '20%' }}
                                                rules={[{ required: true, message: '⚠️ 주소는 필수 응답 항목입니다.' }]}
                                            >
                                                <Input addonAfter={
                                                        (
                                                            <Popover
                                                                content={<SearchAddressPopUp setAddress={handleAddress} setOpenSearchAddr={setOpenSearchAddr}/>}
                                                                trigger="click"
                                                                open={openSearchAddr}
                                                                placement="bottom"
                                                                onOpenChange={handleOpenSearchAddrChange}
                                                            >
                                                                <SearchOutlined onClick={(e) => {
                                                                    e.preventDefault();
                                                                    showModal();
                                                                }}
                                                                />
                                                            </Popover>
                                                        )
                                                    } style={{width:"200px"}} readOnly
                                                />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}/>

                                        <Row gutter={16}>
                                            <Col>
                                                <Form.Item
                                                    name="mainAddress"
                                                >
                                                    <Input
                                                        style={{ width: '300px' }}
                                                        readOnly
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col>
                                                <Form.Item
                                                    name="subAddress"
                                                    rules={[
                                                        { required: true, message: '⚠️ 나머지 주소는 필수 응답 항목입니다.' },
                                                    ]}
                                                >
                                                    <Input
                                                        style={{ width: '300px' }}
                                                        id="company_sub_address"
                                                        type="text"
                                                        placeholder = "사업체 나머지 주소"
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                    </Row>
                                </Form>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ color: 'red', fontSize: 16, marginTop: '10px' }}>*</div>
                                    <Title level={4}>
                                        공사 예정 층 수 :
                                    </Title>
                                </div>
                            </td>
                            <td>
                                <Input style={{ width: 150, marginTop: '18px', marginLeft: '10%' }}
                                             addonAfter="층"
                                             onChange={() => setFloor}
                                />
                            </td>
                        </tr>
                        <tr >
                            <td colSpan={2}>
                                <div style={{color: 'grey'}}>
                                    *사다리차 작업 불가 시 가격 변동 및 작업 불가 가능성 있습니다.
                                </div>
                                <div style={{color: 'grey'}}>
                                    *층수에 따라 가격이 변동될 수 있습니다. (사다리차 등)
                                </div>
                                <div style={{color: 'grey'}}>
                                    *사다리차 대여 비용은 기본으로 2 시간으로 측정됩니다.
                                </div>
                            </td>
                            </tr>
                    </tbody>
                </table>

                <div style={{ marginTop: '18%'}}>
                    <Button type={'primary'} size={'large'} onClick={CallCalculate}>계산하기</Button>
                </div>
            </div>
        </>
    )
};

export default CalculatorSecondStep;
