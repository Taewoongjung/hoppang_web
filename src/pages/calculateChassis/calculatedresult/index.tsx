import React, {useEffect, useState} from 'react';
import {Button, Result, Table, TableColumnsType} from 'antd';
import {addCommasToNumber} from "../../../util/adminUtil";
import {getLabelOfChassisType} from "../../../util/util";

interface DataType {
    key: React.Key;
    chassisType: string;
    standard: string;
    price: string | undefined;
}

const columns: TableColumnsType<DataType> = [
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

const CalculatedResult = (props:{result:[]}) => {

    const { result = [] } = props; // 기본값으로 빈 배열 설정

    const [tableData, setTableData] = useState<DataType[]>([]);
    const [wholePrice, setWholePrice] = useState('');

    const onClickReCalculate = () => {
        window.location.reload();
    }

    useEffect(() => {

        // @ts-ignore
        let chassisType = result['chassisType'] || 'N/A';

        // @ts-ignore
        const formattedData = result['chassisPriceResultList'].map((item: any, index: number) => ({
            key: index,
            chassisType: getLabelOfChassisType(chassisType),
            standard: `${item.width} x ${item.height}` || 'N/A',
            price: addCommasToNumber(item.price) || 'N/A'
        }));
        setTableData(formattedData);

        // @ts-ignore
        let wholePrice = result['wholeCalculatedFee'];

        // @ts-ignore
        setWholePrice(addCommasToNumber(wholePrice));

    }, [result]);

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
                <Table
                    columns={columns}
                    dataSource={tableData}
                    size="middle"
                    style={{width:1000}}
                    footer={() => `총 금액: ${wholePrice}`}
                    pagination={false}
                />
            </div>
        </>
    )
}

export default CalculatedResult;
