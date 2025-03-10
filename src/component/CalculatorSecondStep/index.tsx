import React, {useEffect, useRef, useState} from 'react';
import {
    Switch,
    Typography,
    Form,
    Input,
    Popover,
    Col,
    Button,
    InputNumber,
    message,
    Divider,
    TourProps,
    Tour,
    InputRef,
} from 'antd';
import RegisteringChassis, {CalculateResult} from "../../definition/interfaces";
import {LeftOutlined} from "@ant-design/icons";
import axios from "axios";
import CalculatedResult from "../../pages/calculateChassis/CalculatedResult";
import {calculateChassisCall, callMeData} from "../../definition/apiPath";
import './styles.css';
import {mappedValueByCompany} from "../../util";
import OverlayLoadingPage from "../Loading/OverlayLoadingPage";
import InfoSection from "../CalculationInfoSection";
import SearchAddressPopUp from '../SearchAddressPopUp';
import useSWR from "swr";
import fetcher from "../../util/fetcher";

const { Title } = Typography;

const CalculatorSecondStep = (props: {
    registeredList: RegisteringChassis[],
    companyType: string,
    clickBackButton: () => void,
    current:number,
    setCurrent: (s: number) => void
}) => {

    const { data: userData, error, mutate } = useSWR(callMeData, fetcher, {
        dedupingInterval: 2000
    });

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

    // 가이드 관련
    const [guideOpen, setGuideOpen] = useState<boolean>(false);
    const addressRef = useRef<InputRef>(null);


    useEffect(() => {
        if (order === 1) {
            setGuideOpen(true);
        }
    }, [order]);

    const steps: TourProps['steps'] = [
        {
            title: '주소 입력',
            placement: 'bottom',
            description: '터치 해서 주소를 입력해주세요.',
            target: () => addressRef.current?.input as HTMLElement || null,
            closeIcon: null,
            nextButtonProps : {
                children: (
                    <div style={{color: "#4da3ff"}}>닫기</div>
                ),
                style: {
                    backgroundColor: "white",
                    borderRadius: "10%",
                    width: 32,
                    minWidth: 32,
                    height: 32,
                }
            }
        }
    ]

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
        // @TODO 여기에, 해당 유저가 로그인 단계를 모두 거쳤는지 (전화번호 인증, 주소 입력, 푸시 여부 입력) 단계를 거쳤는지 확인 하기. (current 4.5 단계)
        // @TODO 만약 안 거쳤으면, 해당 절차를 다 하고 온 뒤 current 5 단계로 넘어 가서 견적을 마친다.
        // @TODO 유저가 모든 로그인 절차를 거쳤는지 판단하는 방법은 userData의 hasCompletedAuthentication로 한다.

        mutate();

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

    const changeSubAddress = (subAddr:any) => {
        setRemainAddress(subAddr.target.value);
    }

    const handleSetFloor = (value:any) => {
        setFloor(value);

        if (order < 2) {
            setOrder(3);
        }
    }

    const handleAddressStates = () => {
        setOpenSearchAddr(true);
        setGuideOpen(false);
    }

    const handleSetAddressSector = () => {

        if (!address) {
            errorModal('주소를 입력해주세요');
            return;
        }
        if (!remainAddress) {
            errorModal('나머지 주소를 입력해주세요');
            return;
        }

        if (address !== '' && remainAddress !== '' && order === 1) {
            setOrder(2);
            setCurrent(3);
        }

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
            {isLoading && <OverlayLoadingPage word={"처리중"}/>}

            <Tour
                type="primary"
                steps={steps}
                open={guideOpen}
                onClose={() => setGuideOpen(false)}
                mask={false}
            />

            {contextHolder}

            <div style={{width: "700px"}}>
                <table>
                    {calculatedChassisPriceResult.length === 0 &&
                        <tbody>
                        {/*뒤로가기*/}
                        {(order === 1) &&
                            <div onClick={clickBackButton}
                                 style={{color: "blue", marginRight: "80%", marginTop: '50px'}}>
                                <LeftOutlined/>
                            </div>
                        }

                        {/*주소입력*/}
                        {(order === 1) &&
                            <>
                                <tr>
                                    <td colSpan={2}>
                                        <div style={styles.wrapperOfTitle}>
                                            <Title
                                                level={2}
                                                style={styles.title}
                                            >
                                                주소 입력
                                            </Title>
                                        </div>
                                        <Divider style={{borderColor: '#a4a3a3'}}/>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={2}>
                                        <Form form={form} fields={formFields}>
                                            <Col>
                                                <Form.Item
                                                    name="zipCode"
                                                    label=""
                                                    style={{marginTop: '-10px'}}
                                                    rules={[{required: true, message: '⚠️ 주소는 필수 응답 항목입니다.'}]}
                                                >
                                                    <Input
                                                        ref={addressRef}
                                                        onClick={handleAddressStates}
                                                        style={{width: "160px"}} readOnly
                                                    />
                                                </Form.Item>
                                            </Col>
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
                                            </Popover>

                                            <Col>
                                                <Form.Item
                                                    name="mainAddress"
                                                >
                                                    <Input
                                                        onClick={handleAddressStates}
                                                        style={{width: '300px'}}
                                                        readOnly
                                                    />
                                                </Form.Item>
                                            </Col>
                                            <Col>
                                                <Form.Item
                                                    name="subAddress"
                                                    rules={[
                                                        {required: true, message: '⚠️ 나머지 주소는 필수 응답 항목입니다.'},
                                                    ]}
                                                >
                                                    <Input
                                                        style={{width: '300px'}}
                                                        id="company_sub_address"
                                                        type="text"
                                                        placeholder="나머지 주소"
                                                        onChange={changeSubAddress}
                                                    />
                                                </Form.Item>
                                            </Col>
                                        </Form>
                                        {order < 6 &&
                                            <Button
                                                onClick={handleSetAddressSector}
                                                style={styles.button}
                                            >
                                                입력
                                            </Button>
                                        }
                                    </td>
                                </tr>
                            </>
                        }
                        {(order === 2) &&
                            <>
                                <tr>
                                    <td colSpan={2}>
                                        <div style={styles.wrapperOfTitle}>
                                            <Title
                                                level={2}
                                                style={styles.title}
                                            >
                                                확장 여부
                                            </Title>
                                        </div>
                                        <Divider style={{borderColor: '#a4a3a3'}}/>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={2}>
                                        <Switch checkedChildren="확장"
                                                unCheckedChildren="미확장"
                                                style={{marginTop: '-18px', width: '90px'}}
                                                defaultValue={false}
                                                onChange={setIsExpanded}
                                        />
                                    </td>
                                </tr>
                                {order < 6 &&
                                    <Button
                                        onClick={completeSetIsExpanded}
                                        style={styles.button}
                                    >
                                        입력
                                    </Button>
                                }
                            </>
                        }

                        {(order === 3) &&
                            <>
                                <tr>
                                    <td colSpan={2}>
                                        <div style={styles.wrapperOfTitle}>
                                            <Title
                                                level={2}
                                                style={styles.title}
                                            >
                                                공사 예정 층 수
                                            </Title>
                                        </div>
                                        <Divider style={{borderColor: '#a4a3a3'}}/>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={2}>
                                        <InputNumber style={{width: 150}}
                                                     addonAfter="층"
                                                     min={0}
                                                     onChange={handleSetFloor}
                                                     inputMode="numeric"
                                                     pattern="\d*"
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={2}>
                                        <div style={{color: 'grey'}}>
                                            *사다리차 작업 불가 시 가격 변동 및 작업 불가 가능성 있습니다.<br/>
                                            *층수에 따라 가격이 변동됩니다. (사다리차 등)<br/>
                                            *사다리차 대여 비용은 기본 2 시간으로 측정됩니다.
                                        </div>
                                    </td>
                                </tr>
                                {order < 6 &&
                                    <Button
                                        onClick={completeSetFloorSector}
                                        style={styles.button}
                                    >
                                        입력
                                    </Button>
                                }
                            </>
                        }

                        {(order === 4) &&
                            <>
                                <tr>
                                    <td colSpan={2}>
                                        <div style={styles.wrapperOfTitle}>
                                            <Title
                                                level={2}
                                                style={styles.title}
                                            >
                                                철거 여부
                                            </Title>
                                        </div>
                                        <Divider style={{borderColor: '#a4a3a3'}}/>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={2}>
                                        <Switch checkedChildren="철거"
                                                unCheckedChildren="철거 안함"
                                                defaultChecked
                                                style={{marginTop: '-18px', width: '90px'}}
                                                defaultValue={true}
                                                onChange={setIsScheduledForDemolition}
                                        />
                                    </td>
                                </tr>
                                {order < 6 &&
                                    <Button
                                        onClick={completeSetIsScheduledForDemolitionSector}
                                        style={styles.button}
                                    >
                                        확정
                                    </Button>
                                }
                            </>
                        }

                        {(order === 5) &&
                            <>
                                <tr>
                                    <td colSpan={2}>
                                        <div style={styles.wrapperOfTitle}>
                                            <Title
                                                level={2}
                                                style={styles.title}
                                            >
                                                거주 여부
                                            </Title>
                                        </div>
                                        <Divider style={{borderColor: '#a4a3a3'}}/>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={2}>
                                        <Switch checkedChildren="거주중"
                                                unCheckedChildren="미거주"
                                                onChange={setIsResident}
                                                defaultValue={true}
                                                defaultChecked
                                                style={{width: 80, marginTop: '-17px'}}/>
                                    </td>
                                </tr>
                                {order < 6 &&
                                    <Button
                                        onClick={completeSetDemolitionSector}
                                        style={styles.button}
                                    >
                                        확정
                                    </Button>
                                }
                            </>
                        }
                        {order > 5 &&
                            <tr>
                                <td colSpan={2}>
                                    <div
                                        style={{
                                            marginTop: '50px',
                                            width: '100%',
                                            maxWidth: '700px',       // 최대 너비 설정
                                            boxSizing: 'border-box', // 넘침 방지
                                            padding: '10px',         // 여백 추가
                                            display: 'flex',         // 플렉스 사용
                                            flexDirection: 'column', // 세로 정렬
                                            alignItems: 'center',    // 수직 중앙 정렬
                                            justifyContent: 'center' // 수평 중앙 정렬
                                        }}
                                    >
                                        <InfoSection />

                                        <button
                                            className="special-button"
                                            onClick={callCalculate}
                                            style={{
                                                ...styles.button,
                                            }}
                                        >
                                            계산하기
                                        </button>
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
                                <CalculatedResult result={calculatedChassisPriceResult}
                                                  requestCalculateObject={requestCalculateObject}/>
                            </td>
                        </tr>
                        </tbody>
                    }
                </table>
            </div>
        </>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    button: {
        width: window.innerWidth > 768 ? '90%' : '40%',
        maxWidth: '400px',
        minWidth: '150px',
        padding: '10px 0',
        fontSize: '16px',
        boxSizing: 'border-box', // 넘침 방지
    },
    wrapperOfTitle: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: window.innerWidth > 768 ? '80%' : '100%',  // 화면 크기에 따라 너비 조정
        textAlign: 'center',
        padding: window.innerWidth > 768 ? '0 5%' : '0 2%',  // 좌우 여백 조정
        boxSizing: 'border-box', // 넘침 방지
    },
    title: {
        margin: 0,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '100%'
    }
};


export default CalculatorSecondStep;
