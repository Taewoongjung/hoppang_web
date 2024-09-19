import React, {useEffect, useState} from 'react';
import {Button, Collapse, Result, Table, TableColumnsType, Divider} from 'antd';
import {addCommasToNumber, getYetCalculatedCompanyList, mappedCompanyByValue} from "../../../util";
import {getLabelOfChassisType} from "../../../util";

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


const CalculatedResult = (props:{result:[]}) => {

    const { result = [] } = props; // 기본값으로 빈 배열 설정

    const [materialTableData1, setMaterialTableData1] = useState<MaterialDataType[]>([]);
    const [additionalTableData1, setAdditionalTableData1] = useState<AdditionalDataType[]>([]);
    const [wholePrice, setWholePrice] = useState('');

    let [calculatedCount, setCalculatedCount] = useState(0);
    const [firstCalculatedCompanyType, setFirstCalculatedCompanyType] = useState('');

    const onClickReCalculate = () => {
        window.location.reload();
    }

    useEffect(() => {

        if (calculatedCount === 0) {
            // @ts-ignore
            let company = result['company'];

            setFirstCalculatedCompanyType(company);
        }

        // 견적 받은 횟수 (첫 번째 견적 요청에만 setFirstCalculatedCompanyType 에 해당 브랜드 회사 정보 담기)
        setCalculatedCount(calculatedCount++);

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
            additionalPriceType: `사다리차비 ${customerFloor}`,
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

    const yetCalculatedCompanyList = getYetCalculatedCompanyList(firstCalculatedCompanyType);

    return(
        <>
            <div style={{}}>
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
                    style={{width:500}}
                    defaultActiveKey={['1']}
                    items={[{ key: '1',
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

                <Collapse
                    collapsible="disabled"
                    items={[
                        {
                            key: '1',
                            label: `${yetCalculatedCompanyList?.[0]}`,
                        },
                    ]}
                />

                <br/>

                <Collapse
                    collapsible="disabled"
                    items={[
                        {
                            key: '1',
                            label: `${yetCalculatedCompanyList?.[1]}`,
                        },
                    ]}
                />
            </div>
        </>
    )
}

export default CalculatedResult;
