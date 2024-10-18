import React from 'react';
import '../styles.css';
import axios from "axios";
import {LeftOutlined} from "@ant-design/icons";
import {kakaoLogin} from "../../../definition/apiPath";


const Login = () => {

    const handleKakaoLogin = () => {
        const callLogin = async () => {
            axios.post(kakaoLogin, {}, {withCredentials: true})
                .then((res) => {
                    console.log("All headers:", res.headers);
                    console.log("Authorization header:", res.headers['authorization']);
                    const token = res.headers['authorization'];
                    localStorage.setItem("hoppang-token", token); // 로그인 성공 시 로컬 스토리지에 토큰 저장

                    window.location.href = res.data;
                })
                .catch((err) => {
                })
        }

        callLogin();
    };

    const handleAppleLogin = () => {
        console.log("애플 로그인 ");
        window.location.href = 'https://appleid.apple.com/auth/authorize?response_type=code' +
            '&client_id=NUDBF8SVWU' +
            '&redirect_uri=https://hoppang.store/login/first';
    };


    return (
        <div className="login-container" style={styles.container}>
            <div className="login-box" style={styles.box}>

                {/*뒤로가기*/}
                <LeftOutlined
                    onClick={() => {window.location.href = "/mypage"}}
                    style={{marginRight: '100%', fontSize: '40px', marginBottom: '50px', color: 'blue'}}
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
        borderRadius: '15px',
        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        width: '100%',
        maxWidth: '700px',
        padding: '60px',
    },
    logo: {
        width: '280px',
        marginBottom: '60px',
    },
    subtitle: {
        fontSize: '30px',
        color: '#666',
        marginBottom: '40px',
    },
    buttonContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '20px',
    },
    button: {
        width: '500px',
        height: '70px',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        overflow: 'hidden',
        borderRadius: '10px',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    },
};

export default Login;
