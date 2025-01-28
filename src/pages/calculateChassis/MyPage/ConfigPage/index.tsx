import React, {useState} from 'react';
import './styles.css';
import {LeftOutlined, RightOutlined} from "@ant-design/icons";
import { Modal } from 'antd';
import axios from 'axios';
import {callMeData, callWithdrawUser} from "../../../../definition/apiPath";
import LoadingPage from 'src/component/Loading/SimpleLoadingPage';

const ConfigPage = () => {

    const urlParams = new URLSearchParams(window.location.search);

    const [loading, setLoading] = useState(false);
    const [withdrawUserModal, setWithdrawUserModal] = useState(false);

    const privacyHandlingRule = () => {
        Modal.info({
            title: '개인정보처리방침',
            content: (
                <iframe
                    src="https://www.freeprivacypolicy.com/live/4a596f6c-7e7d-4b42-b593-5645a2f08453"
                    title="개인정보처리방침"
                    style={{ width: "100%", height: "400px", border: "none" }} // 높이 설정 필요
                ></iframe>
            ),
            onOk() {},
            okText: '확인',
            width: 800,
        });
    };

    const showEngPolicyModal = () => {
        privacyHandlingRule();
    };

    const handleLogOut = () => {
        localStorage.setItem("hoppang-token", 'undefined');

        setLoading(true);

        setTimeout(() => {
            setLoading(false);
            window.location.href = '/';
        }, 2000);
    }

    const handleWithdrawUser = () => {
        let token = localStorage.getItem("hoppang-token");

        if (token) {

            // 모달 창 제거
            setWithdrawUserModal(false)

            const fetchUserData = async () => {
                try {
                    return await axios.get(callMeData, {
                        headers: {
                            withCredentials: true,
                            Authorization: token
                        }
                    });
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            };

            // 로딩창 진입
            setLoading(true);

            fetchUserData().then((userData) => {

                if (userData) {

                    const callWithdrawUserApi = callWithdrawUser.replace('{userId}', userData.data.id);

                    setWithdrawUserModal(false);
                    axios.delete(callWithdrawUserApi, {
                        data: {
                            oauthType: localStorage.getItem("hoppang-login-oauthType")
                        },
                        withCredentials: true,
                        headers: {
                            Authorization: token,
                        }
                    })
                        .then((res) => {
                            setTimeout(() => {
                                setLoading(false);
                                window.location.href = '/';
                            }, 2000);
                        })
                        .catch((err) => {
                            setLoading(false);
                            alert(`[에러 발생] ${err}`);
                        })
                }
            });
        }
    }


    return (
        <>
            { loading && <LoadingPage statement={"로그아웃 처리중"}/> }

            { !loading &&
                <div className="container">
                    <div className="box">
                        <div style={{marginTop: 40}}>
                            <section className="settings-section">
                                <header className="settings-header">
                                    <button className="back-button" onClick={() => {window.location.href = '/mypage';}}><LeftOutlined /></button>
                                    <h2>설정</h2>
                                </header>
                                <ul className="settings-list">
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
                                    {urlParams.get("isLoggedIn") === 'true' &&
                                        <li className="settings-item" onClick={() => {window.location.href = '/mypage/config/app';}}>
                                            <span>앱 관리</span>
                                            <span className="arrow"><RightOutlined /></span>
                                        </li>
                                    }
                                    {urlParams.get("isLoggedIn") === 'true' &&
                                        <>
                                            <li className="settings-item" onClick={() => setWithdrawUserModal(true)}>
                                                <span>회원탈퇴</span>
                                                <span className="arrow"><RightOutlined /></span>
                                            </li>
                                            <li className="settings-item" onClick={handleLogOut}>
                                                <span>로그아웃</span>
                                                <span className="arrow"><RightOutlined /></span>
                                            </li>
                                        </>
                                    }
                                </ul>
                            </section>

                            <Modal
                                title="정말로 탈퇴 하시겠습니까?"
                                centered
                                open={withdrawUserModal}
                                onOk={handleWithdrawUser}
                                okText={"동의"}
                                cancelText={"취소"}
                                onCancel={() => setWithdrawUserModal(false)}
                            >
                                <p>회원 탈퇴 후 모든 유저 데이터가 사라지게 됩니다. 그래도 하시겠습니까?</p>
                            </Modal>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}

export default ConfigPage;
