import React, {useEffect, useState} from 'react';
import '../styles.css';
import axios from "axios";
import {LeftOutlined} from "@ant-design/icons";
import {kakaoLogin} from "../../../definition/apiPath";


const Login = () => {

    const [kakaoFirstLoginReqUrl, setKakaoFirstLoginReqUrl] = useState('');

    const handleKakaoLogin = () => {
        const callLogin = async () => {
            axios.post(kakaoLogin, {}, {withCredentials: true})
                .then((res) => {
                    setKakaoFirstLoginReqUrl(res.data);
                })
                .catch((err) => {
                    console.log("카카오 로그인 에러 = ", err);
                })
        }

        callLogin();
    };

    useEffect(() => {
        if (kakaoFirstLoginReqUrl) {
            window.location.href = kakaoFirstLoginReqUrl;
        }
    }, [kakaoFirstLoginReqUrl]);

    const handleAppleLogin = () => {
        console.log("애플 로그인 ");
    };


    return (
        <div className="login-container" style={styles.container}>
            <div className="login-box" style={styles.box}>

                {/*뒤로가기*/}
                <LeftOutlined
                    onClick={() => {window.location.href = "/"}}
                    style={{marginRight: '100%', fontSize: '30px', marginBottom: '50px', color: 'blue'}}
                />

                <h2 style={styles.subtitle}>호빵 - 호구빵명 프로젝트</h2>
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
                            background: `url("/assets/kakao_login_large_wide.png") no-repeat center center`,
                            backgroundSize: 'cover'
                        }}
                    />

                    {/*애플 로그인*/}
                    <button
                        onClick={handleAppleLogin}
                        style={{
                            ...styles.button,
                            background: `url("/assets/appleid_button@2x.png") no-repeat center center`,
                            backgroundSize: 'cover',
                            marginTop: "-9px"
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

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
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        width: '100%',
        maxWidth: '600px',
        padding: '400px',
    },
    logo: {
        width: '230px',
        marginBottom: '50px',
    },
    subtitle: {
        fontSize: '26px',
        color: '#666',
    },
    buttonContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '15px',
    },
    button: {
        width: '600px',
        height: '65px',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        overflow: 'hidden',
        borderRadius: '8px',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    },
};

export default Login;
