import React, {useEffect, useState} from 'react';
import {
    Button,
    Collapse,
    Result,
    Table,
    TableColumnsType,
    Divider,
    message,
    Descriptions,
    Typography,
    Flex
} from 'antd';
import {
    addCommasToNumber,
    convertCompanyTypeKoToNormal,
    getYetCalculatedCompanyList,
    mappedCompanyByValue
} from "../../../util";
import {getLabelOfChassisType} from "../../../util";
import axios from "axios";
import {calculateChassisCall, callMeData} from "../../../definition/apiPath";
import { CalculateResult } from 'src/definition/interfaces';
import OverlayLoadingPage from "../../../component/Loading/OverlayLoadingPage";
import useSWR from "swr";
import fetcher from "../../../util/fetcher";
import {GoToTopButton} from "../../../util/renderUtil";
import InquiryEstimatedChassis from "../../../component/InquiryEstimatedChassis";

// 재료비
interface MaterialDataType {
    key: React.Key;
    chassisType: string;
    standard: string;
    price: React.ReactNode | undefined;
}

const materialColumns: TableColumnsType<MaterialDataType> = [
    {
        title: '창호 종류',
        dataIndex: 'chassisType',
    },
    {
        title: '규격',
        dataIndex: 'standard',
    },
    {
        title: '금액',
        dataIndex: 'price',
    },
];


// 부가비용
interface AdditionalDataType {
    key: React.Key;
    additionalPriceType: string;
    price: string | undefined;
}

const additionalColumns: TableColumnsType<AdditionalDataType> = [
    {
        title: '비용',
        dataIndex: 'additionalPriceType',
    },
    {
        title: '금액',
        dataIndex: 'price',
    },
];


const CalculatedResult = (props:{ result: [], requestCalculateObject: CalculateResult }) => {

    const [isLoading, setIsLoading] = useState(false);

    const [messageApi, contextHolder] = message.useMessage();

    const { result = [], requestCalculateObject } = props; // 기본값으로 빈 배열 설정

    // 첫 번째 결과 변수
    const [materialTableData1, setMaterialTableData1] = useState<MaterialDataType[]>([]);
    const [additionalTableData1, setAdditionalTableData1] = useState<AdditionalDataType[]>([]);
    const [surtax, setSurtax] = useState('');
    const [totalPrice, setTotalPrice] = useState('');
    const [totalPriceWithSurtax, setTotalPriceWithSurtax] = useState('');
    const [totalPriceDiscountedAmount, setTotalPriceDiscountedAmount] = useState('');
    const [discountedTotalPriceWithSurtax, setDiscountedTotalPriceWithSurtax] = useState('');
    const [firstCalculatedCompanyType, setFirstCalculatedCompanyType] = useState('');
    const [estimationId, setEstimationId] = useState();


    // 두 번째 결과 변수
    const [result2, setResult2] = useState<[]>();
    const [materialTableData2, setMaterialTableData2] = useState<MaterialDataType[]>([]);
    const [additionalTableData2, setAdditionalTableData2] = useState<AdditionalDataType[]>([]);
    const [surtax2, setSurtax2] = useState('');
    const [totalPrice2, setTotalPrice2] = useState('');
    const [totalPriceWithSurtax2, setTotalPriceWithSurtax2] = useState('');
    const [totalPriceDiscountedAmount2, setTotalPriceDiscountedAmount2] = useState('');
    const [discountedTotalPriceWithSurtax2, setDiscountedTotalPriceWithSurtax2] = useState('');
    const [estimationId2, setEstimationId2] = useState();

    const [secondCalculatedCompanyType, setSecondCalculatedCompanyType] = useState('');


    // 세 번째 결과 변수
    const [result3, setResult3] = useState<[]>();
    const [materialTableData3, setMaterialTableData3] = useState<MaterialDataType[]>([]);
    const [additionalTableData3, setAdditionalTableData3] = useState<AdditionalDataType[]>([]);
    const [surtax3, setSurtax3] = useState('');
    const [totalPrice3, setTotalPrice3] = useState('');
    const [totalPriceWithSurtax3, setTotalPriceWithSurtax3] = useState('');
    const [totalPriceDiscountedAmount3, setTotalPriceDiscountedAmount3] = useState('');
    const [discountedTotalPriceWithSurtax3, setDiscountedTotalPriceWithSurtax3] = useState('');
    const [estimationId3, setEstimationId3] = useState();

    const [thirdCalculatedCompanyType, setThirdCalculatedCompanyType] = useState('');

    let [calculatedCount, setCalculatedCount] = useState(0);


    // 추가 견적인지 판단하는 변수
    const [isReEstimation2, setIsReEstimation2] = useState(false);
    const [isReEstimation3, setIsReEstimation3] = useState(false);

    // 견적문의 관련 변수
    const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);


    const { data: userData, error, mutate } = useSWR(callMeData, fetcher, {
        dedupingInterval: 2000
    });


    const onClickReCalculate = () => {
        window.location.reload();
    }

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

    const getPrice = (item: any) => {
        if (item.discountedPrice) {
            return (
                <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
                    <span style={{fontSize: '12px', color: '#52c41a', fontWeight: 'bold'}}>
                        -{item.discountedRate}%
                    </span>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                        <span style={{textDecoration: 'line-through', color: 'gray'}}>
                            {addCommasToNumber(item.price)}
                        </span>
                            <span style={{margin: '0 5px'}}>→</span>
                            <span style={{fontWeight: 'bold', color: '#f5222d'}}>
                            {addCommasToNumber(item.discountedPrice)}
                        </span>
                        </div>
                </div>
            );
        }

        return (
            <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
                {addCommasToNumber(item.price) || 'N/A'}
            </div>
        );
    }

    // 최초 첫 번째 결과 렌더링
    useEffect(() => {

        // 견적 받은 횟수 (첫 번째 견적 요청에만 setFirstCalculatedCompanyType 에 해당 브랜드 회사 정보 담기)
        setCalculatedCount(calculatedCount++);

        // @ts-ignore
        setEstimationId(result["estimationId"]);

        if (calculatedCount === 1) {
            // @ts-ignore
            let company = result['company'];

            setFirstCalculatedCompanyType(company);
        }

        // @ts-ignore
        const formattedData = result['chassisPriceResultList'].map((item: any, index: number) => ({
            key: index,
            chassisType: getLabelOfChassisType(item.chassisType),
            standard: `${item.width} x ${item.height}` || 'N/A',
            price: getPrice(item)
        }));
        setMaterialTableData1(formattedData);

        // @ts-ignore
        let wholePrice = result['wholeCalculatedFee']; // 총 금액

        // @ts-ignore
        let surtax = result['surtax']; // 총 금액에 대한 부가세

        // @ts-ignore
        let discountedAmount = result['discountedWholeCalculatedFeeAmount']; // 할인 된 금액

        // @ts-ignore
        let discountedWholePriceWithSurtax = result['discountedWholeCalculatedFeeWithSurtax']; // 할인 된 총 금액

        // @ts-ignore
        let demolitionFee = result['demolitionFee']; // 철거비

        // @ts-ignore
        let maintenanceFee = result['maintenanceFee']; // 보양비

        // @ts-ignore
        let ladderFee = result['ladderFee']; // 사다리차비

        // @ts-ignore
        let freightTransportFee = result['freightTransportFee']; // 도수운반비

        // @ts-ignore
        let deliveryFee = result['deliveryFee']; // 배송비

        // @ts-ignore
        let customerFloor = result['customerFloor']; // 고객 층수

        const additionalDataTypes: AdditionalDataType[] = [];
        additionalDataTypes.push({
            key: 0,
            additionalPriceType: '철거비',
            price: addCommasToNumber(demolitionFee) || 'N/A'
        });
        additionalDataTypes.push({
            key: 1,
            additionalPriceType: `사다리차비 (${customerFloor} 층)`,
            price: addCommasToNumber(ladderFee) || 'N/A'
        });
        additionalDataTypes.push({
            key: 2,
            additionalPriceType: '보양비',
            price: addCommasToNumber(maintenanceFee) || 'N/A'
        });
        additionalDataTypes.push({
            key: 3,
            additionalPriceType: '기타비용',
            price: addCommasToNumber((deliveryFee + freightTransportFee)) || 'N/A'
        });

        setAdditionalTableData1(additionalDataTypes);

        // @ts-ignore
        setSurtax(addCommasToNumber(surtax));

        // @ts-ignore
        setTotalPrice(addCommasToNumber(wholePrice));

        // @ts-ignore
        setTotalPriceWithSurtax(addCommasToNumber(surtax + wholePrice));

        // @ts-ignore
        setTotalPriceDiscountedAmount(addCommasToNumber(discountedAmount));

        // @ts-ignore
        setDiscountedTotalPriceWithSurtax(addCommasToNumber(discountedWholePriceWithSurtax));
    }, [result]);


    // 두 번째 결과 렌더링
    useEffect(() => {

        if (!isReEstimation2) {
            return;
        }

        const updateState = () => {

            // @ts-ignore
            setEstimationId2(result2["estimationId"]);

            setCalculatedCount(prevCount => prevCount + 1);

            // @ts-ignore
            setSecondCalculatedCompanyType(result2["company"]);

            // @ts-ignore
            const formattedData = result2["chassisPriceResultList"].map((item, index) => ({
                key: index,
                chassisType: getLabelOfChassisType(item.chassisType),
                standard: `${item.width} x ${item.height}` || 'N/A',
                price: getPrice(item)
            }));

            const additionalDataTypes = [
                // @ts-ignore
                { key: 0, additionalPriceType: '철거비', price: addCommasToNumber(result2["demolitionFee"]) || 'N/A' },
                // @ts-ignore
                { key: 1, additionalPriceType: `사다리차비 (${result2["customerFloor"]} 층)`, price: addCommasToNumber(result2["ladderFee"]) || 'N/A' },
                // @ts-ignore
                { key: 2, additionalPriceType: '보양비', price: addCommasToNumber(result2["maintenanceFee"]) || 'N/A' },
                // @ts-ignore
                { key: 3, additionalPriceType: '기타비용', price: addCommasToNumber(result2["deliveryFee"] + result2["freightTransportFee"]) || 'N/A' }
            ];

            setMaterialTableData2(formattedData);

            setAdditionalTableData2(additionalDataTypes);

            // @ts-ignore
            setTotalPrice2(addCommasToNumber(result2["wholeCalculatedFee"]));

            // @ts-ignore
            setSurtax2(addCommasToNumber(result2["surtax"]));

            // @ts-ignore
            setTotalPriceDiscountedAmount2(addCommasToNumber(result2['discountedWholeCalculatedFeeAmount']));

            // @ts-ignore
            setDiscountedTotalPriceWithSurtax2(addCommasToNumber(result2['discountedWholeCalculatedFeeWithSurtax']));

            // @ts-ignore
            setTotalPriceWithSurtax2(addCommasToNumber(result2["wholeCalculatedFee"] + result2["surtax"]));

            setIsReEstimation2(false);
        };

        updateState();

    }, [result2, isReEstimation2]);


    // 세 번째 결과 렌더링
    useEffect(() => {

        if (!isReEstimation3) {
            return;
        }

        const updateState = () => {

            // @ts-ignore
            setEstimationId3(result3["estimationId"]);

            setCalculatedCount(prevCount => prevCount + 1);

            // @ts-ignore
            setThirdCalculatedCompanyType(result3.company);

            // @ts-ignore
            const formattedData = result3.chassisPriceResultList.map((item, index) => ({
                key: index,
                chassisType: getLabelOfChassisType(item.chassisType),
                standard: `${item.width} x ${item.height}` || 'N/A',
                price: getPrice(item)
            }));

            const additionalDataTypes = [
                // @ts-ignore
                { key: 0, additionalPriceType: '철거비', price: addCommasToNumber(result3.demolitionFee) || 'N/A' },
                // @ts-ignore
                { key: 1, additionalPriceType: `사다리차비 (${result3.customerFloor} 층)`, price: addCommasToNumber(result3.ladderFee) || 'N/A' },
                // @ts-ignore
                { key: 2, additionalPriceType: '보양비', price: addCommasToNumber(result3.maintenanceFee) || 'N/A' },
                // @ts-ignore
                { key: 3, additionalPriceType: '기타비용', price: addCommasToNumber(result3.deliveryFee + result3.freightTransportFee) || 'N/A' }
            ];

            setMaterialTableData3(formattedData);

            setAdditionalTableData3(additionalDataTypes);

            // @ts-ignore
            setTotalPrice3(addCommasToNumber(result3.wholeCalculatedFee));

            // @ts-ignore
            setSurtax3(addCommasToNumber(result3.surtax));

            // @ts-ignore
            console.log("? = ", result3['discountedWholeCalculatedFeeAmount']);
            // @ts-ignore
            setTotalPriceDiscountedAmount3(addCommasToNumber(result3['discountedWholeCalculatedFeeAmount']));

            // @ts-ignore
            setDiscountedTotalPriceWithSurtax3(addCommasToNumber(result3['discountedWholeCalculatedFeeWithSurtax']));

            // @ts-ignore
            setTotalPriceWithSurtax3(addCommasToNumber(result3["wholeCalculatedFee"] + result3["surtax"]));

            setIsReEstimation3(false);
        };

        updateState();

    }, [result3, isReEstimation3]);


    const yetCalculatedCompanyList = getYetCalculatedCompanyList(firstCalculatedCompanyType);

    const callCalculate = (companyType : string | undefined, additionalEstimationNumber: number) => {

        setIsLoading(true);

        requestCalculateObject.reqCalculateChassisPriceList = requestCalculateObject.reqCalculateChassisPriceList.map(item => ({
            ...item,
            companyType: companyType
        }));

        axios.post(calculateChassisCall,
            {
                zipCode: requestCalculateObject.zipCode,
                state: requestCalculateObject.sido,
                city: requestCalculateObject.siGunGu,
                town: requestCalculateObject.yupMyeonDong,
                bCode: requestCalculateObject.bCode,
                remainAddress: requestCalculateObject.remainAddress,
                buildingNumber: requestCalculateObject.buildingNumber,
                isApartment: requestCalculateObject.isApartment,
                isExpanded: requestCalculateObject.isExpanded,
                reqCalculateChassisPriceList: requestCalculateObject.reqCalculateChassisPriceList
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

                if (additionalEstimationNumber === 2) {
                    setResult2(response.data);
                    setIsReEstimation2(true);
                }

                if (additionalEstimationNumber === 3) {
                    setResult3(response.data);
                    setIsReEstimation3(true);
                }

                // 로딩 화면 제거
                setTimeout(() => {
                    setIsLoading(false);
                }, 1530);

            })
            .catch((error) => {
                if (error.response.data.errorCode === 202) {
                    errorModal(error.response.data.message);
                    setIsLoading(false);
                }
            });
    }

    const getTotalPriceWithSurtax = (
        totalPriceWithSurtax: any,
        totalPriceDiscountedAmount: any,
        discountedTotalPriceWithSurtax: any
    ) => {
        console.log("?? = ", discountedTotalPriceWithSurtax);

        return (
            <>
                {discountedTotalPriceWithSurtax || discountedTotalPriceWithSurtax !== undefined ?
                    <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
                        <span style={{fontSize: '12px', color: '#52c41a', fontWeight: 'bold'}}>
                            -{totalPriceDiscountedAmount}원 할인
                        </span>
                        <div style={{display: 'flex', alignItems: 'center'}}>
                            <span style={{textDecoration: 'line-through', color: 'gray'}}>
                                {addCommasToNumber(totalPriceWithSurtax)}
                            </span>

                            <span style={{margin: '0 5px', color: '#52c41a'}}>→</span>

                            <span style={{fontWeight: 'bold', color: '#f5222d'}}>
                                {addCommasToNumber(discountedTotalPriceWithSurtax)}
                            </span>
                        </div>
                    </div>
                    :
                    addCommasToNumber(totalPriceWithSurtax)
                }
            </>
        );
    };


    return(
        <>
            {isLoading && <OverlayLoadingPage word={"처리중"}/>}

            {contextHolder}
            <div style={{ marginBottom: '10%' }}>
                <Result
                    status="success"
                    title={`견적 완료`}
                    subTitle={
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '100%',
                                textAlign: 'center',
                                boxSizing: 'border-box',
                                padding: '10px 0'
                            }}
                        >
                            <div style={{
                                maxWidth: window.innerWidth > 768 ? '100%' : '50%',
                            }}>
                                받아본 견적은 상황에 따라 추가 금액이 붙을 수 있습니다. 참고 하시기 바랍니다.
                            </div>
                        </div>
                    }
                    extra={[
                        <Button
                            type="primary"
                            key="console"
                            onClick={onClickReCalculate}
                            style={styles.button}
                        >
                            다시 견적 받기
                        </Button>,
                    ]}
                />

                <br/>

                <Flex
                    style={{
                        width: '100%',
                        justifyContent: 'center',
                        flexDirection: 'row', // 항상 가로 정렬 유지
                    }}
                >
                    <div style={{
                        flexBasis: '80%',  // 기본 크기를 60%로 설정
                        maxWidth: '100%',
                        minWidth: '300px',
                        display: 'flex',
                        transition: 'max-width 0.3s ease' // 애니메이션 효과 추가
                    }}>
                        <Collapse
                            size="large"
                            style={{
                                width: window.innerWidth > 768 ? '100%' : '55%',
                                maxWidth: '95vw', // 화면 넘침 방지
                                margin: 'auto'
                            }}
                            defaultActiveKey={['1']}
                            items={[{
                                key: '1',
                                label: (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>{`${mappedCompanyByValue(firstCalculatedCompanyType)} - 📋 ${estimationId} (견적번호)`}</span>
                                    </div>
                                ),
                                children:
                                    <p>
                                        <Divider orientation="left">재료값</Divider>
                                        <Table
                                            columns={materialColumns}
                                            dataSource={materialTableData1}
                                            size="middle"
                                            style={{width: 600}}
                                            pagination={false}
                                        />
                                        <br/>

                                        <Divider orientation="left">부가비용</Divider>
                                        <Table
                                            columns={additionalColumns}
                                            dataSource={additionalTableData1}
                                            size="middle"
                                            style={{width: 500}}
                                            footer={() => (
                                                <Descriptions bordered column={1} size="small">
                                                    <Descriptions.Item label="총 비용">
                                                        <Typography.Text strong>{totalPrice}</Typography.Text>
                                                    </Descriptions.Item>
                                                    <Descriptions.Item label="부가세">
                                                        <Typography.Text type="warning">{surtax}</Typography.Text>
                                                    </Descriptions.Item>
                                                    <Descriptions.Item label="총 합계">
                                                        <Typography.Text type="danger" strong>
                                                            {
                                                                getTotalPriceWithSurtax(
                                                                    totalPriceWithSurtax,
                                                                    totalPriceDiscountedAmount,
                                                                    discountedTotalPriceWithSurtax
                                                                )
                                                            }
                                                        </Typography.Text>
                                                    </Descriptions.Item>
                                                </Descriptions>
                                            )}
                                            pagination={false}
                                        />

                                        <Button
                                            type="primary"
                                            size="small"
                                            style={{width: '100%', maxWidth: '200px', marginBottom: '10px'}}
                                            ghost
                                            onClick={() => setIsInquiryModalOpen(true)}
                                        >
                                            해당 견적 문의하기
                                        </Button>

                                        <InquiryEstimatedChassis
                                            estimationId={estimationId}
                                            isInquiryModalOpen={isInquiryModalOpen}
                                            setIsInquiryModalOpen={setIsInquiryModalOpen}
                                        />
                                    </p>
                            }]}
                        />
                    </div>
                </Flex>

                <br/>

                <Flex
                    style={{
                        width: '100%',
                        justifyContent: 'center',
                        flexDirection: 'row', // 항상 가로 정렬 유지
                    }}
                >
                    <div style={{
                        flexBasis: '80%',  // 기본 크기를 60%로 설정
                        maxWidth: result2 ? '100%' : 'calc(80vw - 10px)',  // 화면 너비의 60%를 기준으로 설정 (10px은 gap 고려)
                        minWidth: '300px',
                        display: 'flex',
                        transition: 'max-width 0.3s ease' // 애니메이션 효과 추가
                    }}>
                        <Collapse
                            size={result2 ? "large" : "small"}
                            style={{
                                width: window.innerWidth > 768 ? '100%' : '55%',
                                maxWidth: '95vw', // 화면 넘침 방지
                                margin: 'auto'
                            }}
                            activeKey={result2 ? ['2'] : 'null'}
                            collapsible={result2 ? "header" : "disabled"}
                            items={[
                                {
                                    key: '2',
                                    label: (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span>
                                                {secondCalculatedCompanyType !== ''
                                                    ? `${mappedCompanyByValue(secondCalculatedCompanyType)} - 📋 ${estimationId2} (견적번호)`
                                                    : `${yetCalculatedCompanyList?.[0]}`
                                                }
                                            </span>
                                        </div>
                                    ),
                                    children:
                                        <p>
                                            {result2 &&
                                                <div>
                                                    <Divider orientation="left">재료값</Divider>
                                                    <Table
                                                        columns={materialColumns}
                                                        dataSource={materialTableData2}
                                                        size="middle"
                                                        style={{width: 600}}
                                                        pagination={false}
                                                    />
                                                    <br/>

                                                    <Divider orientation="left">부가비용</Divider>
                                                    <Table
                                                        columns={additionalColumns}
                                                        dataSource={additionalTableData2}
                                                        size="middle"
                                                        style={{width: 500}}
                                                        footer={() => (
                                                            <Descriptions bordered column={1} size="small">
                                                                <Descriptions.Item label="총 비용">
                                                                    <Typography.Text strong>{totalPrice2}</Typography.Text>
                                                                </Descriptions.Item>
                                                                <Descriptions.Item label="부가세">
                                                                    <Typography.Text type="warning">{surtax2}</Typography.Text>
                                                                </Descriptions.Item>
                                                                <Descriptions.Item label="총 합계">
                                                                    <Typography.Text type="danger" strong>
                                                                        {
                                                                            getTotalPriceWithSurtax(
                                                                                totalPriceWithSurtax2,
                                                                                totalPriceDiscountedAmount2,
                                                                                discountedTotalPriceWithSurtax2
                                                                            )
                                                                        }
                                                                    </Typography.Text>
                                                                </Descriptions.Item>
                                                            </Descriptions>
                                                        )}
                                                        pagination={false}
                                                    />

                                                    {secondCalculatedCompanyType !== '' && (
                                                        <>
                                                            <Button type="primary" size="small"
                                                                    style={{ width: '100%', maxWidth: '200px', marginBottom: '10px' }}
                                                                    ghost
                                                                    onClick={() => setIsInquiryModalOpen(true)}
                                                            >
                                                                해당 견적 문의하기
                                                            </Button>

                                                            <InquiryEstimatedChassis
                                                                estimationId={estimationId2}
                                                                isInquiryModalOpen={isInquiryModalOpen}
                                                                setIsInquiryModalOpen={setIsInquiryModalOpen}
                                                            />
                                                        </>
                                                    )}
                                                </div>
                                            }
                                        </p>
                                },
                            ]}
                        />
                        {!result2 &&
                            <div style={{
                                flex: 2,
                                flexBasis: '20%',  // 기본 크기를 40%로 설정
                                maxWidth: 'calc(10vw - 10px)',  // 화면 너비의 40%를 기준으로 설정
                                minWidth: '100px',
                                transition: 'max-width 0.3s ease',
                                minHeight: '80px'
                            }}>
                                <Button
                                    size="small"
                                    style={{
                                        width: '100%',
                                        maxWidth: '150px',
                                        minWidth: '100px',
                                        fontSize: '14px'
                                    }}
                                    type="primary"
                                    onClick={() => callCalculate(convertCompanyTypeKoToNormal(yetCalculatedCompanyList?.[0]), 2)}
                                >
                                    견적받기
                                </Button>
                            </div>
                        }
                    </div>
                </Flex>

                <br/>

                <Flex
                    style={{
                        width: '100%',
                        justifyContent: 'center',
                        flexDirection: 'row', // 항상 가로 정렬 유지
                    }}
                >
                    {/* Collapse 컨테이너 */}
                    <div style={{
                        flexBasis: '80%',  // 기본 크기를 60%로 설정
                        maxWidth: result3 ? '100%' : 'calc(80vw - 10px)',  // 화면 너비의 60%를 기준으로 설정 (10px은 gap 고려)
                        minWidth: '300px',
                        display: 'flex',
                        transition: 'max-width 0.3s ease' // 애니메이션 효과 추가
                    }}>
                        <Collapse
                            size={result3 ? "large" : "small"}
                            style={{
                                width: window.innerWidth > 768 ? '100%' : '55%',
                                maxWidth: '95vw', // 화면 넘침 방지
                                margin: 'auto'
                            }}
                            activeKey={result3 ? ['3'] : 'null'}
                            collapsible={result3 ? "header" : "disabled"}
                            items={[
                                {
                                    key: '3',
                                    label: (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>
                                {thirdCalculatedCompanyType !== ''
                                    ? `${mappedCompanyByValue(thirdCalculatedCompanyType)} - 📋 ${estimationId3} (견적번호)`
                                    : `${yetCalculatedCompanyList?.[1]}`
                                }
                            </span>
                                        </div>
                                    ),
                                    children:
                                        <p>
                                            {result3 &&
                                                <div>
                                                    <Divider orientation="left">재료값</Divider>
                                                    <Table
                                                        columns={materialColumns}
                                                        dataSource={materialTableData3}
                                                        size="middle"
                                                        style={{width: '100%'}}
                                                        pagination={false}
                                                    />
                                                    <br/>

                                                    <Divider orientation="left">부가비용</Divider>
                                                    <Table
                                                        columns={additionalColumns}
                                                        dataSource={additionalTableData3}
                                                        size="middle"
                                                        style={{width: '100%'}}
                                                        footer={() => (
                                                            <Descriptions bordered column={1} size="small">
                                                                <Descriptions.Item label="총 비용">
                                                                    <Typography.Text strong>{totalPrice3}</Typography.Text>
                                                                </Descriptions.Item>
                                                                <Descriptions.Item label="부가세">
                                                                    <Typography.Text type="warning">{surtax3}</Typography.Text>
                                                                </Descriptions.Item>
                                                                <Descriptions.Item label="총 합계">
                                                                    <Typography.Text type="danger" strong>
                                                                        {
                                                                            getTotalPriceWithSurtax(
                                                                                totalPriceWithSurtax3,
                                                                                totalPriceDiscountedAmount3,
                                                                                discountedTotalPriceWithSurtax3
                                                                            )
                                                                        }
                                                                    </Typography.Text>
                                                                </Descriptions.Item>
                                                            </Descriptions>
                                                        )}
                                                        pagination={false}
                                                    />

                                                    {thirdCalculatedCompanyType !== '' && (
                                                        <>
                                                            <Button type="primary" size="small"
                                                                    style={{ width: '100%', maxWidth: '200px', marginBottom: '10px' }}
                                                                    ghost
                                                                    onClick={() => setIsInquiryModalOpen(true)}
                                                            >
                                                                해당 견적 문의하기
                                                            </Button>

                                                            <InquiryEstimatedChassis
                                                                estimationId={estimationId3}
                                                                isInquiryModalOpen={isInquiryModalOpen}
                                                                setIsInquiryModalOpen={setIsInquiryModalOpen}
                                                            />
                                                        </>
                                                    )}
                                                </div>
                                            }
                                        </p>
                                },
                            ]}
                        />
                        {!result3 && (
                            <div style={{
                                flex: 2,
                                flexBasis: '20%',  // 기본 크기를 40%로 설정
                                maxWidth: 'calc(10vw - 10px)',  // 화면 너비의 40%를 기준으로 설정
                                minWidth: '100px',
                                transition: 'max-width 0.3s ease',
                                minHeight: '80px'
                            }}>
                                <Button
                                    size="small"
                                    style={{
                                        width: '100%',
                                        maxWidth: '150px',
                                        minWidth: '100px',
                                        fontSize: '14px',
                                    }}
                                    type="primary"
                                    onClick={() => callCalculate(convertCompanyTypeKoToNormal(yetCalculatedCompanyList?.[1]), 3)}
                                >
                                    견적받기
                                </Button>
                            </div>
                        )}
                    </div>
                </Flex>
            </div>

            <GoToTopButton/>
        </>
    )
}

const styles: { [key: string]: React.CSSProperties } = {
    button: {
        width: window.innerWidth > 768 ? '90%' : '40%',
        maxWidth: '400px',
        minWidth: '150px',
        padding: '10px 0',
        fontSize: '16px'
    },
    collapse: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: window.innerWidth > 768 ? '80%' : '100%',  // 화면 크기에 따라 너비 조정
        textAlign: 'center',
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


export default CalculatedResult;
