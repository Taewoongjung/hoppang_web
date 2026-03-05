import React, { useState, useEffect } from 'react';
import { message, Modal } from "antd";
import { callEstimateInquiry } from "../../../definition/apiPath";
import axios from "axios";
import { CloseOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { getErrorMessage } from "../../../util/security";

interface InquiryStatus {
    kakao: boolean;
    call: boolean;
    callback: boolean;
}

interface InquiryEstimateChassisProps {
    estimationId: any;
    isInquiryModalOpen: boolean;
    setIsInquiryModalOpen: (open: boolean) => void;
    finishedInquiry: (inquiryTypes: string[]) => void;
    initialInquiryStatus?: InquiryStatus;
}

const InquiryEstimateChassis: React.FC<InquiryEstimateChassisProps> = ({
                                                                           estimationId,
                                                                           isInquiryModalOpen,
                                                                           setIsInquiryModalOpen,
                                                                           finishedInquiry,
                                                                           initialInquiryStatus = { kakao: false, call: false, callback: false } // 📌 기본값 설정
                                                                       }) => {
    const [messageApi, contextHolder] = message.useMessage();
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingType, setProcessingType] = useState<string | null>(null);

    // 📌 초기 상태를 props에서 받아서 설정
    const [inquiryStatus, setInquiryStatus] = useState<InquiryStatus>(initialInquiryStatus);

    // 📌 props가 변경될 때 상태 업데이트
    useEffect(() => {
        setInquiryStatus(initialInquiryStatus);
    }, [initialInquiryStatus, estimationId]);

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

    const handleInquiry = async (strategy: string, inquiryType: string, actionCallback?: () => void) => {
        if (!strategy || !estimationId) return;

        setIsProcessing(true);
        setProcessingType(inquiryType);
        const callEstimateInquiryAPIRequest = callEstimateInquiry.replace('{estimationId}', estimationId);

        try {
            const res = await axios.get(callEstimateInquiryAPIRequest + "?strategy=" + strategy, {
                withCredentials: true,
                headers: {
                    Authorization: localStorage.getItem("hoppang-token"),
                }
            });

            if (res.data === true) {
                // 📌 로컬 상태 업데이트
                const newStatus = {
                    ...inquiryStatus,
                    [inquiryType]: true
                };
                setInquiryStatus(newStatus);

                // 성공 메시지
                const messages = {
                    TEL_CONSULT: "전화 상담 신청이 완료되었습니다! 곧 연락드릴게요.",
                    KAKAO: "카카오톡 상담 연결이 완료되었습니다!",
                    TEL: "전화 연결을 시작합니다!"
                };

                success(messages[strategy as keyof typeof messages] || "문의가 완료되었습니다!");

                // 외부 액션 실행
                if (actionCallback) {
                    setTimeout(actionCallback, 500);
                }

                // 📌 완료된 문의 타입들을 부모에게 전달
                const completedTypes = Object.keys(newStatus).filter(key => newStatus[key as keyof InquiryStatus]);
                finishedInquiry(completedTypes);

            } else {
                throw new Error('문의 처리에 실패했습니다.');
            }
        } catch (err) {
            errorModal(getErrorMessage(err, "문의 접수에 실패했습니다. 잠시 후 다시 시도해주세요."));
        } finally {
            setIsProcessing(false);
            setProcessingType(null);
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

        handleInquiry('KAKAO', 'kakao', actionCallback);
    };

    const handlePhoneCall = () => {
        const actionCallback = () => {
            window.location.href = 'tel:010-2913-3622';
        };

        handleInquiry('TEL', 'call', actionCallback);
    };

    const handlePhoneConsult = () => {
        handleInquiry('TEL_CONSULT', 'callback');
    };

    const handleClose = () => {
        if (!isProcessing) {
            setIsInquiryModalOpen(false);
        }
    };

    const inquiryOptions = [
        {
            id: 'kakao',
            title: '카카오톡 상담',
            subtitle: '빠르고 편리한 채팅 상담',
            icon: <img src="/assets/Sso/kakao-logo.png" alt="Kakao" style={{ width: '43px', height: '43px' }} />,
            bgColor: '#FEE500',
            action: handleKakaoInquiry,
            description: '실시간 채팅으로 빠른 답변',
            completedText: '카카오톡 상담 연결됨',
            completedDesc: '다시 상담하려면 클릭하세요'
        },
        {
            id: 'call',
            title: '바로 전화하기',
            subtitle: '부담 없이 연락주세요',
            icon: <img src="/assets/Counsel/tel-logo.png" alt="전화" style={{ width: '27px', height: '27px' }} />,
            bgColor: '#A7F3D0',
            action: handlePhoneCall,
            description: '지금 바로 통화 연결',
            completedText: '전화 연결 완료',
            completedDesc: '다시 연결하려면 클릭하세요'
        },
        {
            id: 'callback',
            title: '전화 상담 신청',
            subtitle: '담당자가 직접 연락드려요',
            icon: <img src="/assets/Counsel/counselor-hoppang-character.png" alt="상담신청" style={{ width: '34px', height: '34px' }} />,
            bgColor: '#FFF7E6',
            action: handlePhoneConsult,
            description: '원하는 시간에 상담 가능',
            completedText: '상담 신청 완료',
            completedDesc: '추가 신청하려면 클릭하세요'
        }
    ];

    const hasAnyInquiry = Object.values(inquiryStatus).some(status => status);
    const completedCount = Object.values(inquiryStatus).filter(Boolean).length;

    return (
        <>
            {contextHolder}
            <Modal
                open={isInquiryModalOpen}
                onCancel={handleClose}
                footer={null}
                width={380}
                centered
                closeIcon={null}
                maskClosable={!isProcessing}
                styles={{
                    content: {
                        padding: 0,
                        borderRadius: '20px',
                        overflow: 'hidden',
                        // Safe area 적용
                        paddingTop: 'max(20px, env(safe-area-inset-top))',
                        paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
                        paddingLeft: 'max(20px, env(safe-area-inset-left))',
                        paddingRight: 'max(20px, env(safe-area-inset-right))',
                        maxHeight: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom) - 40px)',
                    },
                    mask: {
                        // 마스크에도 safe area 적용
                        paddingTop: 'env(safe-area-inset-top)',
                        paddingBottom: 'env(safe-area-inset-bottom)',
                        paddingLeft: 'env(safe-area-inset-left)',
                        paddingRight: 'env(safe-area-inset-right)',
                    }
                }}
                style={{
                    // 모달 전체에 safe area 고려
                    top: 'max(50px, env(safe-area-inset-top))',
                    maxHeight: 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
                }}
            >
                {/* 헤더 */}
                <div style={{
                    background: hasAnyInquiry
                        ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '28px 24px',
                    paddingTop: `calc(28px + max(0px, env(safe-area-inset-top) - 20px))`, // 헤더 상단에 추가 패딩
                    textAlign: 'center',
                    color: 'white',
                    position: 'relative',
                    transition: 'all 0.5s ease'
                }}>
                    <button
                        onClick={handleClose}
                        disabled={isProcessing}
                        style={{
                            position: 'absolute',
                            top: `calc(20px + max(0px, env(safe-area-inset-top) - 20px))`, // safe area 고려한 위치
                            right: `calc(20px + max(0px, env(safe-area-inset-right) - 20px))`, // safe area 고려한 위치
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            border: 'none',
                            background: 'rgba(255, 255, 255, 0.2)',
                            color: 'white',
                            cursor: isProcessing ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            transition: 'all 0.3s ease',
                            backdropFilter: 'blur(10px)',
                            opacity: isProcessing ? 0.5 : 1
                        }}
                    >
                        <CloseOutlined />
                    </button>

                    <div style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px' }}>
                        {hasAnyInquiry ? '✅ 문의 접수 완료!' : '💬 견적 상담 받기'}
                    </div>
                    <div style={{ fontSize: '15px', opacity: 0.9 }}>
                        {hasAnyInquiry
                            ? `${completedCount}개 방법으로 문의하셨습니다`
                            : '전문 상담사와 함께 더 정확한 견적을 받아보세요'
                        }
                    </div>

                    {hasAnyInquiry && (
                        <div style={{
                            marginTop: '16px',
                            padding: '12px 16px',
                            background: 'rgba(255, 255, 255, 0.15)',
                            borderRadius: '12px',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}>
                            <div style={{ fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <CheckCircleOutlined style={{ color: '#ffffff' }} />
                                <span>담당자가 빠르게 연락드릴게요!</span>
                            </div>
                            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '4px' }}>
                                다른 방법으로도 추가 문의가 가능합니다
                            </div>
                        </div>
                    )}
                </div>

                {/* 콘텐츠 */}
                <div style={{
                    padding: '24px',
                    paddingLeft: `calc(24px + max(0px, env(safe-area-inset-left) - 20px))`, // safe area 고려
                    paddingRight: `calc(24px + max(0px, env(safe-area-inset-right) - 20px))`, // safe area 고려
                    paddingBottom: `calc(24px + max(0px, env(safe-area-inset-bottom) - 20px))`, // safe area 고려
                    maxHeight: 'calc(70vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
                    overflowY: 'auto'
                }}>
                    <div style={{
                        background: '#f8f9fa',
                        borderRadius: '16px',
                        padding: '20px',
                        marginBottom: '24px',
                        border: '1px solid #e9ecef'
                    }}>
                        <div style={{ fontSize: '15px', color: '#495057', marginBottom: '8px', fontWeight: '600' }}>
                            📋 상담 혜택
                        </div>
                        <div style={{ fontSize: '14px', color: '#6c757d', lineHeight: '1.5' }}>
                            • 정확한 현장 측정 및 견적<br />
                            • 추가 할인 혜택 안내<br />
                            • 시공 일정 및 A/S 상담
                        </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        {inquiryOptions.map((option) => {
                            const isCompleted = inquiryStatus[option.id as keyof InquiryStatus];
                            const isCurrentlyProcessing = processingType === option.id;
                            const isDisabled = isProcessing && !isCurrentlyProcessing;

                            return (
                                <div
                                    key={option.id}
                                    onClick={() => {
                                        if (!isDisabled) {
                                            option.action();
                                        }
                                    }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '20px',
                                        borderRadius: '16px',
                                        marginBottom: '16px',
                                        border: isCompleted ? '2px solid #10b981' : '1px solid #e9ecef',
                                        background: isCompleted ? '#f0fdf4' : '#fff',
                                        cursor: isDisabled ? 'not-allowed' : 'pointer',
                                        opacity: isDisabled ? 0.6 : 1,
                                        transition: 'all 0.3s ease',
                                        boxShadow: isCompleted
                                            ? '0 4px 12px rgba(16, 185, 129, 0.15)'
                                            : '0 2px 8px rgba(0,0,0,0.06)',
                                        transform: isCurrentlyProcessing ? 'scale(0.98)' : 'scale(1)'
                                    }}
                                >
                                    <div style={{
                                        width: '56px',
                                        height: '56px',
                                        borderRadius: '16px',
                                        background: isCompleted ? '#10b981' : option.bgColor,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginRight: '16px',
                                        flexShrink: 0,
                                        transition: 'all 0.3s ease'
                                    }}>
                                        {isCompleted ? (
                                            <CheckCircleOutlined style={{ color: 'white', fontSize: '24px' }} />
                                        ) : (
                                            option.icon
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{
                                            fontSize: '17px',
                                            fontWeight: '600',
                                            color: isCompleted ? '#10b981' : '#212529',
                                            marginBottom: '4px'
                                        }}>
                                            {isCompleted ? option.completedText : option.title}
                                        </div>
                                        <div style={{
                                            fontSize: '14px',
                                            color: isCompleted ? '#059669' : '#6c757d',
                                            marginBottom: '6px'
                                        }}>
                                            {isCompleted ? option.completedDesc : option.subtitle}
                                        </div>
                                        <div style={{
                                            fontSize: '13px',
                                            color: isCompleted ? '#10b981' : '#868e96'
                                        }}>
                                            {isCompleted ? '✓ 문의 완료됨' : option.description}
                                        </div>
                                    </div>

                                    {isCurrentlyProcessing && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            color: '#6c757d'
                                        }}>
                                            <div style={{
                                                width: '16px',
                                                height: '16px',
                                                border: '2px solid #e9ecef',
                                                borderTop: '2px solid #fcb080',
                                                borderRadius: '50%',
                                                animation: 'spin 1s linear infinite'
                                            }} />
                                            <span style={{ fontSize: '12px' }}>처리중...</span>
                                        </div>
                                    )}

                                    {!isCurrentlyProcessing && (
                                        <div style={{
                                            color: isCompleted ? '#10b981' : '#adb5bd',
                                            fontSize: '20px',
                                            transform: 'rotate(-45deg)',
                                            transition: 'transform 0.3s ease'
                                        }}>
                                            ↗
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* 하단 버튼 */}
                    <div style={{
                        display: 'flex',
                        gap: '12px',
                        marginTop: '24px',
                        marginBottom: 'max(0px, env(safe-area-inset-bottom))' // 하단 safe area 추가 여백
                    }}>
                        <button
                            onClick={handleClose}
                            disabled={isProcessing}
                            style={{
                                flex: 1,
                                padding: '16px',
                                borderRadius: '12px',
                                border: hasAnyInquiry ? '2px solid #10b981' : '1px solid #dee2e6',
                                background: hasAnyInquiry ? '#10b981' : '#fff',
                                color: hasAnyInquiry ? 'white' : '#6c757d',
                                fontSize: '15px',
                                fontWeight: '600',
                                cursor: isProcessing ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease',
                                opacity: isProcessing ? 0.5 : 1
                            }}
                        >
                            {hasAnyInquiry ? '완료' : '나중에 하기'}
                        </button>
                    </div>

                    <div style={{
                        textAlign: 'center',
                        fontSize: '13px',
                        color: '#868e96',
                        marginTop: '20px',
                        padding: '16px',
                        background: '#f8f9fa',
                        borderRadius: '12px',
                        lineHeight: '1.5'
                    }}>
                        <strong>상담시간</strong><br />
                        평일 09:00 - 20:00 / 주말·공휴일 09:00 - 19:00<br />
                        <span style={{ color: '#fcb080', fontWeight: '600' }}>급한 문의는 카카오톡을 이용해주세요</span>
                    </div>
                </div>

                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    
                    /* Safe area를 지원하지 않는 브라우저 대응 */
                    @supports not (padding: env(safe-area-inset-top)) {
                        .ant-modal-content {
                            padding-top: 20px !important;
                            padding-bottom: 20px !important;
                            padding-left: 20px !important;
                            padding-right: 20px !important;
                        }
                    }
                `}</style>
            </Modal>
        </>
    );
};

export default InquiryEstimateChassis;
