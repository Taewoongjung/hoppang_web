import React, { useEffect, useState, memo, useCallback } from 'react';
import { Row, Col, Statistic, StatisticProps, Typography } from 'antd';
import CountUp from "react-countup";
import axios from "axios";
import { findAllProvidedEstimationsCount, findAllUsersCount } from "../../../../definition/Admin/apiPath";

const formatter: StatisticProps['formatter'] = (value) => (
    <CountUp end={value as number} separator="," />
);

const SumUpStatisticsTable: React.FC = memo(() => {
    const [providedEstimationsCount, setProvidedEstimationsCount] = useState<number>();
    const [allUsersCount, setAllUsersCount] = useState<number>();

    const fetchData = useCallback(async () => {
        const token = localStorage.getItem("hoppang-admin-token") || '';

        try {
            const [estimationsRes, usersRes] = await Promise.all([
                axios.get(findAllProvidedEstimationsCount, {
                    withCredentials: true,
                    headers: { Authorization: token },
                }),
                axios.get(findAllUsersCount, {
                    withCredentials: true,
                    headers: { Authorization: token },
                })
            ]);

            setProvidedEstimationsCount(estimationsRes.data.count);
            setAllUsersCount(usersRes.data.count);
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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
    );
});

SumUpStatisticsTable.displayName = 'SumUpStatisticsTable';

export default SumUpStatisticsTable;
