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
    const [dataSetOfEachLabel, setDataSetOfEachLabel] = useState([]);


    const chartData = {
        labels: labelList, // X-axis labels
        datasets: [
            {
                label: '가입자 수',
                data: dataSetOfEachLabel, // Y-axis data points
                borderColor: 'rgba(75, 192, 192, 1)', // Bar border color
                backgroundColor: 'rgba(75, 192, 192, 0.2)', // Bar fill color
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
            const statisticsData = res.data.statisticsElements;

            const labels = statisticsData.map((item: any) => item.label);
            const dataOfEachLabel = statisticsData.map((item: any) => item.count);

            setLabelList(labels);
            setDataSetOfEachLabel(dataOfEachLabel);

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
                        {/* Buttons to select the interval */}
                        <Row gutter={[16, 16]} justify="center" style={{ marginBottom: '20px' }}>
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
                                    type={selectedInterval === 20 ? 'primary' : 'default'}
                                    onClick={() => handleIntervalChange(20)}
                                >
                                    20 일
                                </Button>
                            </Col>
                        </Row>

                        <Bar data={chartData} options={chartOptions} />
                    </div>
                </Card>
            </Content>
        </>
    )
}

export default UserStatisticsVerticalBarChart;
