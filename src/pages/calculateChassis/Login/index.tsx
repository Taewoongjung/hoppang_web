import React from 'react';
import {Select} from "antd";
import companyTypeOptions from "../../../definition/companyType";
import '../styles.css';
const Login = () => {

    const REST_API_KEY = "da09bfccea21381b988c8ede053a85c5";

    const REDIRECT_URI = "http://localhost:3000"

    const handleKakaoLogin = () => {
        window.location.href = `https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`;
    };

    const handleAppleLogin = () => {
        console.log("애플 로그인");
    };

    return (
        <>
            <div className="app">
                <main className="app-main">
                    <table>
                        <tbody>
                            <tr>
                                <td colSpan={2}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <button
                                            onClick={handleKakaoLogin}
                                            style={{
                                                background: `url("/assets/kakao_login_medium_wide.png") no-repeat center center`,
                                                backgroundSize: 'cover',
                                                width: '300px', // 이미지의 실제 너비로 조정하세요
                                                height: '45px', // 이미지의 실제 높이로 조정하세요
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: 0,
                                                overflow: 'hidden',
                                                textIndent: '-9999px' // 버튼 텍스트 숨기기
                                            }}
                                        >
                                            카카오 로그인
                                        </button>

                                        <button
                                            onClick={handleAppleLogin}
                                            style={{
                                                background: `url("/assets/appleid_button@2x.png") no-repeat center center`,
                                                backgroundSize: 'cover',
                                                width: '300px', // 이미지의 실제 너비로 조정하세요
                                                height: '45px', // 이미지의 실제 높이로 조정하세요
                                                border: 'none',
                                                cursor: 'pointer',
                                                padding: 0,
                                                overflow: 'hidden',
                                                textIndent: '-9999px' // 버튼 텍스트 숨기기
                                            }}
                                        >
                                            애플 로그인
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </main>
            </div>
        </>
    );
}

export default Login;
