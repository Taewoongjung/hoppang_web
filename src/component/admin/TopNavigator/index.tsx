import React, {useEffect, useState} from 'react';
import {callMeDataForAdmin} from "../../../definition/Admin/apiPath";
import adminFetcher from "../../../util/adminFetcher";
import {Layout, Menu, MenuProps} from "antd";
import useSWR from "swr";

const headerMenuItems = [
    {
        key: '1',
        label: '💰 샤시 가격 정보',
        path: '/admin/essentials/info'
    },
    {
        key: '2',
        label: '🪟 고객 견적 정보',
        path: '/admin/essentials/estimates/info'
    },
    {
        key: '3',
        label: '📊 통계',
        path: '/admin/statistics'
    }
]

const { Header } = Layout;


const TopNavigator = () => {

    const { data: userData, error, mutate } = useSWR(callMeDataForAdmin, adminFetcher, {
        dedupingInterval: 2000
    });

    const [current, setCurrent] = useState('1');

    useEffect(() => {
        const currentPath = window.location.pathname;
        const selectedItem = headerMenuItems.find(item => currentPath.startsWith(item.path));
        if (selectedItem) {
            // @ts-ignore
            setCurrent(selectedItem.key);
        }
    }, []);

    const onClickMenu: MenuProps['onClick'] = (e) => {
        setCurrent(e.key);
        const selectedItem = headerMenuItems.find(item => item.key === e.key);
        if (selectedItem) {
            window.location.href = selectedItem.path;
        }
    };

    return (
        <>
            <Header style={{ display: 'flex', alignItems: 'center' }}>
                <div className="demo-logo" style={{ color: "white" }}>{userData?.name}</div>

                <Menu
                    theme="dark"
                    mode="horizontal"
                    onClick={onClickMenu}
                    items={headerMenuItems}
                    style={{ flex: 1, marginLeft: 70 }}
                    selectedKeys={[current]}
                />
            </Header>
        </>
    )
}

export default TopNavigator;
