import React from 'react';
import {message, Modal, Popover, Button} from "antd";
import {callEstimateInquiry} from "../../definition/apiPath";
import axios from "axios";
import {MessageOutlined, PhoneOutlined} from "@ant-design/icons";

const InquiryEstimatedChassis = (props: { estimationId:any, isInquiryModalOpen:any, setIsInquiryModalOpen:any }) => {

    const { estimationId, isInquiryModalOpen, setIsInquiryModalOpen } = props;

    const [messageApi, contextHolder] = message.useMessage();


    const success = (successMsg:string) => {
        messageApi.open({
            type: 'success',
            content: successMsg,
        });
    };

    const errorModal = (errorMsg:string) => {
        messageApi.open({
            type: 'error',
            content: errorMsg
        });
    };

    const handleInquiry = (strategy: any) => {
        if (!strategy) {
            return;
        }

        const callEstimateInquiryAPIRequest = callEstimateInquiry.replace('{estimationId}', estimationId);

        axios.get(callEstimateInquiryAPIRequest + "?strategy=" + strategy, {
            withCredentials: true,
            headers: {
                Authorization: localStorage.getItem("hoppang-token"),
            }
        }).then((res) => {
            if (res.data === true) {
                success("견적 문의가 성공적으로 접수되었습니다.");
            }
        }).catch((err) => {
            errorModal("견적 문의를 잠시 후 다시 시도해주세요.");
        });
    }


    return (
        <>
            {contextHolder}

            <Modal
                title="견적 문의 확인"
                open={isInquiryModalOpen}
                onOk={() => setIsInquiryModalOpen(false)}
                onCancel={() => setIsInquiryModalOpen(false)}
                footer={[
                    <Popover
                        content={<div>010-2914-3611</div>}
                        trigger="click"
                        key="phone"
                    >
                        <Button
                            icon={<PhoneOutlined />}
                            type="primary"
                            onClick={() => handleInquiry('TEL')}
                        >
                            <a href="tel:01029143611" style={{ color: 'inherit', textDecoration: 'none' }}>
                                전화상담하기
                            </a>
                        </Button>
                    </Popover>,
                    <Button
                        icon={<MessageOutlined />}
                        type="primary"
                        key="kakao"
                        style={{ backgroundColor: '#FEE500', color: '#000' }}
                        onClick={ async () => {
                            const kakaoWebLink = 'https://pf.kakao.com/_dbxezn';
                            const userAgent = navigator.userAgent.toLowerCase();

                            // 안드로이드인 경우: 인텐트 사용해 크롬에서 열기
                            if (userAgent.includes('android')) {
                                window.location.href = `intent://${kakaoWebLink.replace('https://', '')}#Intent;scheme=https;package=com.android.chrome;end`;
                                handleInquiry('KAKAO');
                            }
                            // iOS 또는 다른 경우: 기본 브라우저에서 열기
                            else {
                                handleInquiry('KAKAO');
                                window.open(kakaoWebLink, '_blank');

                                return;
                            }

                        }}
                    >
                        카카오톡상담하기
                    </Button>
                ]}
            >
                <p>자세한 상담으로 더 합리적인 금액을 받아보실 수 있어요.</p>
            </Modal>
        </>
    );
}

export default InquiryEstimatedChassis;
