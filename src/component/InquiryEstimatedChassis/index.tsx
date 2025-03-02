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
                        onClick={() => {
                            const kakaoWebLink = 'https://pf.kakao.com/_dbxezn';
                            const kakaoAppLink = 'kakaotalk://plusfriend/chat/_dbxezn';
                            const userAgent = navigator.userAgent.toLowerCase();

                            handleInquiry('KAKAO');

                            if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
                                // 카카오톡 앱으로 이동 시도
                                const newWindow = window.open(kakaoAppLink, '_system');  // 🔄 외부 브라우저로 열기 시도
                                if (!newWindow) {
                                    // 새 창이 열리지 않으면 웹 링크로 이동
                                    window.open(kakaoWebLink, '_blank');
                                } else {
                                    // 2초 대기 후에도 앱이 열리지 않으면 웹 링크로 이동
                                    setTimeout(() => {
                                        if (newWindow.closed) {
                                            window.open(kakaoWebLink, '_blank');
                                        }
                                    }, 2000);
                                }
                            } else {
                                window.open(kakaoWebLink, '_blank');
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
