import React from 'react';
import './styles.css';

const DuplicateLoginPage = () => {

    const urlParams = new URLSearchParams(window.location.search);

    return (
        <>
            <div className="container">
                <div className="content">
                    <div className="logo">
                        {urlParams.get("oauthType") === '카카오' &&
                            <img src="/assets/Sso/kakao-logo.png" alt="Kakao Logo"/>
                        }
                        {urlParams.get("oauthType") === '애플' &&
                            <img src="/assets/Sso/apple-logo.png" alt="Kakao Logo"/>
                        }
                        {urlParams.get("oauthType") === '구글' &&
                            <img src="/assets/Sso/google-logo.png" alt="Kakao Logo"/>
                        }
                    </div>
                    <p>{urlParams.get("oauthType")}</p>

                    {urlParams.get("oauthType") !== 'APL' &&
                        <div className="email">
                            <span>{urlParams.get("email")}</span>
                        </div>
                    }

                    <p>{urlParams.get("message")}</p>
                </div>
                <div className="login-button">
                    <a href="/login">로그인으로 이동</a>
                </div>
            </div>
        </>
    )
}

export default DuplicateLoginPage;
