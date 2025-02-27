import React from 'react';
import {Layout, Card, Col, Row} from "antd";
import TopNavigator from "../../../component/admin/TopNavigator";
import SumUpStatisticsTable from "../../../component/admin/Statistics/SumUpStatisticsTable";
import UserAndEstimationStatisticsVerticalBarChart
    from "../../../component/admin/Statistics/UserAndEstimationStatisticsVerticalBarChart";
import AdminFooter from "../../../component/admin/Footer";
import EstimationByStateStatisticsPieChart
    from "../../../component/admin/Statistics/EstimationByStateStatisticsPieChart";
import AppDownloadInboundStatistics from "../../../component/admin/Statistics/AppDownloadInboundStatistics";
import {GoToTopButton} from "../../../util/renderUtil";

const { Content } = Layout;

const StatisticsMainScreen = () => {

    return (
        <>
            <Layout>
                <TopNavigator/>

                <Content style={{ padding: '0 0px' }}>

                    <div style={{marginTop: '5%'}}>
                        {/* 통계 페이지 */}
                        <Row gutter={16}>
                            <Col span={12}>
                                <Card style={{ marginBottom: '20px', borderRadius: '8px' }}>
                                    <SumUpStatisticsTable/>
                                </Card>
                            </Col>
                            <Col span={12}>
                                <Card style={{ marginBottom: '20px', borderRadius: '8px' }}>
                                    <AppDownloadInboundStatistics/>
                                </Card>
                            </Col>
                        </Row>

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

            <GoToTopButton/>
        </>
    );
}

export default StatisticsMainScreen;
