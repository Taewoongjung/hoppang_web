import React from 'react';
import {Layout, Card} from "antd";
import TopNavigator from "../../../component/admin/TopNavigator";
import UserStatisticsVerticalBarChart from "../../../component/admin/Statistics/UserStatisticsVerticalBarChart";
import SumUpStatisticsTable from "../../../component/admin/Statistics/SumUpStatisticsTable";

const { Content, Footer } = Layout;


const StatisticsMainScreen = () => {

    return (
        <>
            <Layout>
                <TopNavigator/>
                <Content style={{ padding: '0 0px' }}>

                    <div style={{marginTop: '5%'}}>
                        {/* 통계 페이지 */}
                        <Card style={{ marginBottom: '20px', borderRadius: '8px' }}>
                            <SumUpStatisticsTable/>
                        </Card>

                        <Card style={{ marginBottom: '20px', borderRadius: '8px' }}>
                            <UserStatisticsVerticalBarChart/>
                        </Card>
                    </div>

                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    <strong>호빵</strong> ©{new Date().getFullYear()} Created by Jung
                </Footer>
            </Layout>
        </>
    );
}

export default StatisticsMainScreen;
