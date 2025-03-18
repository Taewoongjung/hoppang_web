import React, { useState } from 'react';
import {Select, Input, Button, Typography, Layout, Col, Row} from 'antd';
import {CaretRightOutlined} from "@ant-design/icons";
import {v4 as uuidv4} from 'uuid';
import {createAdvertisementContent} from "../../../../definition/Admin/apiPath";
import axios from 'axios';
import {formatDateTime} from "../../../../util";

const { Content } = Layout;
const { TextArea } = Input;
const { Text } = Typography;

const AdvertisementCreate = () => {

    const items = ['네이버카페', '인스타'];

    const [targetPlatform, setTargetPlatform] = useState<string | undefined>();
    const [targetUrl, setTargetUrl] = useState<string>('');
    const [generatedUrl, setGeneratedUrl] = useState('');

    const [errorMessages, setErrorMessages] = useState<{ targetPlatform?: string; targetUrl?: string }>({});
    const [customMemo, setCustomMemo] = useState('');


    const allStatesReset = () => {
        setTargetPlatform(undefined);
        setTargetUrl('');
        setGeneratedUrl('');
        setCustomMemo('');
    }

    const validateInputs = () => {
        const errors: { targetPlatform?: string; targetUrl?: string } = {};

        if (!targetPlatform) errors.targetPlatform = "광고 타겟 플랫폼을 선택해주세요.";
        if (!targetUrl.trim()) errors.targetUrl = "광고 할 주소를 입력해주세요.";

        setErrorMessages(errors);

        return Object.keys(errors).length === 0;
    };

    const resetGeneratedUrl = () => {
        allStatesReset();
    }

    const generateAdUrl = async () => {
        if (!validateInputs()) return;
        if (!generatedUrl) {
            const uuid = uuidv4();

            if (uuid) {
                createContent(uuid);
                setGeneratedUrl(`https://hoppang.store/official?adv_id=${uuid}`);
            }
        }
    }

    const createContent = (uuidOfTargetUrl: any) => {

        const now = new Date();
        const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
        const koreaTimeDiff = 9 * 60 * 60 * 1000;
        const korNow = new Date(utc+koreaTimeDiff);

        axios.post(createAdvertisementContent,
            {
                advId: uuidOfTargetUrl,
                targetPlatform: targetPlatform,
                memo: createMemo(targetPlatform),
                startedAt: formatDateTime(korNow)
            },
            {
                withCredentials: true,
                headers: {
                    Authorization: localStorage.getItem("hoppang-admin-token"),
                }
            }).then((res) => {})
            .catch((err) => {console.error("생성중 에러 발생 = ", err)})
    }

    const createMemo = (targetPlatform: any) => {

        if (!customMemo) {
            return targetPlatform + " - " + targetUrl;
        }

        return customMemo;
    }

    const handlePlatformChange = (value: string) => {
        setTargetPlatform(value);
        setErrorMessages((prev) => ({ ...prev, targetPlatform: undefined }));
    };

    const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTargetUrl(event.target.value);
        setErrorMessages((prev) => ({ ...prev, targetUrl: undefined }));
    };



    return (
        <>
            <Typography.Title level={1} style={{marginBottom: '2%'}}>
                광고용 URL 생성
            </Typography.Title>

            <Content>
                <Row style={{display: 'flex', height: '100%'}}>
                    <div style={{fontSize: '20px', fontWeight: 'bolder'}}>
                        광고 타겟 플랫폼 :
                        <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
                    </div>
                </Row>
                <Row>
                        <Select
                            style={{width: 280}}
                            placeholder="광고 플랫폼 설정 (네이버카페, 인스타 등..)"
                            value={targetPlatform}
                            options={items.map((item) => ({ label: item, value: item }))}
                            onChange={handlePlatformChange}
                        />
                        <br/>
                        {errorMessages.targetPlatform && <Text type="danger">{errorMessages.targetPlatform}</Text>}
                </Row>

                <div style={{margin: '24px 0'}}/>

                <Row style={{display: 'flex', height: '100%'}}>
                    <span style={{fontSize: '20px', fontWeight: 'bolder'}}>
                        광고 할 주소 (url) :
                        <span style={{ color: 'red', marginLeft: '4px' }}>*</span>
                    </span>
                </Row>
                <Row>
                    <Input
                        placeholder={"https://..."}
                        style={{width: 280}}
                        value={targetUrl}
                        onChange={handleUrlChange}
                    />
                    <br/>
                    {errorMessages.targetUrl && <Text type="danger">{errorMessages.targetUrl}</Text>}
                </Row>

                <div style={{margin: '24px 0'}}/>

                <Row style={{display: 'flex', height: '100%'}}>
                    <span style={{fontSize: '20px', fontWeight: 'bolder'}}>광고에 대한 간단한 메모 (500자 까지) :</span>
                </Row>
                <Row>
                    <TextArea
                        value={customMemo}
                        onChange={(e) => setCustomMemo(e.target.value)}
                        placeholder="광고 하고자 하는 목적, 타겟, 정확히 어디에 광고 하는지..."
                        autoSize={{ minRows: 3, maxRows: 7 }}
                        maxLength={500}
                    />
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
