import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

type PanelKey = 'glass' | 'handle';

const InfoSection: React.FC<{
    isAgreed: boolean;
    setIsAgreed: (e:any) => void;
}> = ({ isAgreed, setIsAgreed }) => {
    const [expandedPanels, setExpandedPanels] = useState<Record<PanelKey, boolean>>({glass: true, handle: true});
    const lastSectionRef = useRef<HTMLDivElement>(null);

    // 스크롤 완료 여부
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

    const togglePanel = useCallback((panelKey: PanelKey) => {
        setExpandedPanels(prev => ({
            ...prev,
            [panelKey]: !prev[panelKey]
        }));
    }, []);

    // IntersectionObserver로 마지막 섹션 관찰
    useEffect(() => {
        if (!lastSectionRef.current) return;

        window.scrollTo(0, 0);

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setHasScrolledToBottom(true);
                    }
                });
            },
            {
                threshold: 0.5, // 50% 보이면 완료
                rootMargin: '0px'
            }
        );

        observer.observe(lastSectionRef.current);

        return () => {
            observer.disconnect();
        };
    }, []);

    // 체크박스 변경 핸들러
    const handleCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (hasScrolledToBottom) {
            setIsAgreed(e.target.checked);
        }
    }, [hasScrolledToBottom, setIsAgreed]);

    return (
        <div style={{
            padding: '20px',
            paddingLeft: `calc(20px + env(safe-area-inset-left, 0px))`,
            paddingRight: `calc(20px + env(safe-area-inset-right, 0px))`,
            maxWidth: '430px',
            width: '100%',
            margin: '0 auto',
            boxSizing: 'border-box',
            background: '#f8fafc',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
            {/* 스크롤 안내 (컴포넌트 상단) */}
            {!hasScrolledToBottom && (
                <div style={{
                    background: 'linear-gradient(135deg, rgba(219, 234, 254, 0.95) 0%, rgba(191, 219, 254, 0.95) 100%)',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    border: '1px solid rgba(37, 99, 235, 0.2)'
                }}>
                    <div style={{
                        fontSize: '13px',
                        color: '#1e40af',
                        fontWeight: '600'
                    }}>아래 내용 확인 후 동의해주세요</div>
                    <div style={{
                        color: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        animation: 'smoothBounce 2s ease-in-out infinite'
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 5v14M19 12l-7 7-7-7"/>
                        </svg>
                    </div>
                </div>
            )}

            {/* 신뢰성 알림 */}
            <div style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px',
                borderLeft: '4px solid #10b981'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '16px'
                }}>
                    <div style={{
                        width: '24px',
                        height: '24px',
                        background: '#10b981',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold'
                    }}>✓
                    </div>
                    <span style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1e293b'
                    }}>호빵은 믿을 수 있는 제품만 취급합니다.</span>
                </div>

                <ul style={{
                    margin: 0,
                    paddingLeft: '20px',
                    fontSize: '14px',
                    color: '#475569',
                    lineHeight: '1.6'
                }}>
                    <li style={{marginBottom: '8px'}}>
                        <strong>LX하우시스, 현대L&C, KCC글라스</strong> 본사 직영점 제품만 판매
                    </li>
                    <li style={{marginBottom: '8px'}}>
                        품질보증: LX하우시스, 현대L&C(10년), KCC글라스(13년)
                    </li>
                    <li>A/S도 본사에서 직접 관리</li>
                </ul>
            </div>

            {/* 견적 포함 사항 */}
            <div style={{
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px',
                borderLeft: '4px solid #FF6A4D'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px'
                }}>
                    <div style={{
                        width: '24px',
                        height: '24px',
                        background: '#FF6A4D',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '12px'
                    }}>i
                    </div>
                    <span style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1e293b'
                    }}>견적에는 시공비 및 물류비가 포함됩니다.</span>
                </div>

                <p style={{
                    margin: 0,
                    fontSize: '14px',
                    color: '#475569',
                    lineHeight: '1.6'
                }}>
                    단, 실제 실측 결과 및 추가 장비 비용(사다리차 등)에 따라 금액이 달라질 수 있습니다.
                </p>
            </div>

            {/* 비교 체크 사항 */}
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid #e2e8f0',
                marginBottom: '20px'
            }}>
                <h4 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1e293b',
                    margin: '0 0 16px 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    타사 비교 시 꼭 체크하세요!
                </h4>

                {/* 유리 사양 패널 */}
                <div style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    marginBottom: '8px'
                }}>
                    <button
                        onClick={() => togglePanel('glass')}
                        style={{
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            padding: '12px 16px',
                            textAlign: 'left',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '15px',
                            fontWeight: '500',
                            color: '#374151',
                            cursor: 'pointer'
                        }}
                    >
                        1. 유리 사양
                        <span style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            transform: expandedPanels.glass ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease'
                        }}>▼</span>
                    </button>

                    {expandedPanels.glass && (
                        <div style={{
                            padding: '16px',
                            background: '#f8fafc',
                            borderTop: '1px solid #e2e8f0',
                            fontSize: '14px',
                            color: '#475569',
                            lineHeight: '1.6'
                        }}>
                            <div style={{marginBottom: '8px'}}>
                                • LX하우시스, 현대L&C: <strong>24mm 기준</strong>
                            </div>
                            <div style={{marginBottom: '8px'}}>
                                • KCC글라스: <strong>26mm (외부창 로이유리 포함 기준)</strong>
                            </div>
                            <div style={{marginBottom: '8px'}}>
                                • (22~28mm는 열 효율 차이 없음)
                            </div>
                            <div style={{marginBottom: '8px'}}>
                                • 일부 업체는 이중창 내부 유리를 5mm로 사용해 저렴해 보이게 할 수 있으니 주의!
                            </div>
                            <div>
                                • LX하우시스, 현대L&C 로이유리 선택 시 약 <strong>5% 추가 비용</strong> 발생
                            </div>
                        </div>
                    )}
                </div>

                {/* 자동 핸들 패널 */}
                <div style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                }}>
                    <button
                        onClick={() => togglePanel('handle')}
                        style={{
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            padding: '12px 16px',
                            textAlign: 'left',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '15px',
                            fontWeight: '500',
                            color: '#374151',
                            cursor: 'pointer'
                        }}
                    >
                        2. 자동 핸들 포함 여부
                        <span style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            transform: expandedPanels.handle ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease'
                        }}>▼</span>
                    </button>

                    {expandedPanels.handle && (
                        <div style={{
                            padding: '16px',
                            background: '#f8fafc',
                            borderTop: '1px solid #e2e8f0',
                            fontSize: '14px',
                            color: '#475569',
                            lineHeight: '1.6'
                        }}>
                            <div style={{marginBottom: '8px'}}>
                                • 호빵 견적은 모든 창에 <strong>자동 핸들 포함!</strong>
                            </div>
                            <div style={{marginBottom: '8px'}}>
                                • 일부 업체는 내부창 핸들을 제외해 가격을 낮추는 경우가 있음
                            </div>
                            <div>
                                • 자동 핸들이 빠지면 가격 차이가 크므로 꼭 확인하세요.
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 하단 중요 알림 */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            }}>
                <div style={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    borderLeft: '4px solid #f59e0b'
                }}>
                    <span style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#1e293b'
                    }}>📌 정확한 실측 후 최종 견적이 확정됩니다.</span>
                </div>

                <div style={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    borderLeft: '4px solid #ef4444'
                }}>
                    <span style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: '#1e293b'
                    }}>📌 추가 비용이 발생할 수 있는 부분을 꼭 체크하고 비교하세요!</span>
                </div>

                {/* 동의 체크박스 - 마지막 섹션 */}
                <div
                    ref={lastSectionRef}
                    style={{
                        background: 'white',
                        border: hasScrolledToBottom ? '2px solid #FF6A4D' : '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '20px',
                        marginTop: '12px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: hasScrolledToBottom ? '0 4px 20px rgba(99, 102, 241, 0.15)' : 'none'
                    }}
                >
                    <label style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        cursor: hasScrolledToBottom ? 'pointer' : 'not-allowed',
                        opacity: hasScrolledToBottom ? 1 : 0.5
                    }}>
                        <input
                            type="checkbox"
                            checked={isAgreed}
                            onChange={handleCheckboxChange}
                            disabled={!hasScrolledToBottom}
                            style={{
                                width: '18px',
                                height: '18px',
                                minWidth: '18px',
                                minHeight: '18px',
                                border: '2px solid #e2e8f0',
                                borderRadius: '4px',
                                accentColor: '#FF6A4D',
                                marginTop: '2px',
                                flexShrink: 0,
                                cursor: hasScrolledToBottom ? 'pointer' : 'not-allowed'
                            }}
                        />
                        <span style={{
                            fontSize: '14px',
                            color: '#374151',
                            lineHeight: '1.5',
                            fontWeight: '500',
                            flex: 1
                        }}>
                            위 내용을 모두 확인하였으며, 견적 비교 시 체크사항을 면밀히 검토하였습니다.
                        </span>
                    </label>

                    {/* 스크롤 안내 텍스트 */}
                    {!hasScrolledToBottom && (
                        <div style={{
                            marginTop: '12px',
                            padding: '8px 12px',
                            background: '#f8fafc',
                            borderRadius: '6px',
                            fontSize: '12px',
                            color: '#64748b',
                            textAlign: 'center'
                        }}>
                            ↑ 위 내용을 모두 확인하시면 동의할 수 있습니다
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes smoothBounce {
                    0%, 100% {
                        transform: translateY(0);
                        opacity: 1;
                    }
                    50% {
                        transform: translateY(4px);
                        opacity: 0.7;
                    }
                }

                @media (max-width: 375px) {
                    div[style*="padding: 20px"] {
                        padding: 16px !important;
                        padding-left: calc(16px + env(safe-area-inset-left, 0px)) !important;
                        padding-right: calc(16px + env(safe-area-inset-right, 0px)) !important;
                    }
                }

                button:focus {
                    outline: 2px solid #FF6A4D;
                    outline-offset: 2px;
                }

                input[type="checkbox"]:focus {
                    outline: 2px solid #FF6A4D;
                    outline-offset: 2px;
                }

                @media (hover: none) and (pointer: coarse) {
                    button {
                        min-height: 44px;
                    }
                    
                    label {
                        min-height: 44px;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    * {
                        animation: none !important;
                        transition: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default InfoSection;
