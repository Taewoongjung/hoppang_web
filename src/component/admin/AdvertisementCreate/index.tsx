import React, { useRef, useState } from 'react';
import {Divider, InputRef, Select, Space, Input, Button, Typography, Layout, Col, Row} from 'antd';
import {PlusOutlined, CaretRightOutlined} from "@ant-design/icons";
import {v4 as uuidv4} from 'uuid';

const { Content } = Layout;

const { Text } = Typography;

const AdvertisementCreate = () => {

    let index = 0;

    const [items, setItems] = useState(['네이버카페', '인스타']);
    const [name, setName] = useState('');
    const inputRef = useRef<InputRef>(null);

    const [targetUrl, setTargetUrl] = useState('');
    const [uuidOfTargetUrl, setUuidOfTargetUrl] = useState('');

    const [generatedUrl, setGeneratedUrl] = useState('');


    const resetGeneratedUrl = () => {
        setGeneratedUrl('');
        setUuidOfTargetUrl('');
    }

    const generateAdUrl = () => {
        if (!generatedUrl) {
            const uuid = uuidv4();

            if (uuid) {
                setUuidOfTargetUrl(uuid);
                setGeneratedUrl(`https://hoppang.store/official?adv_id=${uuid}`);
            }
        }
    }

    const onNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
    };

    const addItem = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        e.preventDefault();
        setItems([...items, name || `New item ${index++}`]);
        setName('');
        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    };

    return (
        <>
            <Typography.Title level={1} style={{marginBottom: '4%'}}>
                광고용 URL 생성
            </Typography.Title>

            <Content>
                <Row style={{display: 'flex', height: '100%'}}>
                    <Col span={4} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <span style={{fontSize: '15px', fontWeight: 'bolder'}}>광고 타겟 플랫폼 :</span>
                    </Col>
                    <Col>
                        <Select
                            style={{width: 280}}
                            placeholder="광고 플랫폼 설정 (네이버카페, 인스타 등..)"
                            dropdownRender={(menu) => (
                                <>
                                    {menu}
                                    <Divider style={{margin: '8px 0'}}/>
                                    <Space style={{padding: '0 8px 4px'}}>
                                        <Input
                                            placeholder="그 외 기타 입력"
                                            ref={inputRef}
                                            value={name}
                                            onChange={onNameChange}
                                            onKeyDown={(e) => e.stopPropagation()}
                                        />
                                        <Button type="text" icon={<PlusOutlined/>} onClick={addItem}>
                                            추가
                                        </Button>
                                    </Space>
                                </>
                            )}
                            options={items.map((item) => ({label: item, value: item}))}
                        />
                    </Col>
                </Row>

                <div style={{margin: '24px 0'}}/>

                <Row style={{display: 'flex', height: '100%'}}>
                    <Col span={4} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <span style={{fontSize: '15px', fontWeight: 'bolder'}}>광고 할 주소 (url):</span>
                    </Col>
                    <Col>
                        <Input onChange={() => setTargetUrl}/>
                    </Col>
                </Row>

                <div style={{margin: '24px 0'}}/>

                {generatedUrl ?
                    <Button
                        type="primary"
                        onClick={resetGeneratedUrl}
                    >
                        다시생성하기
                    </Button>
                    :
                    <Button
                        type="primary"
                        onClick={generateAdUrl}
                    >
                        생성하기
                    </Button>
                }

                <div style={{margin: '30px 0'}}/>

                {generatedUrl &&
                    <>
                        <CaretRightOutlined/>
                        <Text copyable={{text: generatedUrl}}>
                            {generatedUrl}
                        </Text>
                    </>
                }
            </Content>
        </>
    );
};


export default AdvertisementCreate;
