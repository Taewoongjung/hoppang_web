import React, {useCallback, useEffect, useRef, useState} from 'react';
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {Card, List, Button, Typography, Spin} from "antd";
import {addCommasToNumber} from "../../../../util";
import moment from "moment/moment";
import useSWR from "swr";
import {callEstimationById, callEstimationHistories, callMeData} from "../../../../definition/apiPath";
import fetcher from "../../../../util/fetcher";
import axios from "axios";
import {LeftOutlined} from "@ant-design/icons";
import {GoToTopButton} from "../../../../util/renderUtil";


dayjs.extend(customParseFormat);

const { Title, Text } = Typography;

interface Estimation {
    estimationId: number;
    companyType: string;
    fullAddress: string;
    wholePrice: number;
    estimatedAt: string;
}

const EstimationHistory = () => {
    const { data: userData, error, mutate } = useSWR(callMeData, fetcher, {
        dedupingInterval: 2000
    });

    const [data, setData] = useState<Estimation[]>([]);
    const [lastEstimationId, setLastEstimationId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLastPage, setIsLastPage] = useState(false);
    const observer = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        loadEstimationData(lastEstimationId);
    }, []);

    const loadEstimationData = async (lastId: number | null) => {
        if (isLoading || isLastPage) return;

        setIsLoading(true);

        try {
            const lastEstimationIdParam = lastId ? `lastEstimationId=${lastId}` : "";
            const res = await axios.get(`${callEstimationHistories}?size=10&${lastEstimationIdParam}`, {
                withCredentials: true,
                headers: {
                    Authorization: localStorage.getItem("hoppang-token"),
                }
            });

            if (res.data && res.data.estimationList.length > 0) {
                setData((prevData) => [...prevData, ...mapEstimationHistories(res.data)]);

                setLastEstimationId(res.data.lastEstimationId);
            }

            setIsLastPage(res.data.isLastPage);
        } catch (err) {
            console.error("Error fetching estimation histories:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const mapEstimationHistories = (response: any): Estimation[] => {
        return response.estimationList.map((estimation: any) => ({
            estimationId: estimation.estimationId,
            companyType: estimation.companyType,
            fullAddress: estimation.fullAddress,
            wholePrice: estimation.wholePrice,
            estimatedAt: estimation.estimatedAt
        }));
    };

    const clickBackButton = () => {
        window.location.href = "/mypage";
    };

    const lastElementRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (isLoading || isLastPage) return;
            if (observer.current) observer.current.disconnect();

            observer.current = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting) {
                        loadEstimationData(lastEstimationId);
                    }
                },
                { threshold: 1 }
            );

            if (node) observer.current.observe(node);
        },
        [isLoading, isLastPage, lastEstimationId]
    );

    const clickEstimation = (estimationId: any) => {

        if (!estimationId) {
            return;
        }

        return window.location.href = "/mypage/estimation/" + estimationId;
    }

    const clickGoToEstimationDetail = (estimationId: any) => {

        return (
            <Button
                type="link"
                style={{ marginTop: "13px", color: "#1890ff" }}
                onClick={(e) => {
                    e.stopPropagation();
                    clickEstimation(estimationId);
                }}
            >
                자세히 보기 →
            </Button>
        )
    }


    return (
        <div className="container">
            <div onClick={clickBackButton} style={{ color: "blue", marginRight: "80%", marginTop: '50px', marginBottom: '80px' }}>
                <LeftOutlined />
            </div>

            <Title className="container" level={1} style={{ textAlign: "center" }}>견적 이력</Title>
            {data.length > 0 ? (
                <>
                    <List
                        grid={{ gutter: 16, column: 1 }}
                        dataSource={data}
                        renderItem={(item, index) => {
                            if (index === data.length - 1) {
                                return (
                                    <div ref={lastElementRef} key={item.estimationId}>
                                        <List.Item>
                                            <Card
                                                className="container"
                                                style={{ borderRadius: 12, borderColor: "lightgrey" }}
                                                onClick={() => clickEstimation(item.estimationId)}
                                            >
                                                <Title level={5}>{item.estimationId}</Title>
                                                <Text strong>회사 유형: </Text><Text>{item.companyType}</Text><br/>
                                                <Text strong>총 가격: </Text><Text>{addCommasToNumber(item.wholePrice)}</Text><br/>
                                                <Text strong>생성일: </Text><Text>{moment(item.estimatedAt).format('YYYY-MM-DD HH:mm:ss')}</Text>
                                                <hr/>
                                                <Text strong>주소: </Text><Text>{item.fullAddress}</Text><br/>

                                                {clickGoToEstimationDetail(item.estimationId)}
                                            </Card>
                                        </List.Item>
                                    </div>
                                );
                            }
                            return (
                                <List.Item key={item.estimationId}>
                                    <Card
                                        className="container"
                                        style={{ borderRadius: 12, borderColor: "lightgrey" }}
                                    >
                                        <Title level={5}>{item.estimationId}</Title>
                                        <Text strong>회사 유형: </Text><Text>{item.companyType}</Text><br/>
                                        <Text strong>총 가격: </Text><Text>{addCommasToNumber(item.wholePrice)}</Text><br/>
                                        <Text strong>생성일: </Text><Text>{moment(item.estimatedAt).format('YYYY-MM-DD HH:mm:ss')}</Text>
                                        <hr/>
                                        <Text strong>주소: </Text><Text>{item.fullAddress}</Text><br/>

                                        {clickGoToEstimationDetail(item.estimationId)}
                                    </Card>
                                </List.Item>
                            );
                        }}
                    />

                    <GoToTopButton/>
                </>
            ) : (
                <div className="container"
                     style={{ textAlign: "center", padding: "50px 0" }}>
                    <Title level={4}>견적 내역이 없습니다.</Title>
                    <Text>새로운 견적을 등록해보세요!</Text>
                    <br />
                    <Button type="primary" style={{ marginTop: "20px" }} onClick={() => window.location.href = "/chassis/calculator"}>
                        견적 요청하기
                    </Button>
                </div>
            )}

            {isLoading && (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <Spin />
                </div>
            )}
        </div>
    );
};

export default EstimationHistory;
