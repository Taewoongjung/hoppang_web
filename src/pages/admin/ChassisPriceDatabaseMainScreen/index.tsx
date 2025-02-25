import React from 'react';
import {Layout} from "antd";
import ManipulateDatabase from "../../../component/admin/ManipulateDatabase";
import TopNavigator from "../../../component/admin/TopNavigator";
import AdminFooter from "../../../component/admin/Footer";

const { Content } = Layout;

const ChassisPriceDatabaseMainScreen = () => {


    return (
        <>
            <Layout>
                <TopNavigator/>
                <Content style={{ padding: '0 0px' }}>

                    {/* 샤시 가격 정보 페이지 */}
                    <ManipulateDatabase/>

                </Content>
                <AdminFooter/>
            </Layout>
        </>
    )
}

export default ChassisPriceDatabaseMainScreen;
