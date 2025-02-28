import React, {useEffect, useState} from "react";
import { Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from "chart.js";
import {Layout, Typography, Card} from "antd";
import axios from "axios";
import {findEstimationsByStates} from "../../../../definition/Admin/apiPath";

ChartJS.register(ArcElement, Tooltip, Legend);

const { Content } = Layout;

const options = {
    responsive: true,
    plugins: {
        legend: {
            position: "top" as const
        },
        tooltip: {
            callbacks: {
                label: (tooltipItem: any) => {
                    const value = tooltipItem.raw;
                    return ` ${value}건`;
                }
            }
        }
    }
};

const EstimationByStateStatisticsPieChart = () => {

    const [stateList, setStateList] = useState([]);
    const [estimationsByStateData, setEstimationsByStateData] = useState([]);


    const generatePastelColors = (count: number) => {
        const colors = [];
        for (let i = 0; i < count; i++) {
            const hue = (i * (360 / count) + 30) % 360; // 색상의 Hue 값을 균등하게 분배하면서 오프셋 적용
            const saturation = 60; // 채도를 낮춰 부드러운 색상 유지
            const lightness = 75; // 밝기를 높여 눈이 편안한 파스텔 톤 유지
            colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
        }
        return colors;
    };

    const borderColorFromBackground = (colors: string[]) => {
        return colors.map(color => color.replace("75%)", "50%)")); // 테두리는 약간 더 어둡게
    };

    const backgroundColors = generatePastelColors(stateList.length);
    const borderColors = borderColorFromBackground(backgroundColors);

    const data = {
        labels: stateList,
        datasets: [
            {
                label: "광역시/도 별 견적 개수",
                data: estimationsByStateData,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 1
            }
        ]
    };

    useEffect(() => {

        axios.get(findEstimationsByStates, {
            withCredentials: true,
            headers: {
                Authorization: localStorage.getItem("hoppang-admin-token") || '',
            },
        }).then((res) => {
            // *지역별 견적 백분위 데이터
            const estimationsByStateData = res.data.estimationByStateStatisticsData;

            const stateList =
                estimationsByStateData
                    .filter((item: any) => item.count !== 0)
                    .map((item: any) => item.state);
            const estimationsPercentileByStateData = estimationsByStateData
                .filter((item: any) => item.count !== 0)
                .map((item: any) => item.count);

            setStateList(stateList);
            setEstimationsByStateData(estimationsPercentileByStateData);

        }).catch((err) => {
            console.error(err);
        });

    }, []);


    return (
        <>
            <Content style={{ justifyContent: 'center', padding: '0 0px' }}>
                <Card style={{ marginBottom: '40px', borderRadius: '8px' }}>
                    <Typography.Title level={1} style={{ margin: 0 }}>
                        지역별 견적 개수
                    </Typography.Title>

                    <div
                        style={{
                            width: "80vw",
                            height: "80vh",
                            maxWidth: "1200px",
                            maxHeight: "1200px",
                            minWidth: "277px",
                            minHeight: "277px",
                            margin: "auto"
                        }}
                    >
                        <Pie data={data} options={options} />
                    </div>
                </Card>
            </Content>
        </>
    );
};

export default EstimationByStateStatisticsPieChart;
