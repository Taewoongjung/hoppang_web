import React from 'react';
import {Layout, Card} from "antd";
import TopNavigator from "../../../component/admin/TopNavigator";
import AdminFooter from "../../../component/admin/Footer";
import AdvertisementCreate from "../../../component/admin/AdvertisementCreate";

const { Content } = Layout;

const AdvertisementMainScreen = () => {


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
                            flexWrap: 'wrap'
                        }}>
                            <Card style={{ marginBottom: '1%', borderRadius: '8px' }}>
                                <AdvertisementCreate/>
                            </Card>
                        </div>
                    </div>
                </Content>
                <AdminFooter/>
            </Layout>
        </>
    );
};


export default AdvertisementMainScreen;
