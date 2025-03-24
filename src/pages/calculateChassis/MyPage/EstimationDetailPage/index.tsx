import React, {useEffect, useState} from 'react';
import axios from "axios";
import {callEstimationById} from "../../../../definition/apiPath";
import {useParams} from "react-router-dom";
import {Button, Descriptions, Divider, Table, TableColumnsType, Typography} from "antd";
import { addCommasToNumber } from 'src/util';
import {LeftOutlined} from "@ant-design/icons";
import InquiryEstimatedChassis from "../../../../component/InquiryEstimatedChassis";

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


const EstimationDetailPage = () => {

    const { estimationId } = useParams();

    const [materialTableData, setMaterialTableData] = useState<MaterialDataType[]>([]);
    const [additionalTableData, setAdditionalTableData] = useState<AdditionalDataType[]>([]);
    const [surtax, setSurtax] = useState('');
    const [wholePrice, setWholePrice] = useState('');
    const [totalPrice, setTotalPrice] = useState('');
    const [calculatedCompanyType, setCalculatedCompanyType] = useState('');
    const [estimatedAt, setEstimatedAt] = useState();
    const [totalPriceWithSurtax, setTotalPriceWithSurtax] = useState('');
    const [totalPriceDiscountedAmount, setTotalPriceDiscountedAmount] = useState('');
    const [discountedTotalPriceWithSurtax, setDiscountedTotalPriceWithSurtax] = useState('');


    useEffect(() => {

        if(!estimationId) return;

        axios.get(callEstimationById.replace("{estimationId}", estimationId), {
            withCredentials: true,
            headers: {
                Authorization: localStorage.getItem("hoppang-token"),
            }
        }).then((res) => {

            const result = res.data;

            setEstimatedAt(result.createdAt);

            const formattedData = result.chassisPriceResultList.map((item: any, index: number) => ({
                key: index,
                chassisType: item.chassisType,
                standard: `${item.width} x ${item.height}` || 'N/A',
                price: addCommasToNumber(item.price) || 'N/A'
            }));
            setMaterialTableData(formattedData);

            setCalculatedCompanyType(result.company);

            let wholePrice = result.wholeCalculatedFee;

            let surtax = result.surtax; // 부가세

            let demolitionFee = result.demolitionFee; // 철거비

            let maintenanceFee = result.maintenanceFee; // 보양비

            let ladderFee = result.ladderFee; // 사다리차비

            let freightTransportFee = result.freightTransportFee; // 도수운반비

            let deliveryFee = result.deliveryFee; // 배송비

            let customerFloor = result.customerFloor; // 고객 층수

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

            setAdditionalTableData(additionalDataTypes);

            // @ts-ignore
            setSurtax(addCommasToNumber(surtax));

            // @ts-ignore
            setWholePrice(addCommasToNumber(wholePrice));

            // @ts-ignore
            setTotalPrice(addCommasToNumber(surtax + wholePrice)); // setTotalPriceWithSurtax

            // @ts-ignore
            setTotalPriceDiscountedAmount(addCommasToNumber(result.discountedAmount));

            // @ts-ignore
            setDiscountedTotalPriceWithSurtax(addCommasToNumber(result.discountedWholeCalculatedFeeWithSurtax));

        }).catch((err) => {
            console.error(err);
        })
    }, [estimationId]);


    const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

    const getTotalPriceWithSurtax = (
        totalPriceWithSurtax: any,
        totalPriceDiscountedAmount: any,
        discountedTotalPriceWithSurtax: any
    ) => {

        return (
            <>
                {discountedTotalPriceWithSurtax && totalPriceDiscountedAmount !== undefined ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <span style={{ textDecoration: 'line-through', color: 'gray', fontSize: 13 }}>
                            {addCommasToNumber(totalPriceWithSurtax)}
                        </span>
                        <span style={{ color: '#52c41a', fontSize: 13 }}>
                            (-{totalPriceDiscountedAmount}원)
                        </span>
                        <span style={{ fontWeight: 'bold', color: '#f5222d' }}>
                            {addCommasToNumber(discountedTotalPriceWithSurtax)}
                        </span>
                    </div>
                ) : (
                    addCommasToNumber(totalPriceWithSurtax)
                )}
            </>
        );
    };


    return (
        <>
            <div
                onContextMenu={(e) => e.preventDefault()}
                onTouchStart={(e) => (e.currentTarget.dataset.touchStartTime = String(e.timeStamp))}
                onTouchEnd={(e) => {
                    const start = parseFloat(e.currentTarget.dataset.touchStartTime || '0');
                    if (e.timeStamp - start > 500) e.preventDefault();
                }}
                data-touch-start-time="0"
            >
                <header
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        position: 'relative',
                        height: 'auto',
                        width: '100%',
                        maxWidth: '600px',
                        margin: '0 auto',
                        padding: '10px 0',
                        borderBottom: '1px solid #ddd',
                        marginBottom: '8%'
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            maxWidth: '600px',
                            padding: '0 10px'
                        }}
                    >
                        <button
                            style={{
                                fontSize: '18px',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#333',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                            onClick={() => {
                                window.location.href = '/mypage/estimation/histories';
                            }}>
                            <LeftOutlined style={{ fontSize: '20px', marginRight: '5px' }} />
                        </button>
                    </div>

                    <div
                        style={{
                            textAlign: 'center',
                            marginTop: '10px'
                        }}
                    >
                        <Typography.Title level={5} style={{ margin: 0 }}>
                            {calculatedCompanyType} - 📋 {estimationId} (견적번호)
                        </Typography.Title>
                        <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                            견적일: {estimatedAt}
                        </Typography.Text>
                    </div>
                </header>

                <Divider orientation="center" style={{maxWidth: '600px', margin: '0 auto'}}>창호</Divider>
                <Table
                    columns={materialColumns}
                    dataSource={materialTableData}
                    size="middle"
                    style={{
                        width: '100%',
                        maxWidth: '600px',
                        margin: '0 auto'
                    }}
                    pagination={false}
                />
                <br/>

                <Divider orientation="center">부가 비용</Divider>
                <Table
                    columns={additionalColumns}
                    dataSource={additionalTableData}
                    size="middle"
                    style={{
                        width: '100%',
                        maxWidth: '600px',
                        margin: '0 auto',
                        marginBottom: '3%'
                    }}
                    footer={() => (
                        <>
                            <Divider orientation="center" style={{maxWidth: '600px', margin: '0 auto'}}>총 가격 정보</Divider>
                            <Descriptions
                                bordered
                                column={1}
                                size="small"
                                style={{
                                    width: '100%',
                                    maxWidth: '600px'
                                }}
                            >
                                <Descriptions.Item label="총 비용">
                                    <Typography.Text strong>{wholePrice}</Typography.Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="부가세">
                                    <Typography.Text type="warning">{surtax}</Typography.Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="총 합계">
                                    <Typography.Text type="danger" strong>
                                        {
                                            getTotalPriceWithSurtax(
                                                totalPrice,
                                                totalPriceDiscountedAmount,
                                                discountedTotalPriceWithSurtax
                                            )
                                        }
                                    </Typography.Text>
                                </Descriptions.Item>
                            </Descriptions>
                        </>
                    )}
                    pagination={false}
                />

                <Button
                    type="primary"
                    size="middle"
                    style={{
                        display: 'block',
                        width: '100%',
                        maxWidth: '600px',
                        margin: '0 auto 10px',
                        textAlign: 'center'
                    }}
                    onClick={() => setIsInquiryModalOpen(true)}
                >
                    해당 견적 문의하기
                </Button>

                <InquiryEstimatedChassis
                    estimationId={estimationId}
                    isInquiryModalOpen={isInquiryModalOpen}
                    setIsInquiryModalOpen={setIsInquiryModalOpen}
                />
            </div>
        </>
    );
}

export default EstimationDetailPage;
