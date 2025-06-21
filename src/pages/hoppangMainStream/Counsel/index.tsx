import React, {useEffect, useState, useRef} from 'react';
import './styles.css';
import BottomNavigator from "../../../component/BottomNavigator";
import useSWR from "swr";
import {callMeData} from "../../../definition/apiPath";
import fetcher from "../../../util/fetcher";
import {isMobile} from "react-device-detect";

const useResponsiveStyles = (showLeftFade: boolean, showRightFade: boolean) => {
    const styles: { [key: string]: React.CSSProperties } = {
        container: {
            backgroundColor: '#f5f5f5',
            width: '100%',
            minHeight: '100vh',
            padding: '20px 0',
        },
        contentWrapper: {
            maxWidth: '700px',
            margin: '0 auto',
            padding: '0 20px',
        },
        header: {
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '30px 20px',
            marginBottom: '20px',
            textAlign: 'center',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        },
        titleIconWrapper: {
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '16px',
            marginRight: '8px',
        },

        titleWithIcon: {
            display: 'flex',
            alignItems: 'center',
            fontSize: '24px',
            fontWeight: '700',
            color: '#333',
            textAlign: 'left'
        },
        subtitle: {
            fontSize: '18px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '20px',
            textAlign: 'left'
        },
        operatingHours: {
            fontSize: '14px',
            color: '#666',
            marginBottom: '10px',
            textAlign: 'left'
        },
        description: {
            fontSize: '13px',
            color: '#888',
            lineHeight: '1.4',
            textAlign: 'left'
        },
        contactSection: {
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '0',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            overflow: 'hidden',
        },
        contactItem: {
            display: 'flex',
            alignItems: 'center',
            padding: '20px',
            borderBottom: '1px solid #f0f0f0',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
        },
        contactItemLast: {
            borderBottom: 'none',
        },
        iconWrapper: {
            width: '50px',
            height: '50px',
            borderRadius: '25px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '15px',
            fontSize: '20px',
        },
        kakaoIcon: {
            backgroundColor: '#fee500',
        },
        phoneIcon: {
            backgroundColor: '#4285f4',
            color: '#fff',
        },
        contactText: {
            flex: 1,
            fontSize: '16px',
            fontWeight: '500',
            color: '#333',
        },
        arrow: {
            fontSize: '18px',
            color: '#ccc',
        },
        tabSection: {
            backgroundColor: '#fff',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            overflow: 'hidden',
        },
        tabHeader: {
            display: 'flex',
            borderBottom: '1px solid #f0f0f0',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            maskImage: showLeftFade && showRightFade
                ? 'linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)'
                : showLeftFade
                    ? 'linear-gradient(to right, transparent 0%, black 20%, black 100%)'
                    : showRightFade
                        ? 'linear-gradient(to right, black 0%, black 80%, transparent 100%)'
                        : 'none',
            WebkitMaskImage: showLeftFade && showRightFade
                ? 'linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)'
                : showLeftFade
                    ? 'linear-gradient(to right, transparent 0%, black 20%, black 100%)'
                    : showRightFade
                        ? 'linear-gradient(to right, black 0%, black 80%, transparent 100%)'
                        : 'none',
        },
        tab: {
            minWidth: '80px',
            padding: '14px 19px',
            textAlign: 'center',
            fontSize: '15px',
            fontWeight: '700',
            color: '#666',
            backgroundColor: '#f8f8f8',
            border: 'none',
            borderBottom: '2px solid transparent',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.3s ease',
        },
        activeTab: {
            color: '#007bff',
            backgroundColor: '#fff',
            borderBottom: '2px solid #007bff',
        },
        faqContent: {
            padding: '20px',
        },
        faqItem: {
            padding: '15px 0',
            borderBottom: '1px solid #f0f0f0',
            cursor: 'pointer',
        },
        faqItemLast: {
            borderBottom: 'none',
        },
        faqQuestion: {
            fontSize: '14px',
            color: '#333',
            lineHeight: '1.4',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        faqArrow: {
            color: '#ccc',
            marginLeft: '10px',
        },
        faqAnswer: {
            fontSize: '13px',
            color: '#656565',
            marginTop: '19px',
            marginBottom: '5px',
            lineHeight: '1.6',
        }
    }

    return styles;
}


const Counsel = () => {
    const [showLeftFade, setShowLeftFade] = useState(false);
    const [showRightFade, setShowRightFade] = useState(false);
    const styles = useResponsiveStyles(showLeftFade, showRightFade);
    const [activeTab, setActiveTab] = useState<string>('견적');
    const tabHeaderRef = useRef<HTMLDivElement>(null);
    const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);


    useEffect(() => {
        const container = tabHeaderRef.current;
        if (!container) return;

        const updateFade = () => {
            const { scrollLeft, scrollWidth, clientWidth } = container;
            setShowLeftFade(scrollLeft > 0);
            setShowRightFade(scrollLeft + clientWidth < scrollWidth - 1);
        };

        updateFade();
        container.addEventListener('scroll', updateFade);
        window.addEventListener('resize', updateFade);
        return () => {
            container.removeEventListener('scroll', updateFade);
            window.removeEventListener('resize', updateFade);
        };
    }, []);

    useEffect(() => {
        let referrer = document.referrer;

        let isFromSearchEngine =
            referrer.includes("google.") ||
            referrer.includes("naver.") ||
            referrer.includes("daum.") ||
            referrer.includes("bing.") ||
            referrer.includes("search.yahoo.") ||
            referrer.includes("instagram.com") ||
            referrer.includes("facebook.com") ||
            referrer.includes("youtube.com");

        if (!isMobile || isFromSearchEngine) {
            window.location.href = "https://hoppang.store/official?adv_id=329263e0-5d61-4ade-baf9-7e34cc611828";
        }
    }, []);

    const { data: userData, error, mutate } = useSWR(callMeData, fetcher, {
        dedupingInterval: 2000
    });

    const chassisEstimatedHistories = () => {
        if (userData) {
            window.location.href = "/mypage/estimation/histories";
        } else {
            window.location.href = "/login";
        }
    }

    const directInquiry = () => {
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
    }

    const handlePhoneInquiry = () => {
        window.location.href = 'tel:010-2914-3622';
    }

    const tabs = ['견적', '서비스', '시공', '계정', '기타'];

    const faqQAData: { [key: string]: { question: string; answer: string }[] } = {
        '견적': [
            {
                question: '견적 내역을 확인하고 싶어요.',
                answer: '답변 준비중'
            },
            {
                question: '다른 샷시 회사도 견적 가능한가요?',
                answer: '답변 준비중'
            },
            {
                question: '견적만 제공하나요, 아니면 시공까지 진행 가능하나요?',
                answer: '답변 준비중'
            }
        ],
        '서비스': [
            {
                question: '호빵은 무슨 뜻인가요?',
                answer: '답변 준비중'
            },
            {
                question: '호빵은 어떤 서비스를 하고있나요?',
                answer: '답변 준비중'
            }
        ],
        '시공': [
            {
                question: '시공까지 진행된다면 절차는 어떻게 되나요?',
                answer: '답변 준비중'
            },
            {
                question: '시공비용은 어떻게 결제하나요?',
                answer: '답변 준비중'
            },
            {
                question: '누가 시공팀으로 오는지 궁금합니다.',
                answer: '답변 준비중'
            }
        ],
        '계정': [
            {
                question: '회원 관리는 어떻게 하고 있나요?',
                answer: '답변 준비중'
            }
        ],
        '기타': [
            {
                question: 'A/S는 어떻게 진행되고 있나요?',
                answer: '답변 준비중'
            },
            {
                question: '제휴/협업 문의는 어떻게 하나요?',
                answer: '답변 준비중'
            },
            {
                question: '이벤트/혜택 관련 알고싶습니다.',
                answer: '답변 준비중'
            }
        ]
    };


    return (
        <>
            <div style={styles.container}>
                <div style={styles.contentWrapper}>
                    {/* Header */}
                    <div style={styles.header}>
                        <div style={styles.titleWithIcon}>
                            <div style={styles.titleIconWrapper}>
                                <img src="/assets/Counsel/counselor-hoppang-character.png" alt="hoppang-counselor"
                                     style={{width: '35px', height: '35px'}}
                                />
                            </div>
                            호빵 고객센터입니다.
                        </div>
                        <h2 style={styles.subtitle}>무엇을 도와드릴까요?</h2>
                        <div style={styles.operatingHours}>
                            평일 09:00 ~ 20:00<br />
                            주말 및 공휴일 09:00 ~ 19:00
                        </div>
                        <div style={styles.description}>
                            영업시간 외에는 카카오톡 채널로 문의를 남겨주시면, 빠른 시일 내로 답변드리도록 하겠습니다.
                        </div>
                    </div>

                    {/* Contact Methods */}
                    <div style={styles.contactSection}>
                        <div
                            style={{...styles.contactItem, ...styles.contactItemLast}}
                            onClick={directInquiry}
                        >
                            <div style={{...styles.iconWrapper, ...styles.kakaoIcon}}>
                                <img src="/assets/Sso/kakao-logo.png" alt="Kakao"
                                     style={{width: '55px', height: '55px'}}
                                />
                            </div>
                            <span style={styles.contactText}>카카오톡 문의하기</span>
                            <span style={styles.arrow}>›</span>
                        </div>
                        <div
                            style={{...styles.contactItem, ...styles.contactItemLast}}
                            onClick={handlePhoneInquiry}
                        >
                            <div style={{...styles.iconWrapper, ...styles.phoneIcon}}>
                                <img src="/assets/Counsel/tel-logo.png" alt="Tel"
                                     style={{width: '35px', height: '35px'}}
                                />
                            </div>
                            <span style={styles.contactText}>전화 문의하기</span>
                            <span style={styles.arrow}>›</span>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div style={styles.tabSection}>
                        <div className="scrollHidden" style={styles.tabHeader} ref={tabHeaderRef}>
                            {tabs.map((tab) => (
                                <button
                                    key={tab}
                                    style={
                                        activeTab === tab
                                            ? { ...styles.tab, ...styles.activeTab }
                                            : styles.tab
                                    }
                                    onClick={() => setActiveTab(tab)}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div style={styles.faqContent}>
                            {faqQAData[activeTab]?.map((item, index, array) => (
                                <div
                                    key={index}
                                    style={{
                                        ...styles.faqItem,
                                        ...(index === array.length - 1 ? styles.faqItemLast : {})
                                    }}
                                    onClick={() => setExpandedFaqIndex(expandedFaqIndex === index ? null : index)}
                                >
                                    <div style={styles.faqQuestion}>
                                        {item.question}
                                        <span
                                            style={{
                                                ...styles.faqArrow,
                                                transform: expandedFaqIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                                                transition: 'transform 0.3s ease',
                                                fontSize: '18px',
                                            }}
                                        >
                                            ⌄
                                        </span>
                                    </div>
                                    {expandedFaqIndex === index && (
                                        <div style={styles.faqAnswer}>
                                            {item.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <BottomNavigator/>
            </div>
        </>
    )
}

export default Counsel;
