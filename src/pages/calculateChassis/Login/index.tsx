import React, {useEffect, useState} from 'react';
import '../styles.css';
import axios from "axios";
import {LeftOutlined} from "@ant-design/icons";
import {appleLogin, googleLogin, kakaoLogin} from "../../../definition/apiPath";

declare global {
    interface Window {
        ReactNativeWebView?: {
            postMessage(message: string): void;
        };
    }
}

const useResponsiveStyles = () => {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = windowWidth <= 700;

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
            textAlign: 'center',
            width: '100%',
            maxWidth: isMobile ? '550px' : '700px',
            padding: isMobile ? '40px' : '60px',
            height: isMobile ? '600px' : undefined
        },
        logo: {
            width: isMobile ? '150px' : '280px',
            marginBottom: isMobile ? '20px' : '60px',
        },
        subtitle: {
            fontSize: isMobile ? '15px' : '30px',
            color: '#666',
            marginBottom: isMobile ? '20px' : '40px',
        },
        buttonContainer: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: isMobile ? '15px' : '20px',
        },
        button: {
            width: isMobile ? '100%' : '500px',
            height: '70px',
            border: 'none',
            padding: 0,
            overflow: 'hidden',
            borderRadius: '10px',
        },
    };

    return styles;
};


const Login = () => {

    const urlParams = new URLSearchParams(window.location.search);

    const handleKakaoLogin = () => {
        const callLogin = async () => {
            axios.get(kakaoLogin)
                .then((res) => {
                    if (window.ReactNativeWebView) {
                        // 리액트 네이티브 웹뷰 환경
                        window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: 'KKOLoginRequest',
                            data: res.data
                        }));
                    } else {
                        // 일반 웹 브라우저 환경
                        console.log('Not in React Native WebView');
                    }
                });
        }

        callLogin();
    };

    const handleAppleLogin = () => {
        const callLogin = async () => {
            axios.get(appleLogin)
                .then((res) => {
                    window.location.href = res.data;
                });
        }

        callLogin();
    };

    const handleGoogleLogin = () => {
        const callLogin = async () => {
            axios.get(googleLogin)
                .then((res) => {
                    window.location.href = res.data;
                })
        }

        callLogin();
    }


    const styles = useResponsiveStyles();

    return (
        <div className="login-container" style={styles.container}>
            <div className="login-box" style={styles.box}>

                {/*뒤로가기*/}
                <LeftOutlined
                    onClick={() => {window.location.href = "/mypage"}}
                    style={{marginRight: '100%', fontSize: '40px', marginBottom: '50px', color: 'blue'}}
                />

                <h2 style={styles.subtitle}>호빵 - 호구빵명 프로젝트</h2>
                {urlParams.get('needed') === 'true' && <div style={{marginBottom:20, fontWeight: "bold"}}>로그인을 하고 창호 가격 정보를 알아보세요</div>}

                {/* 회사 로고 */}
                <img
                    src="/assets/hoppang-character.png"
                    alt="Hoppang Logo"
                    style={styles.logo}
                />

                <div style={styles.buttonContainer}>

                    {/*카카오 로그인*/}
                    <button
                        onClick={handleKakaoLogin}
                        style={{
                            ...styles.button,
                            background: `url("/assets/kakao_login_large_narrow.png") no-repeat center center`,
                            backgroundSize: 'cover',
                            backgroundColor: 'yellow'
                        }}
                    />

                    {/*애플 로그인*/}
                    <button
                        onClick={handleAppleLogin}
                        style={{
                            ...styles.button,
                            background: `url("/assets/appleid_button@2x.png") no-repeat center center`,
                            backgroundSize: 'cover',
                            backgroundColor: 'black',
                            marginTop: "-9px"
                        }}
                    />

                    {/*구글 로그인*/}
                    <button
                        onClick={handleGoogleLogin}
                        style={{
                            ...styles.button,
                            background: `url("/assets/google_login.png") no-repeat center center`,
                            backgroundSize: 'cover',
                            marginTop: "-9px",
                            border: '1px solid black'
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export default Login;
