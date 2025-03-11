import React, {useEffect, useRef, useState} from 'react';
import {Button, Col, Form, Input, InputRef, notification, Switch, Tour, TourProps} from "antd";
import SearchAddressPopUp from "../../../../component/SearchAddressPopUp";
import axios from "axios";
import {callFinalSocialSignUp} from "../../../../definition/apiPath";

const LoginSecondStep = () => {

    const [form] = Form.useForm();

    const urlParams = new URLSearchParams(window.location.search);

    const [address, setAddress] = useState("");
    const [addressZoneCode, setAddressZoneCode] = useState("");
    const [remainAddress, setRemainAddress] = useState("");
    const [addressBuildingNum, setAddressBuildingNum] = useState("");
    const [isRemainAddressBlank, setIsRemainAddressBlank] = useState(false);

    const [isPushAlarmOn, setIsPushAlarmOn] = useState(false);

    const [isAddressComplete, setIsAddressComplete] = useState(false);

    const [guideOpen, setGuideOpen] = useState<boolean>(false);
    const addressRef = useRef<InputRef>(null);


    const formFields = [
        { name: ['zipCode'], value: addressZoneCode },
        { name: ['mainAddress'], value: address },
    ];

    useEffect(() => {
        setGuideOpen(true);
    }, [addressRef]);

    const steps: TourProps['steps'] = [
        {
            title: '주소 입력',
            placement: 'bottom',
            description: '터치 해서 주소를 입력해주세요.',
            target: () => addressRef.current?.input as HTMLElement || null,
            closeIcon: null,
            nextButtonProps : {
                children: (
                    <div style={{color: "#4da3ff"}}>닫기</div>
                ),
                style: {
                    backgroundColor: "white",
                    borderRadius: "10%",
                    width: 32,
                    minWidth: 32,
                    height: 32,
                }
            }
        }
    ]

    // 우편번호 검색 후 주소 클릭 시 실행될 함수
    const handleAddress = (data:any) => {
        setAddress(data.address); // 기본 주소
        setAddressZoneCode(data.zonecode); // 우편번호
        setAddressBuildingNum(data.buildingCode); // 빌딩번호
    };

    // 추가 주소 입력 시 처리 함수
    const handleRemainAddressChange = (e: any) => {
        setIsRemainAddressBlank(false);
        setRemainAddress(e.target.value);
    };

    const completeAddress = () => {
        notification.destroy();
        if (!remainAddress) {
            setIsRemainAddressBlank(true);
            return;
        }
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
                    Authorization: localStorage.getItem("hoppang-token") || '',
                }
            }
        )
            .then((res) => {
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

    const openToast = () => {
        notification.open({
            message: '고객님 주소',
            description: (
                <SearchAddressPopUp
                    setAddress={handleAddress}
                />
            ),
            placement: 'bottom',
            closeIcon: <span style={{ fontSize: '16px' }}>X</span>
        });
    };

    const handleAddressStates = () => {
        openToast();
        setGuideOpen(false);
    }


    return (
        <div style={styles.container}>

            <Tour
                type="primary"
                steps={steps}
                open={guideOpen}
                onClose={() => setGuideOpen(false)}
                mask={false}
            />

            <div style={styles.box}>
                {!isAddressComplete && (
                    address === "" ? (
                        <>
                            <h2>고객님 주소 입력</h2>
                            <Input
                                ref={addressRef}
                                onClick={handleAddressStates}
                                style={{width: "160px"}} readOnly
                            />
                        </>
                    ) : (
                        <>
                            <h2>고객님 주소</h2>
                            <br/>
                            <Form form={form} fields={formFields}>
                                <Col>
                                    <Form.Item
                                        name="zipCode"
                                        label=""
                                        style={{marginTop: '-10px'}}
                                        rules={[{required: true, message: '⚠️ 주소는 필수 응답 항목입니다.'}]}
                                    >
                                        <Input
                                            ref={addressRef}
                                            onClick={handleAddressStates}
                                            style={{width: "160px"}} readOnly
                                        />
                                    </Form.Item>
                                </Col>
                                <Col>
                                    <Form.Item
                                        name="mainAddress"
                                    >
                                        <Input
                                            onClick={handleAddressStates}
                                            style={{width: '300px'}}
                                            readOnly
                                        />
                                    </Form.Item>
                                </Col>
                            </Form>
                            <Input
                                placeholder="상세 주소를 입력해주세요"
                                value={remainAddress}
                                onChange={handleRemainAddressChange}
                                style={{
                                    ...styles.input,
                                    borderColor: isRemainAddressBlank ? 'red' : ''
                                }}
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
                                style={{width: '90px'}}
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
        height: '40px',
        marginTop: '10px',
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid #ddd',
    },
    button: {
        fontSize: '20px',
        width: '80px',
        height: '40px',
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
