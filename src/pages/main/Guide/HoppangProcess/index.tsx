import React from 'react';
import { useHistory } from 'react-router-dom';

import '../styles.css';
import '../../versatile-styles.css';
import {goToCommunity, goToQuote, handleShare, kakaoInquiry} from "../util";
import { Helmet } from 'react-helmet-async';
import GoogleAdSense from "../../../../component/V2/AdBanner/GoogleAdSense";

const HoppangProcess = () => {
    const history = useHistory();

    // 웹뷰 스와이프 백 제스처 처리
    React.useEffect(() => {
        const handlePopState = () => {
            history.replace('/');
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [history]);

    return (
        <>
            <Helmet>
                <title>호빵 견적 → 시공까지 한눈에!</title>
                <meta name="description" content="처음 상담부터 완공까지, 호빵이 함께합니다. 견적부터 시공까지 복잡하지 않게 진행됩니다."/>

                <meta property="og:type" content="website"/>
                <meta property="og:title" content="호빵 상세견적 → 시공까지 한눈에! - 호빵(호구빵명) 창호"/>
                <meta property="og:description" content="처음 상담부터 완공까지, 호빵이 함께합니다. 비대면 무료 상세견적부터 시공까지 복잡하지 않게 진행됩니다."/>
                <meta property="og:image" content="https://hoppang-guide-image.s3.ap-southeast-2.amazonaws.com/hoppang-process-thumbnail.png"/>
                <meta property="og:url" content="https://hoppang.store/v2/guide/process"/>

                <meta property="og:image:width" content="1200"/>
                <meta property="og:image:height" content="630"/>
            </Helmet>

            <div className="container">
                <div className="header">
                    <button className="back-btn" onClick={() => history.push('/')}>←</button>
                    <img
                        src="/assets/hoppang-character.png"
                        alt="호빵 캐릭터"
                        className="character-img"
                    />
                    <button className="share-btn" onClick={() => handleShare('호빵 견적 → 시공까지 한눈에! - 호빵(호구빵명) 창호')}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path
                                d="M15 6.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM5 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM15 18.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
                                stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M7.5 10.5L12.5 7.5M7.5 10.5L12.5 16.5" stroke="currentColor"
                                  strokeWidth="1.5"/>
                        </svg>
                    </button>

                    <h1>
                        호빵 견적 → 시공까지 한눈에!
                    </h1>
                    <p>처음 상담부터 완공까지, 호빵이 함께합니다.</p>
                </div>

                <GoogleAdSense
                    adSlot="3210423518"
                    className="banner-middle"
                />

                <div className="guide-section">
                    <div className="section-content">
                        <div className="guide-item">
                            <div className="tip-box" style={{marginTop: '16px', background: 'linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%)', border: '2px solid #0ea5e9'}}>
                                <h4 style={{color: '#0369a1', marginBottom: '8px'}}>호빵 견적 = 실제 시공 금액</h4>
                                <p style={{lineHeight: '1.7'}}>
                                    호빵에서 <strong>창호 사이즈를 정확히 입력</strong>하시면,<br/>
                                    비대면으로 받으신 견적이 <strong>실제 시공 금액과 거의 동일</strong>해요.<br/><br/>
                                    <strong>호빵은 처음부터 정확한 상세 금액</strong>을 알려드려요.
                                </p>
                            </div>

                            <br/>
                            <p>호빵에서는 견적부터 시공까지 복잡하지 않게, 이렇게 진행돼요.</p>

                            <ol className="guide-steps">
                                <li>호빵에서 견적 확인</li>
                                <li>문의하기 (카카오톡 · 전화)</li>
                                <li>실측 진행</li>
                                <li>시공 날짜 협의</li>
                                <li>시공 완료</li>
                            </ol>

                            <br/>
                            <button
                                onClick={goToQuote}
                                className="quote-btn"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                </svg>
                                <span className="text-lg">견적 받으러 가기</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M9 5l7 7-7 7"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <br/>
                <div className="guide-section">
                    <div className="section-header">
                        <h2>📞 문의하기</h2>
                    </div>
                    <div className="section-content">
                        <div className="guide-item">
                            <h3>고객지원</h3>
                            <p>추가 문의사항이나 궁금한 점이 있으시면 언제든지 문의해 주세요.</p>

                            <button className="kakao-inquiry-btn" onClick={kakaoInquiry}>
                                <img src="/assets/Sso/kakao-logo.png" alt="카카오톡" className="kakao-logo"/>
                                <span>카카오톡으로 문의하기</span>
                            </button>
                            <button className="community-btn" onClick={goToCommunity}>
                                <span className="community-icon">💬</span>
                                <span>커뮤니티 질문하기</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default HoppangProcess;
