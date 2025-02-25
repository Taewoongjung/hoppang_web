import React, {useEffect, useState} from 'react';
import {Row, Col, Statistic, StatisticProps, Typography} from 'antd';
import CountUp from "react-countup";
import axios from "axios";
import {findAllProvidedEstimationsCount, findAllUsersCount} from "../../../../definition/Admin/apiPath";

const formatter: StatisticProps['formatter'] = (value) => (
    <CountUp end={value as number} separator="," />
);

const SumUpStatisticsTable = () => {

    const [providedEstimationsCount, setProvidedEstimationsCount] = useState<number>();
    const [allUsersCount, setAllUsersCount] = useState<number>();

    useEffect(() => {

        axios.get(findAllProvidedEstimationsCount, {
            withCredentials: true,
            headers: {
                Authorization: localStorage.getItem("hoppang-admin-token") || '',
            },
        }).then((res) => {
            setProvidedEstimationsCount(res.data.count);
        }).catch((err) => {
            console.error(err);
        });

        axios.get(findAllUsersCount, {
            withCredentials: true,
            headers: {
                Authorization: localStorage.getItem("hoppang-admin-token") || '',
            },
        }).then((res) => {
            setAllUsersCount(res.data.count);
        }).catch((err) => {
            console.error(err);
        });

    }, [])


    return (
        <>
            <Typography.Title level={1} style={{ margin: 0 }}>
                전체 통계
            </Typography.Title>

            <div style={{ marginTop: '3%' }}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Statistic title="총 등록 고객 수" value={allUsersCount} formatter={formatter} />
                    </Col>
                    <Col span={12}>
                        <Statistic title="총 제공된 견적 수" value={providedEstimationsCount} formatter={formatter} />
                    </Col>
                </Row>
            </div>
        </>
    )
}

export default SumUpStatisticsTable;
