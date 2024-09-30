import React, {useEffect, useState} from 'react';
import {Button, Collapse, Result, Table, TableColumnsType, Divider, Space, message} from 'antd';
import {
    addCommasToNumber,
    convertCompanyTypeKoToNormal,
    getYetCalculatedCompanyList,
    mappedCompanyByValue
} from "../../../util";
import {getLabelOfChassisType} from "../../../util";
import axios from "axios";
import {calculateChassisCall} from "../../../definition/apiPath";
import { CalculateResult } from 'src/definition/interfaces';

// 재료비
interface MaterialDataType {
    key: React.Key;
    chassisType: string;
    standard: string;
    price: string | undefined;
}

const materialColumns: TableColumnsType<MaterialDataType> = [
    {
        title: '샤시 종류',
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

    const [messageApi, contextHolder] = message.useMessage();

    const { result = [], requestCalculateObject } = props; // 기본값으로 빈 배열 설정

    const [result2, setResult2] = useState<[]>();

    let [calculatedCount, setCalculatedCount] = useState(0);

    const [isReEstimation, setIsReEstimation] = useState(false);

    // 첫 번째 결과
    const [materialTableData1, setMaterialTableData1] = useState<MaterialDataType[]>([]);
    const [additionalTableData1, setAdditionalTableData1] = useState<AdditionalDataType[]>([]);

    const [wholePrice, setWholePrice] = useState('');
    const [firstCalculatedCompanyType, setFirstCalculatedCompanyType] = useState('');

    // 두 번째 결과
    const [materialTableData2, setMaterialTableData2] = useState<MaterialDataType[]>([]);
    const [additionalTableData2, setAdditionalTableData2] = useState<AdditionalDataType[]>([]);
    const [wholePrice2, setWholePrice2] = useState('');

    const [secondCalculatedCompanyType, setSecondCalculatedCompanyType] = useState('');

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
        let demolitionFee = result['demolitionFee']; // 철거비

        // @ts-ignore
        let maintenanceFee = result['maintenanceFee']; // 보양비

        // @ts-ignore
        let ladderFee = result['ladderFee']; // 사다리차비

        // @ts-ignore
        let freightTransportFee = result['freightTransportFee']; // 도수운반비

        // @ts-ignore
        let laborFee = result['laborFee']; // 인건비

        // @ts-ignore
        let deliveryFee = result['deliveryFee']; // 배송비

        // @ts-ignore
        let customerFloor = result['customerFloor']; // 고객 층수

        const additionalDataTypes: AdditionalDataType[] = [];
        additionalDataTypes.push({
            key: 0,
            additionalPriceType: '인건비',
            price: addCommasToNumber(laborFee) || 'N/A'
        });
        additionalDataTypes.push({
            key: 1,
            additionalPriceType: '철거비',
            price: addCommasToNumber(demolitionFee) || 'N/A'
        });
        additionalDataTypes.push({
            key: 2,
            additionalPriceType: `사다리차비 (${customerFloor} 층)`,
            price: addCommasToNumber(ladderFee) || 'N/A'
        });
        additionalDataTypes.push({
            key: 3,
            additionalPriceType: '보양비',
            price: addCommasToNumber(maintenanceFee) || 'N/A'
        });
        additionalDataTypes.push({
            key: 4,
            additionalPriceType: '기타비용',
            price: addCommasToNumber((deliveryFee + freightTransportFee)) || 'N/A'
        });

        setAdditionalTableData1(additionalDataTypes);


        // @ts-ignore
        setWholePrice(addCommasToNumber(wholePrice));

    }, [result]);

    // 두 번째 결과 렌더링
    useEffect(() => {

        if (!isReEstimation) {
            return;
        }

        // 견적 받은 횟수 (첫 번째 견적 요청에만 setFirstCalculatedCompanyType 에 해당 브랜드 회사 정보 담기)
        setCalculatedCount(calculatedCount++);

        // @ts-ignore
        setSecondCalculatedCompanyType(result2['company']);

        // @ts-ignore
        const formattedData = result2['chassisPriceResultList'].map((item: any, index: number) => ({
            key: index,
            chassisType: getLabelOfChassisType(item.chassisType),
            standard: `${item.width} x ${item.height}` || 'N/A',
            price: addCommasToNumber(item.price) || 'N/A'
        }));
        setMaterialTableData2(formattedData);

        // @ts-ignore
        let wholePrice = result2['wholeCalculatedFee'];

        // @ts-ignore
        let demolitionFee = result2['demolitionFee']; // 철거비

        // @ts-ignore
        let maintenanceFee = result2['maintenanceFee']; // 보양비

        // @ts-ignore
        let ladderFee = result2['ladderFee']; // 사다리차비

        // @ts-ignore
        let freightTransportFee = result2['freightTransportFee']; // 도수운반비

        // @ts-ignore
        let laborFee = result2['laborFee']; // 인건비

        // @ts-ignore
        let deliveryFee = result2['deliveryFee']; // 배송비

        // @ts-ignore
        let customerFloor = result2['customerFloor']; // 고객 층수

        const additionalDataTypes: AdditionalDataType[] = [];
        additionalDataTypes.push({
            key: 0,
            additionalPriceType: '인건비',
            price: addCommasToNumber(laborFee) || 'N/A'
        });
        additionalDataTypes.push({
            key: 1,
            additionalPriceType: '철거비',
            price: addCommasToNumber(demolitionFee) || 'N/A'
        });
        additionalDataTypes.push({
            key: 2,
            additionalPriceType: `사다리차비 (${customerFloor} 층)`,
            price: addCommasToNumber(ladderFee) || 'N/A'
        });
        additionalDataTypes.push({
            key: 3,
            additionalPriceType: '보양비',
            price: addCommasToNumber(maintenanceFee) || 'N/A'
        });
        additionalDataTypes.push({
            key: 4,
            additionalPriceType: '기타비용',
            price: addCommasToNumber((deliveryFee + freightTransportFee)) || 'N/A'
        });

        setAdditionalTableData2(additionalDataTypes);


        // @ts-ignore
        setWholePrice2(addCommasToNumber(wholePrice));

    }, [result2, isReEstimation]);


    const yetCalculatedCompanyList = getYetCalculatedCompanyList(firstCalculatedCompanyType);

    const callCalculate = (companyType : string | undefined) => {

        requestCalculateObject.reqCalculateChassisPriceList = requestCalculateObject.reqCalculateChassisPriceList.map(item => ({
            ...item,
            companyType: companyType
        }));
        success("견적 시작");
        axios.post(calculateChassisCall,
            {
                zipCode: requestCalculateObject.zipCode,
                address: requestCalculateObject.address,
                subAddress: requestCalculateObject.subAddress,
                buildingNumber: requestCalculateObject.buildingNumber,
                reqCalculateChassisPriceList: requestCalculateObject.reqCalculateChassisPriceList
            },
            {withCredentials: true},
        )
            .then((response) => {
                success("견적 성공");
                setIsReEstimation(true);
                setResult2(response.data);
            })
            .catch((error) => {
                if (error.response.data.errorCode === 202) {
                    errorModal(error.response.data.message);
                }
            });
    }


    return(
        <>
            {contextHolder}
            <div>
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
                    style={{ width:500 }}
                    defaultActiveKey={['1']}
                    items={[{
                        key: '1',
                        label: `${mappedCompanyByValue(firstCalculatedCompanyType)}`,
                        children:
                            <p>
                                <Divider orientation="left">재료값</Divider>
                                <Table
                                    columns={materialColumns}
                                    dataSource={materialTableData1}
                                    size="middle"
                                    style={{width:500}}
                                    pagination={false}
                                />
                                <br/>

                                <Divider orientation="left">부가비용</Divider>
                                <Table
                                    columns={additionalColumns}
                                    dataSource={additionalTableData1}
                                    size="middle"
                                    style={{width:500}}
                                    footer={() => `총 금액: ${wholePrice}`}
                                    pagination={false}
                                />
                            </p>
                    }]}
                />

                <br/>

                <Space direction="horizontal" style={{ width:'100%' }}>
                    <Collapse
                        size={result2 ? "large" : "small"}
                        style={result2 ? { width: 500 } : { width: 400 }}
                        collapsible={result2 ? "header" : "disabled"}
                        items={[
                            {
                                key: '2',
                                label: `${yetCalculatedCompanyList?.[0]}`,
                                children:
                                    <p>
                                        {result2 &&
                                            <div>
                                        <Divider orientation="left">재료값</Divider>
                                        <Table
                                            columns={materialColumns}
                                            dataSource={materialTableData2}
                                            size="middle"
                                            style={{width: 500}}
                                            pagination={false}
                                        />
                                        <br/>

                                        <Divider orientation="left">부가비용</Divider>
                                        <Table
                                            columns={additionalColumns}
                                            dataSource={additionalTableData2}
                                            size="middle"
                                            style={{width: 500}}
                                            footer={() => `총 금액: ${wholePrice2}`}
                                            pagination={false}
                                        />
                                            </div>}
                                    </p>
                            },
                        ]}
                    />
                    {!result2 &&
                    <Button style={{ width: 100 }} type="primary"
                            onClick={() => callCalculate(convertCompanyTypeKoToNormal(yetCalculatedCompanyList?.[0]))}>
                        견적받기
                    </Button>}
                </Space>

                <br/>

                <Space>
                    <Collapse
                        size={calculatedCount < 3 ? "small" : "large"}
                        style={{ width: 400, marginTop: '4%' }}
                        collapsible={calculatedCount < 3 ? "disabled" : "header"}
                        items={[
                            {
                                key: '3',
                                label: `${yetCalculatedCompanyList?.[1]}`,
                                children:
                                    <p>

                                    </p>
                            },
                        ]}
                    />
                    <Button style={{ width: 100 }} type="primary"
                            onClick={() => callCalculate(convertCompanyTypeKoToNormal(yetCalculatedCompanyList?.[1]))}>
                        견적받기
                    </Button>
                </Space>
            </div>
        </>
    )
}

export default CalculatedResult;
