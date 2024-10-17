import React, {useState} from 'react';
import {Button, Input, Popover, Switch} from "antd";
import SearchAddressPopUp from "../../../../component/SearchAddressPopUp";
import {SearchOutlined} from "@ant-design/icons";
import axios from "axios";
import {callFinalSocialSignUp} from "../../../../definition/apiPath";

const LoginSecondStep = () => {

    const urlParams = new URLSearchParams(window.location.search);

    const [openSearchAddr, setOpenSearchAddr] = useState(false);

    const [address, setAddress] = useState("");
    const [addressZoneCode, setAddressZoneCode] = useState("");
    const [remainAddress, setRemainAddress] = useState("");
    const [addressBuildingNum, setAddressBuildingNum] = useState("");

    const [isPushAlarmOn, setIsPushAlarmOn] = useState(false);

    const [isAddressComplete, setIsAddressComplete] = useState(false);

    // 우편번호 검색 후 주소 클릭 시 실행될 함수
    const handlePostCode = (data:any) => {
        setAddress(data.address); // 기본 주소
        setAddressZoneCode(data.zonecode); // 우편번호
        setAddressBuildingNum(data.buildingCode); // 빌딩번호
    };

    const handleOpenSearchAddrChange = (newOpen: boolean) => {
        setOpenSearchAddr(newOpen);
    };

    // 추가 주소 입력 시 처리 함수
    const handleRemainAddressChange = (e: any) => {
        setRemainAddress(e.target.value);
    };

    const completeAddress = () => {
        setIsAddressComplete(true);
    }

    const signupFinally = () => {
        const userEmail = urlParams.get('userEmail');
        const userPhoneNumber = urlParams.get('phoneNumber');

        axios.put(callFinalSocialSignUp,
            {
                userEmail: userEmail,
                userPhoneNumber: userPhoneNumber,
                address: address,
                subAddress: remainAddress,
                buildingNumber: addressBuildingNum,
                isPushOn: isPushAlarmOn
            },
            {
                withCredentials: true,
                headers: {
                    Authorization: localStorage.getItem("hoppang-admin-token") || '',
                }
            }
        )
            .then((res) => {

                console.log(res.data);
                window.location.href = "/"

            })
            .catch((err) => {
                if (err.response.data.errorCode === 1) {
                    const email = err.response.data.email;
                    const oauthType = err.response.data.oauthType;
                    const message = err.response.data.errorMessage;
                    window.location.href = "/login/duplicate?email=" + email + "&oauthType=" + oauthType + "&message=" + message;
                }
            });
    }


    return (
        <div style={styles.container}>
            <div style={styles.box}>
                {!isAddressComplete && (
                    address === "" ? (
                        <>
                            <h2>주소 선택</h2>
                            <Input addonAfter={
                                (
                                    <Popover
                                        content={
                                            <SearchAddressPopUp
                                                setAddress={handlePostCode}
                                                setOpenSearchAddr={setOpenSearchAddr}
                                            />
                                        }
                                        trigger="click"
                                        open={openSearchAddr}
                                        placement="bottom"
                                        onOpenChange={handleOpenSearchAddrChange}
                                    >
                                        <SearchOutlined onClick={(e) => {
                                            e.preventDefault();
                                        }}/>
                                    </Popover>
                                )
                            } style={{width:"160px"}} readOnly
                            />
                        </>
                    ) : (
                        <>
                            <h2>선택한 주소</h2>
                            <p>주소: {address}</p>
                            <p>우편번호: {addressZoneCode}</p>
                            <Input
                                placeholder="상세 주소를 입력해주세요"
                                value={remainAddress}
                                onChange={handleRemainAddressChange}
                                style={styles.input}
                            />

                            <Button onClick={completeAddress} type="primary" style={styles.button}>확인</Button>
                        </>
                    )
                )}

                {isAddressComplete &&
                    <>
                        <h2>푸시알람 여부</h2>
                        <div>
                            <Switch
                                checkedChildren="ON"
                                unCheckedChildren="OFF"
                                defaultChecked
                                style={{ width: '90px' }}
                                onChange={setIsPushAlarmOn}
                            />
                        </div>
                        <Button onClick={signupFinally} type="primary" style={styles.button1}>회원가입</Button>
                    </>
                }
            </div>
        </div>
    );
}


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
    input: {
        fontSize: '16px',
        width: '50%',
        height: '50px',
        marginTop: '10px',
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid #ddd',
    },
    button: {
        fontSize: '20px',
        width: '80px',
        height: '50px',
        borderRadius: '10px',
        marginTop: '10px'
    },
    button1: {
        fontSize: '15px',
        width: '80px',
        height: '40px',
        borderRadius: '10px',
        marginTop: '50px'
    }
};
export default LoginSecondStep;
