import React, { useEffect, useState } from 'react';
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {Card, List, Button, Typography} from "antd";
import {addCommasToNumber} from "../../../../util";
import moment from "moment/moment";
import useSWR from "swr";
import {callEstimationHistories, callMeData} from "../../../../definition/apiPath";
import fetcher from "../../../../util/fetcher";
import axios from "axios";
import {LeftOutlined} from "@ant-design/icons";


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

    const [isDataExist, setIsDataExist] = useState(true);
    const [data, setData] = useState<Estimation[] | undefined>(undefined);

    useEffect(() => {
        axios.get(callEstimationHistories + "?size=5", {
            withCredentials: true,
            headers: {
                Authorization: localStorage.getItem("hoppang-token"),
            }
        })
            .then((res) => {
                setData(mapEstimationHistories(res.data));
            })
            .catch((err) => {
                setIsDataExist(false)
            });
    }, []);

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
    }

    return (
        <div style={{ padding: 20 }}>
            <div onClick={clickBackButton} style={{color: "blue", marginRight: "80%", marginTop: '50px', marginBottom: '80px'}}>
                <LeftOutlined/>
            </div>

            <Title level={1} style={{ textAlign: "center" }}>견적 리스트</Title>
            {isDataExist ? (
                <List
                    grid={{ gutter: 16, column: 1 }}
                    dataSource={data}
                    renderItem={(item) => (
                        <List.Item>
                            <Card style={{ borderRadius: 12, borderColor: "lightgrey" }}>
                                <Title level={5}>{item.estimationId}</Title>
                                <Text strong>회사 유형: </Text><Text>{item.companyType}</Text><br/>
                                <Text strong>총 가격: </Text><Text>{addCommasToNumber(item.wholePrice)}</Text><br/>
                                <Text strong>생성일: </Text><Text>{moment(item.estimatedAt).format('YYYY-MM-DD HH:mm:ss')}</Text>
                                <hr/>
                                <Text strong>주소: </Text><Text>{item.fullAddress}</Text><br/>
                            </Card>
                        </List.Item>
                    )}
                />
            ) : (
                <div style={{ textAlign: "center", padding: "50px 0" }}>
                    <Title level={4}>견적 내역이 없습니다.</Title>
                    <Text>새로운 견적을 등록해보세요!</Text>
                    <br />
                    <Button type="primary" style={{ marginTop: "20px" }} onClick={() => window.location.href = "/chassis/calculator"}>
                        견적 요청하기
                    </Button>
                </div>
            )}
        </div>
    );
};

export default EstimationHistory;
