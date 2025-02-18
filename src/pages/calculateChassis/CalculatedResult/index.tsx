import React, {useEffect, useState} from 'react';
import {
    Button,
    Collapse,
    Result,
    Table,
    TableColumnsType,
    Divider,
    Space,
    message,
    Descriptions,
    Typography,
    Modal
} from 'antd';
import {
    addCommasToNumber,
    convertCompanyTypeKoToNormal,
    getYetCalculatedCompanyList,
    mappedCompanyByValue
} from "../../../util";
import {getLabelOfChassisType} from "../../../util";
import axios from "axios";
import {calculateChassisCall, callEstimateInquiry} from "../../../definition/apiPath";
import { CalculateResult } from 'src/definition/interfaces';
import OverlayLoadingPage from "../../../component/Loading/OverlayLoadingPage";

// 재료비
interface MaterialDataType {
    key: React.Key;
    chassisType: string;
    standard: string;
    price: string | undefined;
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
    const [wholePrice, setWholePrice] = useState('');
    const [totalPrice, setTotalPrice] = useState('');
    const [firstCalculatedCompanyType, setFirstCalculatedCompanyType] = useState('');
    const [estimationId, setEstimationId] = useState();


    // 두 번째 결과 변수
    const [result2, setResult2] = useState<[]>();
    const [materialTableData2, setMaterialTableData2] = useState<MaterialDataType[]>([]);
    const [additionalTableData2, setAdditionalTableData2] = useState<AdditionalDataType[]>([]);
    const [surtax2, setSurtax2] = useState('');
    const [wholePrice2, setWholePrice2] = useState('');
    const [totalPrice2, setTotalPrice2] = useState('');
    const [estimationId2, setEstimationId2] = useState();

    const [secondCalculatedCompanyType, setSecondCalculatedCompanyType] = useState('');


    // 세 번째 결과 변수
    const [result3, setResult3] = useState<[]>();
    const [materialTableData3, setMaterialTableData3] = useState<MaterialDataType[]>([]);
    const [additionalTableData3, setAdditionalTableData3] = useState<AdditionalDataType[]>([]);
    const [surtax3, setSurtax3] = useState('');
    const [wholePrice3, setWholePrice3] = useState('');
    const [totalPrice3, setTotalPrice3] = useState('');
    const [estimationId3, setEstimationId3] = useState();

    const [thirdCalculatedCompanyType, setThirdCalculatedCompanyType] = useState('');

    let [calculatedCount, setCalculatedCount] = useState(0);


    // 추가 견적인지 판단하는 변수
    const [isReEstimation2, setIsReEstimation2] = useState(false);
    const [isReEstimation3, setIsReEstimation3] = useState(false);


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
            price: addCommasToNumber(item.price) || 'N/A'
        }));
        setMaterialTableData1(formattedData);

        // @ts-ignore
        let wholePrice = result['wholeCalculatedFee'];

        // @ts-ignore
        let surtax = result['surtax']; // 부가세

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
        setWholePrice(addCommasToNumber(wholePrice));

        // @ts-ignore
        setTotalPrice(addCommasToNumber(surtax + wholePrice));

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
                price: addCommasToNumber(item.price) || 'N/A'
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
            setWholePrice2(addCommasToNumber(result2["wholeCalculatedFee"]));
            // @ts-ignore
            setSurtax2(addCommasToNumber(result2["surtax"]));
            // @ts-ignore
            setTotalPrice2(addCommasToNumber(result2["wholeCalculatedFee"] + result2["surtax"]));
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
                price: addCommasToNumber(item.price) || 'N/A'
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
            setWholePrice3(addCommasToNumber(result3.wholeCalculatedFee));
            // @ts-ignore
            setSurtax3(addCommasToNumber(result3.surtax));
            // @ts-ignore
            setTotalPrice3(addCommasToNumber(result3["wholeCalculatedFee"] + result3["surtax"]));
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

    const handleInquiry = (estimationId: any) => {
        Modal.confirm({
            title: '견적 문의 확인',
            content: '해당 견적에 대한 문의를 진행하시겠습니까? 초기에 입력 하신 전화번호로 연락이 가도 괜찮으신가요?',
            okText: '확인',
            cancelText: '취소',
            onOk: () => {
                const callEstimateInquiryAPIRequest = callEstimateInquiry.replace('{estimationId}', estimationId);

                axios.get(callEstimateInquiryAPIRequest, {
                    withCredentials: true,
                    headers: {
                        Authorization: localStorage.getItem("hoppang-token"),
                    }
                }).then((res) => {
                    if (res.data === true) {
                        success("견적 문의가 성공적으로 접수되었습니다.");
                    }
                }).catch((err) => {
                    errorModal("견적 문의를 잠시 후 다시 시도해주세요.");
                });
            }
        });
    };


    return(
        <>
            {isLoading && <OverlayLoadingPage/>}

            {contextHolder}
            <div style={{ marginBottom: '10%' }}>
                <Result
                    status="success"
                    title={`견적 완료`}
                    subTitle="받아본 견적은 상황에 따라 추가 금액이 붙을 수 있습니다. 참고 하시기 바랍니다."
                    extra={[
                        <Button type="primary" key="console" onClick={onClickReCalculate}>
                            다시 견적 받기
                        </Button>,
                    ]}
                />

                <br/>

                <Collapse
                    size="large"
                    style={{ width: 700 }}
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
                                <Button
                                    type="primary"
                                    size="small"
                                    style={{ width: '30%' }}
                                    ghost
                                    onClick={() => handleInquiry(estimationId)}
                                >
                                    해당 견적 문의하기
                                </Button>
                                <Divider orientation="left">재료값</Divider>
                                <Table
                                    columns={materialColumns}
                                    dataSource={materialTableData1}
                                    size="middle"
                                    style={{width:600}}
                                    pagination={false}
                                />
                                <br/>

                                <Divider orientation="left">부가비용</Divider>
                                <Table
                                    columns={additionalColumns}
                                    dataSource={additionalTableData1}
                                    size="middle"
                                    style={{width:500}}
                                    footer={() => (
                                        <Descriptions bordered column={1} size="small">
                                            <Descriptions.Item label="총 비용">
                                                <Typography.Text strong>{wholePrice}</Typography.Text>
                                            </Descriptions.Item>
                                            <Descriptions.Item label="부가세">
                                                <Typography.Text type="warning">{surtax}</Typography.Text>
                                            </Descriptions.Item>
                                            <Descriptions.Item label="총 합계">
                                                <Typography.Text type="danger" strong>{totalPrice}</Typography.Text>
                                            </Descriptions.Item>
                                        </Descriptions>
                                    )}
                                    pagination={false}
                                />
                            </p>
                    }]}
                />

                <br/>

                <Space direction="horizontal" style={{ width:'100%' }}>
                    <Collapse
                        size={result2 ? "large" : "small"}
                        style={result2 ? { width: 700 } : { width: 580 }}
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
                                                {secondCalculatedCompanyType !== '' && (
                                                    <Button type="primary" size="small"
                                                            style={{ width: '30%' }} ghost
                                                            onClick={() => handleInquiry(estimationId2)}>
                                                        해당 견적 문의하기
                                                    </Button>
                                                )}
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
                                                                <Typography.Text strong>{wholePrice2}</Typography.Text>
                                                            </Descriptions.Item>
                                                            <Descriptions.Item label="부가세">
                                                                <Typography.Text type="warning">{surtax2}</Typography.Text>
                                                            </Descriptions.Item>
                                                            <Descriptions.Item label="총 합계">
                                                                <Typography.Text type="danger" strong>{totalPrice2}</Typography.Text>
                                                            </Descriptions.Item>
                                                        </Descriptions>
                                                    )}
                                                    pagination={false}
                                                />
                                            </div>}
                                    </p>
                            },
                        ]}
                    />
                    {!result2 &&
                    <Button style={{ width: 80 }} type="primary"
                            onClick={() => callCalculate(convertCompanyTypeKoToNormal(yetCalculatedCompanyList?.[0]), 2)}>
                        견적받기
                    </Button>}
                </Space>

                <br/>

                <Space direction="horizontal" style={{ width:'100%' }}>
                    <Collapse
                        size={result3 ? "large" : "small"}
                        style={result3 ? { width: 700, marginTop:'2%' } : { width: 580 }}
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
                                                {thirdCalculatedCompanyType !== '' && (
                                                    <Button type="primary" size="small"
                                                            style={{ width: '30%' }} ghost
                                                            onClick={() => handleInquiry(estimationId3)}>
                                                        해당 견적 문의하기
                                                    </Button>
                                                )}
                                                <Divider orientation="left">재료값</Divider>
                                                <Table
                                                    columns={materialColumns}
                                                    dataSource={materialTableData3}
                                                    size="middle"
                                                    style={{width: 600}}
                                                    pagination={false}
                                                />
                                                <br/>

                                                <Divider orientation="left">부가비용</Divider>
                                                <Table
                                                    columns={additionalColumns}
                                                    dataSource={additionalTableData3}
                                                    size="middle"
                                                    style={{width: 500}}
                                                    footer={() => (
                                                        <Descriptions bordered column={1} size="small">
                                                            <Descriptions.Item label="총 비용">
                                                                <Typography.Text strong>{wholePrice3}</Typography.Text>
                                                            </Descriptions.Item>
                                                            <Descriptions.Item label="부가세">
                                                                <Typography.Text type="warning">{surtax3}</Typography.Text>
                                                            </Descriptions.Item>
                                                            <Descriptions.Item label="총 합계">
                                                                <Typography.Text type="danger" strong>{totalPrice3}</Typography.Text>
                                                            </Descriptions.Item>
                                                        </Descriptions>
                                                    )}
                                                    pagination={false}
                                                />
                                            </div>}
                                    </p>
                            },
                        ]}
                    />
                    {!result3 &&
                        <Button style={{ width: 80 }} type="primary"
                                onClick={() => callCalculate(convertCompanyTypeKoToNormal(yetCalculatedCompanyList?.[1]), 3)}>
                            견적받기
                        </Button>
                    }
                </Space>
            </div>
        </>
    )
}

export default CalculatedResult;
