import React, {useEffect, useState} from 'react';
import axios from "axios";
import {callEstimateInquiry, callEstimationById} from "../../../../definition/apiPath";
import {useParams} from "react-router-dom";
import {Button, Descriptions, Divider, message, Modal, Table, TableColumnsType, Typography} from "antd";
import { addCommasToNumber } from 'src/util';
import {LeftOutlined} from "@ant-design/icons";
import {GoToTopButton} from "../../../../util/renderUtil";

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

    const [messageApi, contextHolder] = message.useMessage();

    const [materialTableData, setMaterialTableData] = useState<MaterialDataType[]>([]);
    const [additionalTableData, setAdditionalTableData] = useState<AdditionalDataType[]>([]);
    const [surtax, setSurtax] = useState('');
    const [wholePrice, setWholePrice] = useState('');
    const [totalPrice, setTotalPrice] = useState('');
    const [calculatedCompanyType, setCalculatedCompanyType] = useState('');

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


    useEffect(() => {

        if(!estimationId) return;

        axios.get(callEstimationById.replace("{estimationId}", estimationId), {
            withCredentials: true,
            headers: {
                Authorization: localStorage.getItem("hoppang-token"),
            }
        }).then((res) => {

            const result = res.data;

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
            setTotalPrice(addCommasToNumber(surtax + wholePrice));

        }).catch((err) => {
            console.error(err);
        })
    }, [estimationId]);

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


    return (
        <>
            {contextHolder}
            <header
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    height: '50px',
                    width: '100%',
                    maxWidth: '600px',
                    margin: '0 auto',
                    borderBottom: '1px solid #ddd',
                    marginBottom: '8%'
                }}
            >
                <button
                    style={{
                        position: 'absolute',
                        left: '0',
                        fontSize: 24,
                        background: 'none',
                        border: 'none'
                    }}
                    onClick={() => {
                        window.location.href = '/mypage/estimation/histories';
                    }}>
                    <LeftOutlined/>
                </button>
            </header>

            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    marginTop: '2%',
                    marginBottom: '5%'
                }}
            >
                <span>{calculatedCompanyType} - 📋 {estimationId} (견적번호)</span>
            </div>

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
                    margin: '0 auto'
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
                                maxWidth: '600px',
                                margin: '0 auto'
                            }}
                        >
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
                onClick={() => handleInquiry(estimationId)}
            >
                해당 견적 문의하기
            </Button>

            <GoToTopButton/>
        </>
    );
}

export default EstimationDetailPage;
