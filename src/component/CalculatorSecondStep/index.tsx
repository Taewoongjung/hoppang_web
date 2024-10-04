import React, {useState} from 'react';
import {Switch, Typography, Form, Input, Popover, Col, Button, InputNumber, message} from 'antd';
import RegisteringChassis, {CalculateResult} from "../../definition/interfaces";
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

    // 주소
    const [openSearchAddr, setOpenSearchAddr] = useState(false);
    const [address, setAddress] = useState('');
    const [addressZoneCode, setAddressZoneCode] = useState("");
    const [remainAddress, setRemainAddress] = useState("");
    const [addressBuildingNum, setAddressBuildingNum] = useState("");
    const [sido, setSido] = useState("");
    const [siGunGu, setSiGunGu] = useState("");
    const [yupMyeonDong, setYupMyeonDong] = useState("");
    const [bCode, setBCode] = useState("");
    const [isApartment, setIsApartment] = useState("false");
    const [isExpanded, setIsExpanded] = useState("false");

    // 가격 정보
    const [floorCustomerLiving, setFloor] = useState<number | null>();
    const [isScheduledForDemolition, setIsScheduledForDemolition] = useState(true);
    const [isResident, setIsResident] = useState(true);

    const [calculatedChassisPriceResult, setCalculatedChassisPriceResult] = useState<[]>([]);

    const [requestCalculateObject, setRequestCalculateObject] = useState<CalculateResult>();

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
        console.log("address = ", newAddress);
        console.log("우편번호 = ", newAddress.zonecode);
        console.log("시도 = ", newAddress.sido);
        console.log("시군구 = ", newAddress.sigungu);
        console.log("읍면동 = ", newAddress.bname);
        console.log("bCode = ", newAddress.bcode);
        console.log("apartment = ", newAddress.apartment);

        setAddress(newAddress.address); // input 창에 주소 표시 전용
        setAddressZoneCode(newAddress.zonecode); // 우편번호
        setAddressBuildingNum(newAddress.buildingCode); // 빌딩번호
        setSido(newAddress.sido); // 시도
        setSiGunGu(newAddress.sigungu); // 시군구
        setYupMyeonDong(newAddress.bname); // 읍면동
        setBCode(newAddress.bcode); // 법정동코드

        if (newAddress.apartment === "Y") {
            setIsApartment("true") // 아파트 여부 (디폴트 false)
        }
    };


    const handleOpenSearchAddrChange = (newOpen: boolean) => {
        setOpenSearchAddr(newOpen);
    };

    const formFields = [
        { name: ['zipCode'], value: addressZoneCode },
        { name: ['mainAddress'], value: address },
    ];

    const callCalculate = () => {
        /* 테스트 기간일 때는 주소 입력은 스킵 */
        // if (address == null) {
        //     errorModal('주소를 입력해주세요');
        //     return;
        // }
        // if (subAddress == null) {
        //     errorModal('나머지 주소를 입력해주세요');
        //     return;
        // }
        if (floorCustomerLiving == null) {
            errorModal('공사 예정 층 수를 입력해주세요');
            return;
        }

        console.log("address = ", address);
        console.log("addressZoneCode = ", addressZoneCode);
        console.log("addressBuildingNum = ", addressBuildingNum);
        console.log("remainAddress = ", remainAddress);

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

        axios.post(calculateChassisCall,
            {
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
                },
        {withCredentials: true},
        )
            .then((response) => {
                success("견적 성공");
                allStatesReset();
                setCalculatedChassisPriceResult(response.data);
                setRequestCalculateObject({
                    reqCalculateChassisPriceList: reqCalculateChassisPriceList,
                    zipCode: addressZoneCode,
                    address: address,
                    subAddress: remainAddress,
                    buildingNumber: addressBuildingNum,
                });
            })
            .catch((error) => {
                if (error.response.data.errorCode === 202) {
                    errorModal(error.response.data.message);
                    clickBackButton();
                }
            });
    }

    const allStatesReset = () => {
        setAddress('');
        setRemainAddress('');
        setAddressZoneCode('');
        setAddressBuildingNum('');
        setCalculatedChassisPriceResult([]);
    }

    const changeSubAddress = (subAddr:any) => {
        setRemainAddress(subAddr.target.value);
    }

    return (
        <>
            {contextHolder}
            <div style={{marginLeft:'12%'}}>
                <table>
                    {calculatedChassisPriceResult.length === 0 &&
                        <tbody>
                            <tr>
                                <td colSpan={2}><Button onClick={clickBackButton}>뒤로가기</Button></td>
                            </tr>
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
                                                    placeholder = "나머지 주소"
                                                    onChange={changeSubAddress}
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
                                        <Button type={'primary'} size={'large'} onClick={callCalculate}>계산하기</Button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    }
                    {calculatedChassisPriceResult.length !== 0 && requestCalculateObject &&
                        <tbody>
                            <tr>
                                <td colSpan={2}>
                                    <CalculatedResult result={calculatedChassisPriceResult} requestCalculateObject={requestCalculateObject}/>
                                </td>
                            </tr>
                        </tbody>
                    }
                </table>
            </div>
        </>
    )
};

export default CalculatorSecondStep;
