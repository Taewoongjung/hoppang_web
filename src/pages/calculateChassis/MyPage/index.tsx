import React from 'react';
import './styles.css';
import BottomNavigator from "../../../component/BottomNavigator";
import { Divider } from 'antd';
import { RightOutlined } from '@ant-design/icons';

const MyPage = () => {

    return(
        <>
            <body style={{marginTop: 40}}>
                <header className="header">
                    <div className="icons">
                        <h2>마이</h2>
                    </div>
                    <div className="settings-icon" onClick={() => {window.location.href = '/mypage/config';}}>
                        <img src="/assets/MyPage/config-icon.png" alt="Home" style={{width:23, height:23}}/>
                ️   </div>
                </header>

                <main>
                    <div className="login-section" onClick={() => {window.location.href = '/login';}}>
                        <div className="login-box">
                            <div className="login-text">
                                <h3>호빵 로그인 및 회원가입</h3>
                                <p>간편하게 로그인하고 다양한 혜택을 누려보세요</p>
                            </div>
                            <div className="arrow-icon">
                                <span><RightOutlined /></span>
                            </div>
                        </div>
                    </div>

                    <section className="shopping-section">
                        <h3>창호</h3>
                        <ul>
                            <li>창호 고르는 팁</li>
                        </ul>
                    </section>

                    <Divider />

                    <section className="customer-center-section">
                        <h3>고객센터</h3>
                        <ul>
                            <li onClick={() => window.open("http://pf.kakao.com/_dbxezn", "_blank")}>카카오톡 문의하기</li>
                            <li>공지사항</li>
                        </ul>
                    </section>
                </main>

                <BottomNavigator/>
            </body>
        </>
    )
}

export default MyPage;
