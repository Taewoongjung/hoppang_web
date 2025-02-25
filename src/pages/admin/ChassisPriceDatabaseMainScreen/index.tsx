import React from 'react';
import {Layout} from "antd";
import ManipulateDatabase from "../../../component/admin/ManipulateDatabase";
import TopNavigator from "../../../component/admin/TopNavigator";

const { Content, Footer } = Layout;

const ChassisPriceDatabaseMainScreen = () => {


    return (
        <>
            <Layout>
                <TopNavigator/>
                <Content style={{ padding: '0 0px' }}>

                    {/* 샤시 가격 정보 페이지 */}
                    <ManipulateDatabase/>

                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    <strong>호빵</strong> ©{new Date().getFullYear()} Created by clan Jung
                </Footer>
            </Layout>
        </>
    )
}

export default ChassisPriceDatabaseMainScreen;
