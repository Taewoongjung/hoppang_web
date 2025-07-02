import React, { useState } from 'react';
import { message, Modal } from "antd";
import { callEstimateInquiry } from "../../../definition/apiPath";
import axios from "axios";
import { CloseOutlined } from "@ant-design/icons";

const InquiryEstimateChassis = (props: {
    estimationId: any,
    isInquiryModalOpen: any,
    setIsInquiryModalOpen: any,
    finishedInquiry: () => void
}) => {
    const { estimationId, isInquiryModalOpen, setIsInquiryModalOpen, finishedInquiry } = props;
    const [messageApi, contextHolder] = message.useMessage();
    const [isProcessing, setIsProcessing] = useState(false);

    const success = (successMsg: string) => {
        messageApi.open({
            type: 'success',
            content: successMsg,
        });
    };

    const errorModal = (errorMsg: string) => {
        messageApi.open({
            type: 'error',
            content: errorMsg
        });
    };

    const handleInquiry = async (strategy: string, actionCallback?: () => void) => {
        if (!strategy) return;

        setIsProcessing(true);
        const callEstimateInquiryAPIRequest = callEstimateInquiry.replace('{estimationId}', estimationId);

        try {
            const res = await axios.get(callEstimateInquiryAPIRequest + "?strategy=" + strategy, {
                withCredentials: true,
                headers: {
                    Authorization: localStorage.getItem("hoppang-token"),
                }
            });

            if (res.data === true) {
                if (strategy === 'TEL_CONSULT') {
                    success("문의가 성공적으로 접수되었습니다!");
                }
                if (actionCallback) {
                    setTimeout(actionCallback, 500); // 성공 메시지 후 액션 실행
                }
                finishedInquiry();
                setIsInquiryModalOpen(false);
            }
        } catch (err) {
            errorModal("문의 접수에 실패했습니다. 잠시 후 다시 시도해주세요.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleKakaoInquiry = () => {
        const actionCallback = () => {
            const kakaoWebLink = 'https://pf.kakao.com/_dbxezn/chat';
            const kakaoAppLink = 'kakaotalk://plusfriend/chat/_dbxezn';
            const userAgent = navigator.userAgent.toLowerCase();

            if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
                setTimeout(() => {
                    window.location.href = kakaoWebLink;
                }, 500);
                window.location.href = kakaoAppLink;
            } else {
                window.open(kakaoWebLink, '_blank');
            }
        };

        handleInquiry('KAKAO', actionCallback);
    };

    const handlePhoneCall = () => {
        const actionCallback = () => {
            window.location.href = 'tel:010-2913-3622';
        };

        handleInquiry('TEL', actionCallback);
    };

    const handlePhoneConsult = () => {
        handleInquiry('TEL_CONSULT');
    };

    const handleClose = () => {
        setIsInquiryModalOpen(false);
    };

    const inquiryOptions = [
        {
            id: 'kakao',
            title: '카카오톡 상담',
            subtitle: '빠르고 편리한 채팅 상담',
            icon: <img src="/assets/Sso/kakao-logo.png" alt="Kakao"/>,
            bgColor: '#FEE500',
            textColor: '#3C1E1E',
            action: handleKakaoInquiry,
            description: '실시간 채팅으로 빠른 답변'
        },
        {
            id: 'call',
            title: '바로 전화하기',
            subtitle: '부담 없이 연락주세요',
            icon: <img src="/assets/Counsel/tel-logo.png" alt="발신용 전화 상담"/>,
            bgColor: '#A7F3D0',
            textColor: '#fff',
            action: handlePhoneCall,
            description: '지금 바로 통화 연결'
        },
        {
            id: 'callback',
            title: '전화 상담 신청',
            subtitle: '담당자가 직접 연락드려요',
            icon: <img src="/assets/Counsel/counselor-hoppang-character.png" alt="수신용 전화 상담"/>,
            bgColor: '#FFF7E6',
            textColor: '#fff',
            action: handlePhoneConsult,
            description: '원하는 시간에 상담 가능'
        }
    ];

    return (
        <>
            {contextHolder}
            <Modal
                open={isInquiryModalOpen}
                onCancel={handleClose}
                footer={null}
                width={360}
                centered
                closeIcon={null} // 기본 닫기 버튼 제거
                styles={{
                    content: {
                        padding: 0,
                        borderRadius: '16px',
                        overflow: 'hidden'
                    }
                }}
            >
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '24px 20px',
                    textAlign: 'center',
                    color: 'white',
                    position: 'relative'
                }}>
                    {/* 우측 상단 닫기 버튼 */}
                    <button
                        onClick={handleClose}
                        disabled={isProcessing}
                        style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            border: 'none',
                            background: 'rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            cursor: isProcessing ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            transition: 'all 0.3s ease',
                            backdropFilter: 'blur(10px)',
                            opacity: isProcessing ? 0.5 : 1
                        }}
                        onMouseEnter={(e) => {
                            if (!isProcessing) {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                                e.currentTarget.style.transform = 'scale(1.1)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isProcessing) {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                                e.currentTarget.style.transform = 'scale(1)';
                            }
                        }}
                    >
                        <CloseOutlined />
                    </button>

                    <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
                        💬 견적 상담 받기
                    </div>
                    <div style={{ fontSize: '14px', opacity: 0.9 }}>
                        전문 상담사와 함께 더 정확한 견적을 받아보세요
                    </div>
                </div>

                <div style={{ padding: '20px' }}>
                    <div style={{
                        background: '#f8f9fa',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '20px',
                        border: '1px solid #e9ecef'
                    }}>
                        <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '4px' }}>
                            📋 상담 혜택
                        </div>
                        <div style={{ fontSize: '13px', color: '#495057', lineHeight: '1.4' }}>
                            • 정확한 현장 측정 및 견적<br />
                            • 추가 할인 혜택 안내<br />
                            • 시공 일정 및 A/S 상담
                        </div>
                    </div>

                    <div style={{ marginBottom: '16px' }}>
                        {inquiryOptions.map((option, index) => (
                            <div
                                key={option.id}
                                onClick={option.action}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '16px',
                                    borderRadius: '12px',
                                    border: '1px solid #e9ecef',
                                    marginBottom: '12px',
                                    cursor: isProcessing ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s ease',
                                    background: '#fff',
                                    opacity: isProcessing ? 0.6 : 1,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.04)'
                                }}
                                onMouseEnter={(e) => {
                                    if (!isProcessing) {
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isProcessing) {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.04)';
                                    }
                                }}
                            >
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: option.bgColor,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '16px',
                                    flexShrink: 0
                                }}>
                                    {option.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        fontSize: '16px',
                                        fontWeight: '600',
                                        color: '#212529',
                                        marginBottom: '2px'
                                    }}>
                                        {option.title}
                                    </div>
                                    <div style={{
                                        fontSize: '13px',
                                        color: '#6c757d',
                                        marginBottom: '4px'
                                    }}>
                                        {option.subtitle}
                                    </div>
                                    <div style={{
                                        fontSize: '12px',
                                        color: '#868e96'
                                    }}>
                                        {option.description}
                                    </div>
                                </div>
                                <div style={{
                                    color: '#adb5bd',
                                    fontSize: '18px',
                                    transform: 'rotate(-45deg)'
                                }}>
                                    ↗
                                </div>
                            </div>
                        ))}
                    </div>

                    {isProcessing && (
                        <div style={{
                            textAlign: 'center',
                            padding: '16px',
                            background: '#f8f9fa',
                            borderRadius: '8px',
                            fontSize: '14px',
                            color: '#6c757d'
                        }}>
                            <div style={{ marginBottom: '8px' }}>⏳</div>
                            문의를 접수하고 있습니다...
                        </div>
                    )}

                    {/* 하단 닫기 버튼 */}
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        marginTop: '20px'
                    }}>
                        <button
                            onClick={handleClose}
                            disabled={isProcessing}
                            style={{
                                flex: 1,
                                padding: '14px',
                                borderRadius: '12px',
                                border: '1px solid #dee2e6',
                                background: '#fff',
                                color: '#6c757d',
                                fontSize: '14px',
                                fontWeight: '500',
                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease',
                                opacity: isProcessing ? 0.5 : 1
                            }}
                            onMouseEnter={(e) => {
                                if (!isProcessing) {
                                    e.currentTarget.style.background = '#f8f9fa';
                                    e.currentTarget.style.borderColor = '#adb5bd';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isProcessing) {
                                    e.currentTarget.style.background = '#fff';
                                    e.currentTarget.style.borderColor = '#dee2e6';
                                }
                            }}
                        >
                            나중에 하기
                        </button>
                    </div>

                    <div style={{
                        textAlign: 'center',
                        fontSize: '12px',
                        color: '#868e96',
                        marginTop: '16px',
                        padding: '12px',
                        background: '#f8f9fa',
                        borderRadius: '8px',
                        lineHeight: '1.4'
                    }}>
                        상담시간: 평일 09:00 - 18:00 / 주말 09:00 - 17:00<br />
                        급한 문의는 카카오톡을 이용해주세요
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default InquiryEstimateChassis;
