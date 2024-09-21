import React, {useState} from 'react';
import {Button, Col, Form, Input, InputNumber, InputNumberProps, Row} from "antd";

const layout = {
    labelCol: { span: 180 },
    wrapperCol: { span: 1600 },
};

// 버튼 레이아웃 설정
const tailLayout = {
    wrapperCol: { offset: 80, span: 160 },
};

const AddAndReviseChassisInfo = () => {

    const [price, setPrice] = useState('');

    const addAndReviseChassisInfo = (values: any) => {

        console.log("width = ", values.width);
        console.log("height = ", values.height);
        console.log("price = ", values.price);

    }

    const addAndReviseChassisInfoFailed = (errorInfo: any) => {
        console.log('Failed:', errorInfo);
    };

    const addCommasToNumber = (number: any): string | undefined => {
        return number?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };


    const onChange: InputNumberProps['onChange'] = (value) => {
        console.log('changed', value);
    };

    return (
        <>
            <div style={{ maxWidth: '700px', margin: '22px auto', padding: '20px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
                <Row justify="center">
                    <Col span={24}>
                        <Form
                            {...layout}
                            name="login"
                            initialValues={{ remember: true }}
                            onFinish={addAndReviseChassisInfo}
                            onFinishFailed={addAndReviseChassisInfoFailed}
                        >
                            <Row justify="center" gutter={9}>
                                <Col span={5}>
                                    <Form.Item
                                        label="너비"
                                        name="width"
                                        rules={[{ required: true, message: '너비는 필수값' }]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={5}>
                                    <Form.Item
                                        label="높이"
                                        name="height"
                                        rules={[{ required: true, message: '높이는 필수값' }]}
                                    >
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item
                                        label="가격"
                                        name="price"
                                        rules={[{ required: true, message: '가격은 필수값' }]}
                                    >
                                        <InputNumber<number>
                                            defaultValue={0}
                                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={(value) => value?.replace(/\$\s?|(,*)/g, '') as unknown as number}
                                            onChange={onChange}
                                        />
                                    </Form.Item>
                                </Col>
                                <Col >
                                    <Form.Item {...tailLayout}>
                                        <Button type="primary" htmlType="submit">
                                            변경
                                        </Button>
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Form>
                    </Col>
                </Row>
            </div>
        </>
    );
}

export default AddAndReviseChassisInfo;
