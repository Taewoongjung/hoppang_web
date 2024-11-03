import React, {useState} from 'react';
import './styles.css';
import {LeftOutlined, RightOutlined} from "@ant-design/icons";
import { Modal } from 'antd';
import LoadingPage from "../../../../component/LoadingPage";

const ConfigPage = () => {

    const urlParams = new URLSearchParams(window.location.search);

    const [loading, setLoading] = useState(false);
    const [isShowEngPolicyModalOpen, setIsShowEngPolicyModalOpen] = useState(false);

    const showEngPolicyModal = () => {
        setIsShowEngPolicyModalOpen(true);
    };

    const handleEngPolicyOk = () => {
        setIsShowEngPolicyModalOpen(false);
    };

    const handleEngPolicyCancel = () => {
        setIsShowEngPolicyModalOpen(false);
    };

    const handleLogOut = () => {
        localStorage.setItem("hoppang-token", 'undefined');

        setLoading(true);
        
        setTimeout(() => {
            setLoading(false);
            window.location.href = '/';
        }, 3000);
    }


    return (
        <>
            <div className="container">
                { loading && <LoadingPage/> }
                <div className="box">
                    <div style={{marginTop: 40}}>
                        <section className="settings-section">
                            <header className="settings-header">
                                <button className="back-button" onClick={() => {window.location.href = '/mypage';}}><LeftOutlined /></button>
                                <h2>설정</h2>
                            </header>
                            <ul className="settings-list">
                                <li className="settings-item">
                                    <span>서비스 이용약관</span>
                                    <span className="arrow"><RightOutlined /></span>
                                </li>
                                <li className="settings-item" onClick={showEngPolicyModal}>
                                    <span>개인정보 처리방침</span>
                                    <span className="arrow"><RightOutlined /></span>
                                </li>
                                {urlParams.get("isLoggedIn") === 'false' &&
                                    <li className="settings-item" onClick={() => {window.location.href = '/login';}}>
                                        <span>회원가입</span>
                                        <span className="arrow"><RightOutlined /></span>
                                    </li>
                                }
                                <li className="settings-item" onClick={() => {window.location.href = '/mypage/config/app';}}>
                                    <span>앱 관리</span>
                                    <span className="arrow"><RightOutlined /></span>
                                </li>
                                <li className="settings-item">
                                    <span>회원탈퇴</span>
                                    <span className="arrow"><RightOutlined /></span>
                                </li>
                                <li className="settings-item" onClick={handleLogOut}>
                                    <span>로그아웃</span>
                                    <span className="arrow"><RightOutlined /></span>
                                </li>
                            </ul>
                        </section>




                        <Modal title="Basic Modal" open={isShowEngPolicyModalOpen} onOk={handleEngPolicyOk} onCancel={handleEngPolicyCancel}>
                            <strong>Terms &amp; Conditions</strong><br/>
                            <p>These terms and conditions apply to the Hoppang app (hereby referred to as "Application") for mobile devices that was created by (hereby referred to as "Service Provider") as a Free service.</p>
                            <br/>
                            <p>Upon downloading or utilizing the Application, you are automatically agreeing to the following terms...</p>
                            <div>
                                <p>Please note that the Application utilizes third-party services that have their own Terms and Conditions. Below are the links to the Terms and Conditions of the third-party service providers used by the Application:</p>
                                <ul>
                                    <li><a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">Google Play Services</a></li>
                                    <li><a href="https://expo.io/terms" target="_blank" rel="noopener noreferrer">Expo</a></li>
                                </ul>
                            </div>
                            <br/>
                            <p>The Service Provider may wish to update the application at some point...</p>
                            <br/>
                            <strong>Changes to These Terms and Conditions</strong>
                            <p>The Service Provider may periodically update their Terms and Conditions...</p>
                            <br/>
                            <strong>Contact Us</strong>
                            <p>If you have any questions or suggestions about the Terms and Conditions, please do not hesitate to contact the Service Provider at aipooh8882@naver.com.</p>
                            <hr/>
                            <p>This Terms and Conditions page was generated by <a href="https://app-privacy-policy-generator.nisrulz.com/" target="_blank" rel="noopener noreferrer">App Privacy Policy Generator</a></p>
                        </Modal>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ConfigPage;
