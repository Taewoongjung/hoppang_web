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


    const generateColors = (count: number) => {
        const colors = [];
        for (let i = 0; i < count; i++) {
            const r = Math.floor(Math.random() * 255);
            const g = Math.floor(Math.random() * 255);
            const b = Math.floor(Math.random() * 255);
            colors.push(`rgba(${r}, ${g}, ${b}, 0.6)`);
        }
        return colors;
    };

    const borderColorFromBackground = (colors: string[]) => {
        return colors.map(color => color.replace("0.6", "1"));
    };

    const backgroundColors = generateColors(stateList.length);
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

            const stateList = estimationsByStateData.map((item: any) => item.state);
            const estimationsPercentileByStateData = estimationsByStateData.map((item: any) => item.count);

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
                            지역별 견적률
                        </Typography.Title>

                        <div style={{  width: "30%", height: "30%", marginTop: '5%' }}>
                            <Pie data={data} options={options} />
                        </div>
                </Card>
            </Content>
        </>
    );
};

export default EstimationByStateStatisticsPieChart;
