import React, {useEffect, useState} from 'react';
import './styles.css';
import BottomNavigator from "../../../component/BottomNavigator";
import { Divider } from 'antd';
import { RightOutlined } from '@ant-design/icons';
import useSWR from "swr";
import {callMeData} from "../../../definition/apiPath";
import fetcher from "../../../util/fetcher";
import OverlayLoadingPage from "../../../component/Loading/OverlayLoadingPage";

const useResponsiveStyles = () => {

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

    return styles;
}

const MyPage = () => {

    const { data: userData, error, mutate } = useSWR(callMeData, fetcher, {
        dedupingInterval: 2000
    });

    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setLoading(true);

        if (userData) {
            setIsLoggedIn(true);
            setLoading(false);
        } else {
            setIsLoggedIn(false);
            setLoading(false);
        }

        const handlePopState = () => {
            const currentUrl = window.location.href;
            const targetPattern = /^https:\/\/hoppang\.store\/.*\/chassis\/calculator\?code=.*$/;

            if (targetPattern.test(currentUrl)) {
                window.location.replace("https://hoppang.store/chassis/calculator");
            }
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, [userData]);

    const goToEstimationHistory = () => {
        mutate().then(() => {
            window.location.href = '/mypage/estimation/histories';
        })
    }


    const styles = useResponsiveStyles();

    return(
        <>
            { loading && <OverlayLoadingPage word={"처리중"}/> }

            <div style={styles.container}>
                <div style={styles.box}>
                    <body style={{marginTop: 40}}>
                        <header className="header">
                            <div className="icons">
                                <h2><img src="/assets/hoppang-character32x32.png" alt="myPage Icon"/> 마이</h2>
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
                                <div className="login-text">
                                    <div>
                                        <strong>{userData.name}</strong> 님 안녕하세요 👋🏻
                                    </div>
                                </div>
                            }

                            {userData &&
                                <>
                                    <Divider />
                                    <section className="chassis-section">
                                        <h3>창호</h3>
                                        <ul>
                                            <li onClick={goToEstimationHistory}>
                                                견적 이력
                                            </li>
                                        </ul>
                                    </section>
                                </>
                            }

                            {/*<Divider />*/}

                            {/*<section className="customer-center-section">*/}
                            {/*    <h3>고객센터</h3>*/}
                            {/*    <ul>*/}
                            {/*        <li onClick={() => window.open("https://pf.kakao.com/_dbxezn", "_blank")}>카카오톡 문의하기</li>*/}
                            {/*/!*        <li>공지사항</li>*!/*/}
                            {/*    </ul>*/}
                            {/*</section>*/}
                        </main>

                    </body>
                </div>
                <BottomNavigator/>
            </div>
        </>
    )
}

export default MyPage;
