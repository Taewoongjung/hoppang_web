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
                        <div style={{
                            flexDirection: window.innerWidth < 600 ? 'column' : 'row', // 화면 크기에 따라 가로/세로 변경
                            gap: '3px',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            marginBottom: '1%'
                        }}>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Card style={{ borderRadius: '8px' }}>
                                        <SumUpStatisticsTable/>
                                    </Card>
                                </Col>
                                <Col span={12}>
                                    <Card style={{ borderRadius: '8px' }}>
                                        <AppDownloadInboundStatistics/>
                                    </Card>
                                </Col>
                            </Row>
                        </div>

                        <Card style={{ marginBottom: '1%', borderRadius: '8px' }}>
                            <UserAndEstimationStatisticsVerticalBarChart/>
                        </Card>

                        <Card style={{ borderRadius: '8px' }}>
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
