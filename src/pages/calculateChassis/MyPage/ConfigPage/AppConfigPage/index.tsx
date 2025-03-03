import React, {useEffect, useState} from 'react';
import '../styles.css';
import {LeftOutlined} from "@ant-design/icons";
import {Switch} from "antd";
import {callMeData, callReviseUserConfiguration, callUserConfigurationInfo} from "../../../../../definition/apiPath";
import axios from "axios";

const ConfigPage = () => {

    const [userId, setUserId] = useState();
    const [isPushOn, setIsPushOn] = useState<boolean>(false);
    const [isChangingPushOn, setIsChangingPushOn] = useState<boolean>(false);

    const onChangePushAlarm = (isPushOn: boolean) => {

        // @ts-ignore
        const callReviseUserConfigurationApi = callReviseUserConfiguration.replace('{userId}', userId);

        setIsChangingPushOn(true);

        axios.put(callReviseUserConfigurationApi,
            {isPushOn},
            {
            headers: {
                withCredentials: true,
                Authorization: localStorage.getItem("hoppang-token")
            }
        }).then(res => {
            setTimeout(() => {
                setIsChangingPushOn(false);
                setIsPushOn(isPushOn)  // 푸시 알림 변경 후 ON/OFF 여부 설정
            }, 700);
        })
    };

    useEffect(() => {
        let token = localStorage.getItem("hoppang-token");

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

        fetchUserData().then((userData) => {
            if (userData) {
                setUserId(userData.data.id);
                const callUserConfigurationApi = callUserConfigurationInfo.replace('{userId}', userData.data.id);
                axios.get(callUserConfigurationApi, {
                    headers: {
                        withCredentials: true,
                        Authorization: token
                    }
                })
                    .then((res) => {
                        setUserId(userData.data.id); // userId 설정
                        setIsPushOn(res.data.isPushOn); // 푸시 알림 ON/OFF 여부 설정
                    })
                    .catch((error) => {
                        console.error("Error fetching user configuration:", error);
                    });
            }
        });

    }, []); // 의존성 배열에서 `isPushOn` 제거

    return (
        <>
            <div className="container">
                <div className="box">
                    <div style={{marginTop: 40}}>
                        <section className="settings-section">
                            <header className="settings-header">
                                <button className="back-button" onClick={() => {window.location.href = '/mypage/config?isLoggedIn=true';}}><LeftOutlined /></button>
                                <h2>앱 관리</h2>
                            </header>

                            <ul className="settings-list">
                                <li className="settings-item">
                                    <span>푸시 알림</span>
                                    <span className="arrow"><Switch checked={isPushOn} onChange={onChangePushAlarm} loading={isChangingPushOn} /></span>
                                </li>
                            </ul>

                        </section>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ConfigPage;
