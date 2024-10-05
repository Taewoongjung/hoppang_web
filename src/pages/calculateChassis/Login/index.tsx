import React from 'react';
import '../styles.css';
import axios from "axios";

const API_URL = process.env.REACT_APP_HOPPANG_APP_REQUEST_API_URL;
const KAKAO_REST_API_KEY = process.env.REACT_APP_REST_API_KEY;

const Login = () => {

    const REST_API_KEY = "da09bfccea21381b988c8ede053a85c5";
    // const REDIRECT_URI = "http://localhost:7070/api/kakao/signup";
    const REDIRECT_URI = "http://localhost:3000/chassis/calculator";

    const handleKakaoLogin = () => {
        // window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    };

    const handleAppleLogin = () => {
        console.log("애플 로그인 = ", API_URL);
        console.log("key = ", KAKAO_REST_API_KEY);
    };

    return (
        <div className="login-container" style={styles.container}>
            <div className="login-box" style={styles.box}>

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
                            background: `url("/assets/kakao_login_medium_wide.png") no-repeat center center`,
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
        height: '100vh',
        backgroundColor: '#f5f5f5',
    },
    box: {
        backgroundColor: '#fff',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        textAlign: 'center',
        width: '100%',
        maxWidth: '400px',
    },
    title: {
        fontSize: '28px',
        marginBottom: '10px',
        color: '#333',
        fontWeight: 'bold',
    },
    logo: {
        width: '100px', // 로고 크기 조정
        marginBottom: '50px',
    },
    subtitle: {
        fontSize: '16px',
        color: '#666',
        // marginBottom: '50px',
    },
    buttonContainer: {
        display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column',
        gap: '15px',
    },
    button: {
        width: '300px',
        height: '45px',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        overflow: 'hidden',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    },
};


export default Login;
