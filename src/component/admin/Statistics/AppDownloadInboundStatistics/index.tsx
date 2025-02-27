import React, {useEffect, useState} from "react";
import {Row, Col, Card, Statistic, StatisticProps} from "antd";
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
            <Row gutter={16}>
                <Col span={12}>
                    <Card>
                        <Statistic
                            title="Active"
                            value={androidPercentile}
                            precision={2}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<AndroidOutlined />}
                            suffix="%"
                        />
                    </Card>
                </Col>
                <Col span={12}>
                    <Card>
                        <Statistic
                            title="Idle"
                            value={iosPercentile}
                            precision={2}
                            valueStyle={{ color: '#cf1322' }}
                            prefix={<AppleOutlined />}
                            suffix="%"
                        />
                    </Card>
                </Col>
            </Row>
        </>
    )
}

export default AppDownloadInboundStatistics;
