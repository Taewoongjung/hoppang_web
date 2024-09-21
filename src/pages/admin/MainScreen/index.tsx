import React from 'react';
import {Layout, Menu} from "antd";
import useSWR from "swr";
import {callMeData} from "../../../definition/admin/apiPath";
import adminFetcher from "../../../util/adminFetcher";
import ManipulateDatabase from "../../../component/admin/ManipulateDatabase";

const { Header, Content, Footer } = Layout;

const headerMenuItems = [
    {
        key: 1,
        label: '샤시 가격 정보'
    },
    {
        key: 2,
        label: '고객 견적 정보'
    }
]


const MainScreen = () => {

    const { data: userData, error, mutate } = useSWR(callMeData, adminFetcher, {
        dedupingInterval: 2000
    });

    return (
        <>
            <Layout>
                <Header style={{ display: 'flex', alignItems: 'center' }}>
                    <div className="demo-logo" style={{ color: "white" }}>{userData?.name}</div>

                    <Menu
                        theme="dark"
                        mode="horizontal"
                        defaultSelectedKeys={['1']}
                        items={headerMenuItems}
                        style={{ flex: 1, minWidth: 0, marginLeft: 70 }}
                    />
                </Header>
                <Content style={{ padding: '0 0px' }}>

                    {/*샤시 가격 정보 페이지*/}
                    <ManipulateDatabase/>

                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    <strong>호빵</strong> ©{new Date().getFullYear()} Created by clan Jung
                </Footer>
            </Layout>
        </>
    )
}

export default MainScreen;
