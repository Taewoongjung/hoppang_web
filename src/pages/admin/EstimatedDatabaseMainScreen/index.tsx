import React from 'react';
import useSWR from "swr";
import {callMeData} from "../../../definition/Admin/apiPath";
import adminFetcher from "../../../util/adminFetcher";
import {Layout, Menu} from "antd";
import EstimationManagement from "../../../component/admin/EstimationManagement";
import {onClickAdminMenu} from "../../../util";

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


const EstimatedDatabaseMainScreen = () => {

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
                        onClick={onClickAdminMenu}
                        defaultSelectedKeys={['2']}
                        items={headerMenuItems}
                        style={{ flex: 1, minWidth: 0, marginLeft: 70 }}
                    />
                </Header>
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
