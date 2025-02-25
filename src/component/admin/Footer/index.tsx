import React from 'react';
import {Layout} from "antd";

const { Footer } = Layout;

const AdminFooter = () => {

    return (
        <>
            <Footer style={{ textAlign: 'center' }}>
                <strong>호빵</strong> ©{new Date().getFullYear()} Created by Jung Tae Woong
            </Footer>
        </>
    )
}

export default AdminFooter;
