import React from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from "axios";
import {loginAPI} from "../../../definition/Admin/apiPath";

// 레이아웃 설정
const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};

// 버튼 레이아웃 설정
const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
};


const LoginPage = () => {

    const [messageApi, contextHolder] = message.useMessage();


    // 폼 제출 시 실행될 함수
    const submitLogin = (values: any) => {

        const formData = new FormData();
        formData.append("username", values.username);
        formData.append("password", values.password);

        axios.post(loginAPI, formData, {
                withCredentials: true,
            },
        )
            .then((response) => {

                const token = response.headers['authorization'];

                localStorage.setItem("hoppang-admin-token", token); // 로그인 성공 시 로컬 스토리지에 토큰 저장

                window.location.href = '/admin/essentials/info'; // 이 방법은 페이지를 새로고침하며 새로운 URL로 이동합니다.

            })
            .catch((error) => {
                if (error.response.status === 401) {
                    errorModal('아이디나 비밀번호를 다시 확인해주세요.');
                }
            });
    }

    const errorModal = (errorMsg:string) => {
        messageApi.open({
            type: 'error',
            content: errorMsg
        });
    };

    // 폼 제출 실패 시 실행될 함수
    const loginFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    return (
        <>
            {contextHolder}
            <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
                <h2 style={{ textAlign: 'center' }}>Login</h2>
                <Form
                    {...layout}
                    name="login"
                    initialValues={{ remember: true }}
                    onFinish={submitLogin}
                    onFinishFailed={loginFailed}
                >
                    <Form.Item
                        label="아이디"
                        name="username"
                        rules={[{ required: true, message: '아이디는 필수입니다' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="비밀번호"
                        name="password"
                        rules={[{ required: true, message: '비밀번호는 필수입니다' }]}
                    >
                        <Input.Password />
                    </Form.Item>

                    <Form.Item {...tailLayout}>
                        <Button type="primary" htmlType="submit">
                            Login
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </>
    );
};

export default LoginPage;
