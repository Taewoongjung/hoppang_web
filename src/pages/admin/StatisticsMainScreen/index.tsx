import React from 'react';
import {Layout, Card} from "antd";
import TopNavigator from "../../../component/admin/TopNavigator";
import SumUpStatisticsTable from "../../../component/admin/Statistics/SumUpStatisticsTable";
import UserAndEstimationStatisticsVerticalBarChart
    from "../../../component/admin/Statistics/UserAndEstimationStatisticsVerticalBarChart";
import AdminFooter from "../../../component/admin/Footer";
import EstimationByStateStatisticsPieChart
    from "../../../component/admin/Statistics/EstimationByStateStatisticsPieChart";

const { Content } = Layout;


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
                            <UserAndEstimationStatisticsVerticalBarChart/>
                        </Card>

                        <Card style={{ marginBottom: '20px', borderRadius: '8px' }}>
                            <EstimationByStateStatisticsPieChart/>
                        </Card>
                    </div>

                </Content>
                <AdminFooter/>
            </Layout>
        </>
    );
}

export default StatisticsMainScreen;
