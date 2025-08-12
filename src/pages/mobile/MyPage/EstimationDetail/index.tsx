import React, {useEffect, useState} from 'react';
import axios from "axios";

import './styles.css';
import '../../versatile-styles.css';

import {callEstimationById} from "../../../../definition/apiPath";
import {useParams} from "react-router-dom";
import {Button, Table, TableColumnsType} from "antd";
import {addCommasToNumber, mappedCompanyLogoPathByValue} from 'src/util';
import {LeftOutlined, DollarOutlined} from "@ant-design/icons";
import InquiryEstimateChassis from "../../../../component/V2/InquiryEstimateChassis";


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
        render: (text: string) => (
            <span style={{ fontWeight: 500, color: '#1f2937' }}>{text}</span>
        )
    },
    {
        title: '규격',
        dataIndex: 'standard',
        render: (text: string) => (
            <span style={{ color: '#6b7280', fontSize: '14px' }}>{text}</span>
        )
    },
    {
        title: '금액',
        dataIndex: 'price',
        render: (text: string) => (
            <span style={{ fontWeight: 600, color: '#f59e56' }}>{text}원</span>
        )
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
        render: (text: string) => (
            <span style={{ fontWeight: 500, color: '#1f2937' }}>{text}</span>
        )
    },
    {
        title: '금액',
        dataIndex: 'price',
        render: (text: string) => (
            <span style={{ fontWeight: 600, color: '#6b7280' }}>{text}원</span>
        )
    },
];

const EstimationDetailPage = () => {
    const { estimationId } = useParams();

    const [materialTableData, setMaterialTableData] = useState<MaterialDataType[]>([]);
    const [additionalTableData, setAdditionalTableData] = useState<AdditionalDataType[]>([]);
    const [surtax, setSurtax] = useState<string | undefined>('');
    const [wholePrice, setWholePrice] = useState<string | undefined>('');
    const [totalPrice, setTotalPrice] = useState<string | undefined>('');
    const [calculatedCompanyType, setCalculatedCompanyType] = useState<string>('');
    const [estimatedAt, setEstimatedAt] = useState();
    const [totalPriceDiscountedAmount, setTotalPriceDiscountedAmount] = useState<string | undefined>('');
    const [discountedTotalPriceWithSurtax, setDiscountedTotalPriceWithSurtax] = useState<string | undefined>('');

    useEffect(() => {
        if(!estimationId) return;

        axios.get(
            callEstimationById.replace("{estimationId}", estimationId),
            {
                withCredentials: true,
                headers: {
                    Authorization: localStorage.getItem("hoppang-token"),
                }
            }
        ).then((res) => {
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
            let surtax = result.surtax;
            let demolitionFee = result.demolitionFee;
            let maintenanceFee = result.maintenanceFee;
            let ladderFee = result.ladderFee;
            let freightTransportFee = result.freightTransportFee;
            let deliveryFee = result.deliveryFee;
            let customerFloor = result.customerFloor;

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

            setSurtax(addCommasToNumber(surtax));
            setWholePrice(addCommasToNumber(wholePrice));
            setTotalPrice(addCommasToNumber(surtax + wholePrice));
            setTotalPriceDiscountedAmount(addCommasToNumber(result.discountedAmount));
            setDiscountedTotalPriceWithSurtax(addCommasToNumber(result.discountedWholeCalculatedFeeWithSurtax));
            window.scrollTo({ top: 0 });

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
                    <div className="price-display-container">
                        <span className="original-price">
                            {addCommasToNumber(totalPriceWithSurtax)}원
                        </span>
                        <span className="discount-amount">
                            (-{totalPriceDiscountedAmount}원)
                        </span>
                        <span className="final-price">
                            {addCommasToNumber(discountedTotalPriceWithSurtax)}원
                        </span>
                    </div>
                ) : (
                    <span className="final-price">{addCommasToNumber(totalPriceWithSurtax)}원</span>
                )}
            </>
        );
    };

    return (
        <div className="estimation-container">
            {/* Header */}
            <header className="estimation-header">
                <div className="header-content">
                    <button
                        className="back-btn"
                        onClick={() => {
                            window.location.href = '/v2/mypage/estimation/histories';
                        }}
                    >
                        <LeftOutlined />
                    </button>
                    <div className="header-title">
                        <h1>견적서 상세</h1>
                    </div>
                    <div className="header-spacer"></div>
                </div>
            </header>

            {/* Main Content */}
            <main className="estimation-main">
                {/* Estimation Info */}
                <section className="info-card">
                    <div className="info-header">
                        <div className="info-details">
                            <h2 className="company-name">
                                <img
                                    src={mappedCompanyLogoPathByValue(calculatedCompanyType)}
                                    style={{width:'150px'}}
                                />
                            </h2>
                            <p className="estimation-id">견적번호: {estimationId}</p>
                            <p className="estimation-date">견적일: {estimatedAt}</p>
                        </div>
                    </div>
                </section>

                {/* Materials Section */}
                <section className="section-card">
                    <div className="section-header">
                        <div className="section-icon">🪟</div>
                        <h3 className="section-title">창호 항목</h3>
                    </div>
                    <div className="table-container">
                        <Table
                            columns={materialColumns}
                            dataSource={materialTableData}
                            size="middle"
                            pagination={false}
                            showHeader={false}
                        />
                    </div>
                </section>

                {/* Additional Costs Section */}
                <section className="section-card">
                    <div className="section-header">
                        <div className="section-icon">⚙️</div>
                        <h3 className="section-title">부가 비용</h3>
                    </div>
                    <div className="table-container">
                        <Table
                            columns={additionalColumns}
                            dataSource={additionalTableData}
                            size="middle"
                            pagination={false}
                            showHeader={false}
                        />
                    </div>
                </section>

                {/* Price Summary Section */}
                <section className="price-summary-card">
                    <div className="section-header">
                        <div className="section-icon price-icon">
                            <DollarOutlined />
                        </div>
                        <h3 className="section-title">총 가격 정보</h3>
                    </div>

                    <div className="price-breakdown">
                        <div className="price-item">
                            <span className="price-label">총 비용</span>
                            <span className="price-value base-price">{wholePrice}원</span>
                        </div>
                        <div className="price-item">
                            <span className="price-label">부가세 (10%)</span>
                            <span className="price-value tax-price">{surtax}원</span>
                        </div>
                        <div className="price-divider"></div>
                        <div className="price-item total-item">
                            <span className="price-label total-label">총 합계</span>
                            <div className="price-value">
                                {getTotalPriceWithSurtax(
                                    totalPrice,
                                    totalPriceDiscountedAmount,
                                    discountedTotalPriceWithSurtax
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Inquiry Button */}
                <div className="inquiry-section">
                    <Button
                        type="primary"
                        size="large"
                        className="inquiry-button"
                        onClick={() => setIsInquiryModalOpen(true)}
                    >
                        해당 견적 문의하기
                    </Button>
                </div>
            </main>

            <InquiryEstimateChassis
                estimationId={estimationId}
                isInquiryModalOpen={isInquiryModalOpen}
                setIsInquiryModalOpen={setIsInquiryModalOpen}
                finishedInquiry={
                    () => {}
                }
            />
        </div>
    );
}

export default EstimationDetailPage;
