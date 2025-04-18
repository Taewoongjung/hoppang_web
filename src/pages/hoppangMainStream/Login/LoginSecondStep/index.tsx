import React, {useState} from 'react';
import {Button, Switch} from "antd";
import axios from "axios";
import {callFinalSocialSignUp} from "../../../../definition/apiPath";

const LoginSecondStep = () => {

    const urlParams = new URLSearchParams(window.location.search);

    const [isPushAlarmOn, setIsPushAlarmOn] = useState(false);


    const signupFinally = () => {
        const userEmail = urlParams.get('userEmail');
        const userPhoneNumber = urlParams.get('phoneNumber');

        axios.put(callFinalSocialSignUp,
            {
                userEmail: userEmail,
                userPhoneNumber: userPhoneNumber,
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


    return (
        <div style={styles.container}>

            <div style={styles.box}>
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
