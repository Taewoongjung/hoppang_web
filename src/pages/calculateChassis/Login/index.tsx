import React from 'react';
import '../styles.css';
import axios from "axios";
import {LeftOutlined} from "@ant-design/icons";
import {appleLogin, kakaoLogin} from "../../../definition/apiPath";


const Login = () => {

    const urlParams = new URLSearchParams(window.location.search);

    const handleKakaoLogin = () => {
        const callLogin = async () => {
            axios.get(kakaoLogin)
                .then((res) => {
                    window.location.href = res.data;
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

                {urlParams.get('needed') === 'true' && "로그인을 하고 창호 가격 정보를 알아보세요"}

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
