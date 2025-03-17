import React from 'react';
import {Layout, Card} from "antd";
import TopNavigator from "../../../component/admin/TopNavigator";
import AdminFooter from "../../../component/admin/Footer";
import AdvertisementCreate from "../../../component/admin/Advertisement/AdvertisementCreate";
import AdvertisementList from "../../../component/admin/Advertisement/AdvertisementList";

const { Content } = Layout;

const AdvertisementMainScreen = () => {


    return (
        <>
            <Layout>
                <TopNavigator/>
                <Content style={{ padding: '0 0px' }}>
                    <div style={{marginTop: '5%'}}>
                        <div style={{
                            flexDirection: window.innerWidth < 600 ? 'column' : 'row',
                            gap: '3px',
                            justifyContent: 'center',
                            alignItems: 'center',
                            flexWrap: 'wrap'
                        }}>
                            <Card style={{ marginBottom: '1%', borderRadius: '8px' }}>
                                <AdvertisementCreate/>
                            </Card>

                            <Card style={{ marginBottom: '1%', borderRadius: '8px' }}>
                                <AdvertisementList/>
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
