import React, {useEffect, useState} from "react";
import {Row, Col, Card, Statistic, Typography} from "antd";
import { AppleOutlined, AndroidOutlined } from "@ant-design/icons";
import axios from "axios";
import {findUserAppInboundStatistics} from "../../../../definition/Admin/apiPath";

const AppDownloadInboundStatistics = () => {

    const [androidPercentile, setAndroidPercentile] = useState();
    const [iosPercentile, setIosPercentile] = useState();

    useEffect(() => {
        axios.get(findUserAppInboundStatistics, {
            withCredentials: true,
            headers: {
                Authorization: localStorage.getItem("hoppang-admin-token") || '',
            },
        }).then((res) => {

            setAndroidPercentile(res.data.androidPercentile);
            setIosPercentile(res.data.iosPercentile);

        }).catch((err) => {
            console.error(err);
        });
    }, []);


    return (
        <>
            <Typography.Title level={1} style={{ margin: 0 }}>
                유저 앱 인입 통계
            </Typography.Title>

            <div style={{ marginTop: '3%' }}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Card>
                            <Statistic
                                title={<div><AndroidOutlined /> 안드로이드</div>}
                                value={androidPercentile}
                                precision={2}
                                valueStyle={{ color: '#000000' }}
                            />
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card>
                            <Statistic
                                title={<div><AppleOutlined /> 애플</div>}
                                value={iosPercentile}
                                precision={2}
                                valueStyle={{ color: '#000000' }}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>
        </>
    )
}

export default AppDownloadInboundStatistics;
