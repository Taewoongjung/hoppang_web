import React, {useEffect, useState, useRef} from 'react';

import './styles.css';
import '../versatile-styles.css';

import BottomNavigator from "../../../component/V2/BottomNavigator";
import useSWR from "swr";
import {callMeData} from "../../../definition/apiPath";
import fetcher from "../../../util/fetcher";

const Counsel = () => {
    const [showLeftFade, setShowLeftFade] = useState(false);
    const [showRightFade, setShowRightFade] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('견적');
    const tabHeaderRef = useRef<HTMLDivElement>(null);
    const faqSectionRef = useRef<HTMLDivElement>(null);
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

    // URL 파라미터 확인 및 FAQ 섹션으로 스크롤
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const forParam = urlParams.get('for');

        if (forParam === 'faq' && faqSectionRef.current) {
            // 페이지가 완전히 로드된 후 스크롤 실행
            const timer = setTimeout(() => {
                faqSectionRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100);

            return () => clearTimeout(timer);
        }
    }, []);

    const { data: userData, error, mutate } = useSWR(callMeData, fetcher, {
        dedupingInterval: 2000
    });

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

    const tabs = ['견적', '서비스', '시공', '기타'];

    const faqQAData: { [key: string]: { question: string; answer: string }[] } = {
        '견적': [
            {
                question: '견적 내역을 확인하고 싶어요.',
                answer: '마이페이지 → 견적 이력에서 받으신 모든 견적을 확인하실 수 있습니다. 각 견적별로 상세 내역과 업체 정보도 함께 제공됩니다.'
            },
            {
                question: '다른 창호 회사도 견적 가능한가요?',
                answer: '네, 현재 현대, LX, KCC글라스 등 주요 브랜드의 견적을 비교해서 받아보실 수 있습니다. 동일한 조건으로 여러 업체 견적을 한 번에 확인하세요.'
            },
            {
                question: '견적만 제공하나요, 아니면 시공까지 진행 가능하나요?',
                answer: '견적 확인 후 원하시는 업체를 선택하여 시공까지 진행하실 수 있습니다. 견적 상담을 통해 현장 측정부터 설치까지 전 과정을 지원해드립니다.'
            }
        ],
        '서비스': [
            {
                question: '호빵은 무슨 뜻인가요?',
                answer: '"호빵"은 "호구 빵명"의 줄임말로, 누구나 창호 견적을 쉽고 투명하게 받을 수 있도록 돕겠다는 의미를 담고 있어요. 복잡한 과정 없이 편하게 비교하고, 합리적인 선택을 하실 수 있도록 만든 서비스입니다.'
            },
            {
                question: '호빵은 어떤 서비스를 하고있나요?',
                answer: '창호 견적 비교 서비스를 주로 제공하며, 견적 상담, 현장 측정, 시공 연결 등 창호 교체의 전 과정을 지원합니다. 또한 창호 관련 궁금증을 해결해드리는 지식인 서비스도 준비 중입니다.'
            }
        ],
        '시공': [
            {
                question: '시공까지 진행된다면 절차는 어떻게 되나요?',
                answer: '①견적 상담 → ②현장 측정 → ③최종 견적 확정 → ④계약 및 일정 조율 → ⑤시공 진행 → ⑥완료 후 점검 순으로 진행됩니다. 각 단계별로 담당자가 안내해드립니다.'
            },
            {
                question: '시공비용은 어떻게 결제하나요?',
                answer: '일반적으로 100% 선금으로 받고있습니다. 현금, 카드, 계좌이체 모두 지원하며, 세금계산서 발행도 가능합니다.'
            },
            {
                question: '누가 시공팀으로 오는지 궁금합니다.',
                answer: '선택하신 업체의 전문 시공팀이 직접 방문합니다. 모든 시공팀은 해당 브랜드의 인증을 받은 전문가들로, 풍부한 경험과 기술력을 보유하고 있습니다.'
            }
        ],
        '기타': [
            {
                question: 'A/S는 어떻게 진행되고 있나요?',
                answer: '시공 완료 후 각 브랜드별 A/S 정책에 따라 지원됩니다. 일반적으로 10년의 보증기간이 제공되며, A/S가 필요한 경우 저희를 통해 연결해드립니다.'
            },
            {
                question: '제휴/협업 문의는 어떻게 하나요?',
                answer: '비즈니스 제휴나 협업 문의는 카카오톡 채널 또는 고객센터를 통해 남겨주세요. 상세한 제안서와 함께 연락주시면 검토 후 빠르게 답변드리겠습니다. 편하신 경우, 전화로 직접 문의 주셔도 괜찮습니다.'
            },
            {
                question: '이벤트/혜택 관련 알고싶습니다.',
                answer: '현재 진행 중인 이벤트와 할인 혜택은 메인 페이지와 견적 결과에서 확인하실 수 있습니다. 신규 이벤트 소식은 커뮤니티 공지사항 혹은 카카오톡 채널로 안내해드립니다.'
            }
        ]
    };

    return (
        <div className="counsel-container">
            {/* Header */}
            <header className="counsel-header">
                <div className="header-content">
                    <div className="logo-container">
                        <img src="/assets/hoppang-character.png" alt="Hoppang Logo" className="logo-img" />
                        <span className="logo-text">고객센터</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="counsel-main">
                {/* Hero Section */}
                <section className="hero-section">
                    <div className="hero-content">
                        <div className="hero-icon">
                            <img src="/assets/Counsel/counselor-hoppang-character.png" alt="hoppang-counselor" className="counselor-img" />
                        </div>
                        <div className="hero-text">
                            <h1 className="hero-title">무엇을 도와드릴까요?</h1>
                            <p className="hero-subtitle">궁금한 점이 있으시면 언제든 문의해주세요</p>
                        </div>
                    </div>
                    <div className="operating-hours">
                        <div className="hours-info">
                            <span className="hours-icon">🕒</span>
                            <div className="hours-text">
                                <div className="hours-main">평일 09:00 - 20:00</div>
                                <div className="hours-sub">주말/공휴일 09:00 - 19:00</div>
                            </div>
                        </div>
                        <p className="hours-notice">
                            영업시간 외에는 카카오톡으로 문의를 남겨주시면<br />
                            빠른 시일 내로 답변드리겠습니다
                        </p>
                    </div>
                </section>

                {/* Contact Methods */}
                <section className="contact-section">
                    <div className="section-header">
                        <h2 className="section-title">
                            <span className="title-icon">💬</span>
                            상담 방법
                        </h2>
                    </div>
                    <div className="contact-methods">
                        <div className="contact-card primary" onClick={directInquiry}>
                            <div className="contact-icon kakao">
                                <img
                                    src="/assets/Sso/kakao-logo.png"
                                    alt="Kakao"
                                    style={{width: '100%', height: '100%'}}
                                    className="icon-img"
                                />
                            </div>
                            <div className="contact-content">
                                <h3 className="contact-title">카카오톡 문의</h3>
                                <p className="contact-description">빠르고 편리한 실시간 상담</p>
                            </div>
                            <div className="contact-arrow">→</div>
                        </div>

                        <div className="contact-card" onClick={handlePhoneInquiry}>
                            <div className="contact-icon phone">
                                <img
                                    src="/assets/Counsel/tel-logo.png"
                                    alt="Tel"
                                    style={{width: '70%', height: '70%'}}
                                    className="icon-img"
                                />
                            </div>
                            <div className="contact-content">
                                <h3 className="contact-title">전화 문의</h3>
                                <p className="contact-description">음성으로 자세한 상담 받기</p>
                            </div>
                            <div className="contact-arrow">→</div>
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="faq-section" ref={faqSectionRef}>
                    <div className="section-header">
                        <h2 className="section-title">
                            <span className="title-icon">❓</span>
                            자주 묻는 질문
                        </h2>
                    </div>

                    <div className="faq-container">
                        <div className="tab-wrapper">
                            <div
                                className={`tab-header ${showLeftFade ? 'fade-left' : ''} ${showRightFade ? 'fade-right' : ''}`}
                                ref={tabHeaderRef}
                            >
                                {tabs.map((tab) => (
                                    <button
                                        key={tab}
                                        className={`tab-button ${activeTab === tab ? 'active' : ''}`}
                                        onClick={() => {
                                            setExpandedFaqIndex(null);
                                            setActiveTab(tab);
                                        }}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="faq-content">
                            {faqQAData[activeTab]?.map((item, index) => (
                                <div key={index} className="faq-item">
                                    <button
                                        className={`faq-question ${expandedFaqIndex === index ? 'expanded' : ''}`}
                                        onClick={() => setExpandedFaqIndex(expandedFaqIndex === index ? null : index)}
                                    >
                                        <span className="question-text">{item.question}</span>
                                        <span className="question-arrow">
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                <path
                                                    d="M4 6L8 10L12 6"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </span>
                                    </button>
                                    {expandedFaqIndex === index && (
                                        <div className="faq-answer">
                                            <p>{item.answer}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <BottomNavigator userData={userData} />
        </div>
    )
}

export default Counsel;
