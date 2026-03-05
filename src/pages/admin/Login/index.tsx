import React from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from "axios";
import {loginAPI} from "../../../definition/Admin/apiPath";
import {setSafeToken} from "../../../util/security";

// 레이아웃 설정
const layout = {
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
};

// 버튼 레이아웃 설정
const tailLayout = {
    wrapperCol: { offset: 8, span: 16 },
};

// 관리자 로그인 후 이동할 기본 경로 (상수로 관리)
const ADMIN_DEFAULT_REDIRECT = '/admin/essentials/info';

const LoginPage = () => {

    const [messageApi, contextHolder] = message.useMessage();


    // 폼 제출 시 실행될 함수
    const submitLogin = (values: { username: string; password: string }) => {

        const formData = new FormData();
        formData.append("username", values.username);
        formData.append("password", values.password);

        axios.post(loginAPI, formData, {
                withCredentials: true,
            },
        )
            .then((response) => {

                const token = response.headers['authorization'];

                if (token) {
                    setSafeToken("hoppang-admin-token", token);
                }

                // 상수로 정의된 안전한 경로로만 리다이렉트
                window.location.href = ADMIN_DEFAULT_REDIRECT;

            })
            .catch((error) => {
                if (error.response?.status === 401) {
                    errorModal('아이디나 비밀번호를 다시 확인해주세요.');
                } else {
                    errorModal('로그인 중 오류가 발생했습니다.');
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
    const loginFailed = (errorInfo: unknown) => {
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
