import React, {useState} from 'react';
import {Switch, Typography, Form, Input, Popover, Col, Button, InputNumber, message} from 'antd';
import RegisteringChassis from "../../definition/interfaces";
import SearchAddressPopUp from "../SearchAddressPopUp";
import {SearchOutlined} from "@ant-design/icons";
import axios from "axios";
import CalculatedResult from "../../pages/calculateChassis/CalculatedResult";
import {calculateChassisCall} from "../../definition/apiPath";

const { Title } = Typography;

const CalculatorSecondStep = (props: {registeredList: RegisteringChassis[], companyType: string, clickBackButton: () => void}) => {

    const [form] = Form.useForm();

    const [messageApi, contextHolder] = message.useMessage();


    const {registeredList, companyType, clickBackButton} = props;

    const [openSearchAddr, setOpenSearchAddr] = useState(false);
    const [address, setAddress] = useState('');
    const [addressZoneCode, setAddressZoneCode] = useState("");
    const [addressBuildingNum, setAddressBuildingNum] = useState("");
    const [floorCustomerLiving, setFloor] = useState<number | null>();
    const [isScheduledForDemolition, setIsScheduledForDemolition] = useState(true);
    const [isResident, setIsResident] = useState(true);

    const [calculatedChassisPriceResult, setCalculatedChassisPriceResult] = useState<[]>([]);


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

    const handleAddress = (newAddress:any) => {
        setAddress(newAddress.address);
        setAddressZoneCode(newAddress.zonecode);
        setAddressBuildingNum(newAddress.buildingCode);
    };


    const handleOpenSearchAddrChange = (newOpen: boolean) => {
        setOpenSearchAddr(newOpen);
    };

    const formFields = [
        { name: ['zipCode'], value: addressZoneCode },
        { name: ['mainAddress'], value: address },
    ];

    console.log("??? = ", floorCustomerLiving);
    const CallCalculate = () => {
        if (floorCustomerLiving == null) {
            errorModal('공사 예정 층 수를 입력해주세요');
            return;
        }
        console.log("?AA");

        console.log("address = ", address);
        console.log("addressZoneCode = ", addressZoneCode);
        console.log("addressBuildingNum = ", addressBuildingNum);


        console.log("registeredList = ", registeredList);
        console.log("floor = ", floorCustomerLiving);
        console.log("isScheduledForDemolition = ", isScheduledForDemolition);
        console.log("isResident = ", isResident);

        const reqCalculateChassisPriceList = registeredList.map((item) => ({
            chassisType: item.chassisType,
            companyType: companyType,
            width: item.width,
            height: item.height,
            floorCustomerLiving,
            isScheduledForDemolition,
            isResident,
        }));

        axios.post(calculateChassisCall, {reqCalculateChassisPriceList}, {withCredentials: true},
        )
            .then((response) => {
                success("견적 성공");
                setCalculatedChassisPriceResult(response.data);
            })
            .catch((error) => {
                if (error.response.data.errorCode === 202) {
                    errorModal(error.response.data.message);
                    clickBackButton();
                }
            });
    }


    return (
        <>
            {contextHolder}
            {calculatedChassisPriceResult.length === 0 &&
            <table>
                <tbody>
                <tr><td colSpan={2}><Button onClick={clickBackButton}>뒤로가기</Button></td></tr>
                    <tr>
                        <td colSpan={2}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ color: 'red', fontSize: 16, marginTop: '10px' }}>*</div>
                                <Title level={4}>
                                    철거 여부 :
                                </Title>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={2}>
                            <Switch checkedChildren="철거"
                                    unCheckedChildren="철거 안함"
                                    defaultChecked
                                    style={{ marginTop: '-18px', width: '90px' }}
                                    defaultValue={true}
                                    onChange={setIsScheduledForDemolition} />
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
                            <Form form={form} fields={formFields}>
                                <Col>
                                    <Form.Item
                                        name="zipCode"
                                        label=""
                                        style={{ marginTop: '-10px'}}
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
                                                    }}/>
                                                </Popover>
                                            )
                                        } style={{width:"160px"}} readOnly
                                        />
                                    </Form.Item>
                                </Col>

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
                            </Form>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={2}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ color: 'red', fontSize: 16, marginTop: '10px' }}>*</div>
                                <Title level={4}>
                                    공사 예정 층 수 :
                                </Title>
                            </div>
                        </td>
                    </tr>
                <tr>
                    <td colSpan={2}>
                        <InputNumber style={{ width: 150, marginTop: '-18px' }}
                                     addonAfter="층"
                                     min={0}
                                     onChange={setFloor}
                        />
                    </td>
                </tr>
                    <tr >
                        <td colSpan={2}>
                            <div style={{color: 'grey'}}>
                                *사다리차 작업 불가 시 가격 변동 및 작업 불가 가능성 있습니다.<br/>
                                *층수에 따라 가격이 변동됩니다. (사다리차 등)<br/>
                                *사다리차 대여 비용은 기본 2 시간으로 측정됩니다.
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={2}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 30 }}>
                                <div style={{ color: 'red', fontSize: 16, marginTop: '0px' }}>*</div>
                                <Title level={4}>
                                    거주 여부 :
                                </Title>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={2}>
                            <Switch checkedChildren="거주중"
                                    unCheckedChildren="미거주"
                                    onChange={setIsResident}
                                    defaultValue={true}
                                    defaultChecked
                                    style={{ width: 80, marginTop: '-17px'}}/>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan={2}>
                            <div style={{ marginTop: '20%'}}>
                                <Button type={'primary'} size={'large'} onClick={CallCalculate}>계산하기</Button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>}
            {calculatedChassisPriceResult.length !== 0 && <CalculatedResult result={calculatedChassisPriceResult}/>}
        </>
    )
};

export default CalculatorSecondStep;
