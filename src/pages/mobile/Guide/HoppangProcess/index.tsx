import React from 'react';

import '../styles.css';
import '../../versatile-styles.css';
import {goToCommunity, goToQuote, kakaoInquiry} from "../util";
import {Helmet} from "react-helmet";

const HoppangProcess = () => {

    return (
        <>
            <Helmet>
                <title>호빵 견적 → 시공까지 한눈에!</title>
                <meta name="description" content="처음 상담부터 완공까지, 호빵이 함께합니다. 견적부터 시공까지 복잡하지 않게 진행됩니다."/>

                <meta property="og:type" content="website"/>
                <meta property="og:title" content="호빵 견적 → 시공까지 한눈에!"/>
                <meta property="og:description" content="처음 상담부터 완공까지, 호빵이 함께합니다."/>
                <meta property="og:image" content="https://hoppang-guide-image.s3.ap-southeast-2.amazonaws.com/hoppang-process-thumbnail.png"/>
                <meta property="og:url" content="https://hoppang.store/v2/guide/process"/>

                <meta property="og:image:width" content="1200"/>
                <meta property="og:image:height" content="630"/>
            </Helmet>

            <div className="container">
                <div className="header">
                    <button className="back-btn" onClick={() => window.location.href = 'https://hoppang.store/chassis/calculator'}>←</button>
                    <img
                        src="/assets/hoppang-character.png"
                        alt="호빵 캐릭터"
                        className="character-img"
                    />
                    <h1>
                        호빵 견적 → 시공까지 한눈에!
                    </h1>
                    <p>처음 상담부터 완공까지, 호빵이 함께합니다.</p>
                </div>

                <div className="guide-section">
                    <div className="section-content">
                        <div className="guide-item">
                            <p>호빵에서는 견적부터 시공까지 복잡하지 않게, 이렇게 진행돼요.</p>

                            <ol className="guide-steps">
                                <li>호빵에서 견적 확인</li>
                                <li>문의하기 (카카오톡 · 전화)</li>
                                <li>실측 진행 (가계약금 입금 후)</li>
                                <li>시공 날짜 협의</li>
                                <li>시공 완료</li>
                            </ol>

                            <div className="check-box">
                                <h4>가계약금</h4>
                                <p>가계약금은 현재 10만원이고, 취소 후 돌려 드려요.</p>
                            </div>

                            <br/>
                            <br/>
                            <button
                                onClick={goToQuote}
                                className="quote-btn"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                                </svg>
                                <span className="text-lg">지금 바로 견적 확인하기</span>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M9 5l7 7-7 7"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <br/>
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