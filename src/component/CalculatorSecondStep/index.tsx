import React, {useState} from 'react';
import {Switch, Typography, Form, Input, Popover, Col, Button, InputNumber, message, Steps, Divider} from 'antd';
import RegisteringChassis, {CalculateResult} from "../../definition/interfaces";
import SearchAddressPopUp from "../SearchAddressPopUp";
import {LeftOutlined, SearchOutlined} from "@ant-design/icons";
import axios from "axios";
import CalculatedResult from "../../pages/calculateChassis/CalculatedResult";
import {calculateChassisCall} from "../../definition/apiPath";
import './styles.css';
import {mappedValueByCompany} from "../../util";
import OverlayLoadingPage from "../Loading/OverlayLoadingPage";

const { Title } = Typography;


const CalculatorSecondStep = (props: {
    registeredList: RegisteringChassis[],
    companyType: string,
    clickBackButton: () => void,
    current:number,
    setCurrent: (s: number) => void
}) => {

    const [form] = Form.useForm();

    const [isLoading, setIsLoading] = useState(false);

    const [messageApi, contextHolder] = message.useMessage();

    const {registeredList, companyType, clickBackButton, current, setCurrent} = props;

    // 주소
    const [openSearchAddr, setOpenSearchAddr] = useState(false);
    const [address, setAddress] = useState("");
    const [addressZoneCode, setAddressZoneCode] = useState("");
    const [remainAddress, setRemainAddress] = useState("");
    const [addressBuildingNum, setAddressBuildingNum] = useState("");
    const [sido, setSido] = useState("");
    const [siGunGu, setSiGunGu] = useState("");
    const [yupMyeonDong, setYupMyeonDong] = useState("");
    const [bCode, setBCode] = useState("");
    const [isApartment, setIsApartment] = useState(false);

    // 추가 기타사항 입력 변수
    const [isExpanded, setIsExpanded] = useState(false);
    const [floorCustomerLiving, setFloor] = useState<number | null>();
    const [isScheduledForDemolition, setIsScheduledForDemolition] = useState(true);
    const [isResident, setIsResident] = useState(true);

    const [calculatedChassisPriceResult, setCalculatedChassisPriceResult] = useState<[]>([]);

    const [requestCalculateObject, setRequestCalculateObject] = useState<CalculateResult>();


    // 작성 순서
    const [order, setOrder] = useState(1);

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
            setIsApartment(true) // 아파트 여부 (디폴트 false)
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
        console.log("isApartment = ", isApartment);
        console.log("isExpanded = ", isExpanded);

        const reqCalculateChassisPriceList = registeredList.map((item) => ({
            chassisType: item.chassisType,
            companyType: mappedValueByCompany(companyType),
            width: item.width,
            height: item.height,
            floorCustomerLiving,
            isScheduledForDemolition,
            isResident
        }));

        setIsLoading(true);
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
            {
                withCredentials: true,
                headers: {
                    Authorization: localStorage.getItem("hoppang-token"),
                }
            },
        )
            .then((response) => {
                success("견적 성공");
                setCalculatedChassisPriceResult(response.data);
                setRequestCalculateObject({
                    reqCalculateChassisPriceList: reqCalculateChassisPriceList,
                    zipCode: addressZoneCode,
                    sido: sido,
                    siGunGu: siGunGu,
                    yupMyeonDong: yupMyeonDong,
                    bCode: bCode,
                    isApartment: isApartment,
                    isExpanded: isExpanded,
                    remainAddress: remainAddress,
                    buildingNumber: addressBuildingNum,
                });
                setCurrent(5);

                // 로딩 화면 제거
                setTimeout(() => {
                    setIsLoading(false);
                }, 2030);

            })
            .catch((error) => {
                if (error.response.data.errorCode === 202) {
                    alert(error.response.data.message);
                    clickBackButton();
                    setIsLoading(false);
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

    const handleSetFloor = (value:any) => {
        setFloor(value);

        if (order < 2) {
            setOrder(3);
        }
    }

    const handleSetAddressSector = () => {

        // 테스트 기간은 검증 안함 (이후에는 밑에 주석 해제 해야 한다)
        // if (address !== '' && remainAddress !== '' && order === 1) {
        //     setOrder(2);
        //     setCurrent(3);
        // }

        setOrder(2);
        setCurrent(3);
    }

    const completeSetIsExpanded = () => {
        if (order === 2) {
            setOrder(3);
        }
    }

    const completeSetFloorSector = () => {
        if (floorCustomerLiving && order === 3) {
            setOrder(4);
        }
    }

    const completeSetIsScheduledForDemolitionSector = () => {
        if (order === 4) {
            setOrder(5);
        }
    }

    const completeSetDemolitionSector = () => {
        if (order === 5) {
            setOrder(6);
            setCurrent(4);
        }
    }


    return (
        <>
            {isLoading && <OverlayLoadingPage/>}


            {contextHolder}
            {/*상황 진척도*/}
            {current !== 5 &&
                <div style={{ width: "700px", marginBottom: '60px'}}>
                    <Steps
                        current={current}
                        size="small"
                        items={[
                            {
                                title: '회사선택',
                                description: companyType
                            },
                            {
                                title: '창호 입력',
                            },
                            {
                                title: '주소 입력',
                            },
                            {
                                title: '기타 사항 입력',
                            },
                            {
                                title: '계산시작',
                            },
                        ]}
                    />
                </div>
            }
            <div style={{width: "700px"}}>
                <table>
                    {calculatedChassisPriceResult.length === 0 &&
                        <tbody>
                            {/*뒤로가기*/}
                            {(order === 1) &&
                                <div onClick={clickBackButton} style={{color: "blue", marginRight: "80%", marginTop: '50px'}}>
                                    <LeftOutlined/>
                                </div>
                            }

                            {/*주소입력*/}
                            {(order === 1) &&
                                <>
                                    <tr>
                                        <td colSpan={2}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: "50%" }}>
                                                <div style={{ color: 'red', fontSize: 16 }}>*</div>
                                                <Title level={2}>
                                                    주소 입력
                                                </Title>
                                            </div>
                                            <Divider  style={{  borderColor: '#a4a3a3', marginTop: '-10px' }}/>
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
                                                                    content={
                                                                        <SearchAddressPopUp
                                                                            setAddress={handleAddress}
                                                                            setOpenSearchAddr={setOpenSearchAddr}
                                                                        />
                                                                    }
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
                                            {order < 6 &&
                                                <Button onClick={handleSetAddressSector}>입력</Button>
                                            }
                                        </td>
                                    </tr>
                                </>
                            }
                            {(order === 2) &&
                                <>
                                    <tr>
                                        <td colSpan={2}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: "50%" }}>
                                                <div style={{ color: 'red', fontSize: 16 }}>*</div>
                                                <Title level={2}>
                                                    확장 여부
                                                </Title>
                                            </div>
                                            <Divider  style={{  borderColor: '#a4a3a3', marginTop: '-10px' }}/>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2}>
                                            <Switch checkedChildren="확장"
                                                    unCheckedChildren="미확장"
                                                    style={{ marginTop: '-18px', width: '90px' }}
                                                    defaultValue={false}
                                                    onChange={setIsExpanded}
                                            />
                                        </td>
                                    </tr>
                                    {order < 6 &&
                                        <Button onClick={completeSetIsExpanded} style={{marginTop: 40}}>입력</Button>
                                    }
                                </>
                            }

                            {(order === 3) &&
                                <>
                                    <tr>
                                        <td colSpan={2}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: "50%" }}>
                                                <div style={{ color: 'red', fontSize: 16 }}>*</div>
                                                <Title level={2}>
                                                    공사 예정 층 수
                                                </Title>
                                            </div>
                                            <Divider  style={{  borderColor: '#a4a3a3', marginTop: '-10px' }}/>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2}>
                                            <InputNumber style={{ width: 150 }}
                                                         addonAfter="층"
                                                         min={0}
                                                         onChange={handleSetFloor}
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
                                    {order < 6 &&
                                        <Button onClick={completeSetFloorSector} style={{marginTop: 40}}>입력</Button>
                                    }
                                </>
                            }

                            {(order === 4)  &&
                                <>
                                    <tr>
                                        <td colSpan={2}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: "50%" }}>
                                                <div style={{ color: 'red', fontSize: 16 }}>*</div>
                                                <Title level={2}>
                                                    철거 여부
                                                </Title>
                                            </div>
                                            <Divider  style={{  borderColor: '#a4a3a3', marginTop: '-10px' }}/>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan={2}>
                                            <Switch checkedChildren="철거"
                                                    unCheckedChildren="철거 안함"
                                                    defaultChecked
                                                    style={{ marginTop: '-18px', width: '90px' }}
                                                    defaultValue={true}
                                                    onChange={setIsScheduledForDemolition}
                                            />
                                        </td>
                                    </tr>
                                    {order < 6 &&
                                        <Button onClick={completeSetIsScheduledForDemolitionSector} style={{marginTop: 40}}>확정</Button>
                                    }
                                </>
                            }

                            {(order === 5) &&
                                <>
                                    <tr>
                                        <td colSpan={2}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: "50%"  }}>
                                                <div style={{ color: 'red', fontSize: 16, marginTop: '0px' }}>*</div>
                                                <Title level={2}>
                                                    거주 여부
                                                </Title>
                                            </div>
                                            <Divider  style={{  borderColor: '#a4a3a3', marginTop: '-10px' }}/>
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
                                    {order < 6 &&
                                        <Button onClick={completeSetDemolitionSector} style={{marginTop: 40}}>확정</Button>
                                    }
                                </>
                            }
                            {order > 5 &&
                                <tr>
                                    <td colSpan={2}>
                                        <div style={{ marginTop: '50px'}}>
                                            <button className="special-button" onClick={callCalculate}>계산하기</button>
                                        </div>
                                    </td>
                                </tr>
                            }
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
