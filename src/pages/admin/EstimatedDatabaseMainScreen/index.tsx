import React from 'react';
import {Layout} from "antd";
import EstimationManagement from "../../../component/admin/EstimationManagement";
import TopNavigator from "../../../component/admin/TopNavigator";

const { Content, Footer } = Layout;

const EstimatedDatabaseMainScreen = () => {

    return (
        <>
            <Layout>
                <TopNavigator/>
                <Content style={{ padding: '0 0px' }}>

                    <div style={{marginTop: '5%'}}>
                        {/* 견적 인입 리스트 페이지 */}
                        <EstimationManagement/>
                    </div>

                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    <strong>호빵</strong> ©{new Date().getFullYear()} Created by clan Jung
                </Footer>
            </Layout>
        </>
    )
}

export default EstimatedDatabaseMainScreen;
