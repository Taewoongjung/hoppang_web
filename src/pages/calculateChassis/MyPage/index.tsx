import React, {useEffect, useState} from 'react';
import './styles.css';
import BottomNavigator from "../../../component/BottomNavigator";
import { Divider } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import useSWR from "swr";
import {callMeData} from "../../../definition/apiPath";
import fetcher from "../../../util/fetcher";

const MyPage = () => {

    const { data: userData, error, mutate } = useSWR(callMeData, fetcher, {
        dedupingInterval: 2000
    });

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        if (userData) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    }, [userData]);


    return(
        <>
            <div style={styles.container}>
                <div style={styles.box}>
                    <body style={{marginTop: 40}}>
                        <header className="header">
                            <div className="icons">
                                <h2>마이</h2>
                            </div>
                            <div className="settings-icon" onClick={() => {window.location.href = `/mypage/config?isLoggedIn=${isLoggedIn}`;}}>
                                <img src="/assets/MyPage/config-icon.png" alt="Home" style={{width:23, height:23}}/>
                        ️   </div>
                        </header>

                        <main>
                            {!userData &&
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
                            }
                            {userData &&
                                <div className="login-box">
                                    <div className="login-text">
                                        {userData.name} 님 안녕하세요.
                                    </div>
                                </div>
                            }

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
                                    <li onClick={() => window.open("https://pf.kakao.com/_dbxezn", "_blank")}>카카오톡 문의하기</li>
                                    <li>공지사항</li>
                                </ul>
                            </section>
                        </main>

                    </body>
                </div>
                <BottomNavigator/>
            </div>
        </>
    )
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        width: '100%',
        height: '100vh',
    },
    box: {
        borderRadius: '15px',
        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '700px',
        padding: '60px',
    }
}

export default MyPage;
