import React, {useEffect, useState} from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import {userStatistics} from "../../../../definition/Admin/apiPath";
import axios from 'axios';
import {Layout, Typography, Card} from "antd";
import {Row, Col, Button} from "antd";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const chartOptions = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top' as const,
        },
        // title: {
        //     display: true,
        //     text: 'Statistics Bar Chart',
        // },
    },
    scales: {
        x: {
            beginAtZero: true,
        },
        y: {
            beginAtZero: true,
        },
    },
};

const { Content } = Layout;


const UserStatisticsVerticalBarChart = () => {

    const [selectedInterval, setSelectedInterval] = useState<number>(3);

    const [labelList, setLabelList] = useState([]);
    const [registeredUserDataSetOfEachLabel, setRegisteredUserDataSetOfEachLabel] = useState([]);
    const [deletedUsersDataSetOfEachLabel, setDeletedUsersDataSetOfEachLabel] = useState([]);


    const chartData = {
        labels: labelList, // X-axis labels
        datasets: [
            {
                label: '가입자 수',
                data: registeredUserDataSetOfEachLabel, // Y-axis data points
                borderColor: 'rgba(75, 192, 192, 1)', // Bar border color
                backgroundColor: 'rgba(75, 192, 192, 0.2)', // Bar fill color
                borderWidth: 2
            },
            {
                label: '탈퇴자 수',
                data: deletedUsersDataSetOfEachLabel,
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderWidth: 2
            }
        ]
    };

    useEffect(() => {
        // queryParams
        const searchPeriodType = 'DAILY';

        axios.get(userStatistics + `?searchPeriodType=${searchPeriodType}&searchPeriodValue=${selectedInterval}`, {
            withCredentials: true,
            headers: {
                Authorization: localStorage.getItem("hoppang-admin-token") || '',
            },
        }).then((res) => {
            // *가입자 정보
            const registeredUserData = res.data.registeredUsersStatisticsElementList;

            const registeredUserLabels = registeredUserData.map((item: any) => item.label);
            const registeredUserDataOfEachLabel = registeredUserData.map((item: any) => item.count);

            setRegisteredUserDataSetOfEachLabel(registeredUserDataOfEachLabel);

            // *탈퇴자 정보
            const deletedUserData = res.data.deletedUsersStatisticsElementList;
            const deletedUserDataOfEachLabel = deletedUserData.map((item: any) => item.count);

            setDeletedUsersDataSetOfEachLabel(deletedUserDataOfEachLabel);

            // 공통
            setLabelList(registeredUserLabels); // 어차피 registeredUserLabels, deletedUserLabels 둘 다 같아서 둘 중 하나 사용.

        }).catch((err) => {
            console.error(err);
        });
    }, [selectedInterval]);

    const handleIntervalChange = (days: number) => {
        setSelectedInterval(days);
        console.log(`Selected interval: ${days} days`);
    };


    return (
        <>
            <Content style={{ padding: '0 0px' }}>
                <Card style={{ marginBottom: '20px', borderRadius: '8px' }}>
                    <Typography.Title level={1} style={{ margin: 0 }}>
                        신규 가입자 현황
                    </Typography.Title>
                    <div style={{ marginTop: '5%' }}>

                        <Bar data={chartData} options={chartOptions} />

                        <Row gutter={[16, 16]} style={{ marginTop: '50px' }}>
                            <Col>
                                <Button
                                    type={selectedInterval === 3 ? 'primary' : 'default'}
                                    onClick={() => handleIntervalChange(3)}
                                >
                                    3 일
                                </Button>
                            </Col>
                            <Col>
                                <Button
                                    type={selectedInterval === 7 ? 'primary' : 'default'}
                                    onClick={() => handleIntervalChange(7)}
                                >
                                    7 일
                                </Button>
                            </Col>
                            <Col>
                                <Button
                                    type={selectedInterval === 14 ? 'primary' : 'default'}
                                    onClick={() => handleIntervalChange(14)}
                                >
                                    14 일
                                </Button>
                            </Col>
                            <Col>
                                <Button
                                    type={selectedInterval === 28 ? 'primary' : 'default'}
                                    onClick={() => handleIntervalChange(28)}
                                >
                                    28 일
                                </Button>
                            </Col>
                        </Row>
                    </div>
                </Card>
            </Content>
        </>
    )
}

export default UserStatisticsVerticalBarChart;
