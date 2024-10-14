import React from 'react';
import './styles.css';
import {LeftOutlined, RightOutlined} from "@ant-design/icons";

const ConfigPage = () => {

    return (
        <>
            <body>
                <section className="settings-section">
                    <header className="settings-header">
                        <button className="back-button" onClick={() => {window.location.href = '/mypage';}}><LeftOutlined /></button>
                        <h2>설정</h2>
                    </header>
                    <ul className="settings-list">
                        <li className="settings-item">
                            <span>서비스 이용약관</span>
                            <span className="arrow"><RightOutlined /></span>
                        </li>
                        <li className="settings-item">
                            <span>개인정보 처리방침</span>
                            <span className="arrow"><RightOutlined /></span>
                        </li>
                        <li className="settings-item" onClick={() => {window.location.href = '/login';}}>
                            <span>회원가입</span>
                            <span className="arrow"><RightOutlined /></span>
                        </li>
                        <li className="settings-item">
                            <span>앱 관리</span>
                            <span className="arrow"><RightOutlined /></span>
                        </li>
                    </ul>
                </section>
            </body>
        </>
    )
}

export default ConfigPage;
