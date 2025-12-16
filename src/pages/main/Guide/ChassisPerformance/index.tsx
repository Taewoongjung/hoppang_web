import React from 'react';
import { useHistory } from 'react-router-dom';

import '../styles.css';
import '../../versatile-styles.css';

import {goToCommunity, goToQuote, handleShare, kakaoInquiry} from "../util";
import {EnhancedGoToTopButton} from "../../../../util/renderUtil";
import { Helmet } from 'react-helmet-async';

const ChassisPerformance = () => {
    const history = useHistory();

    return (
        <>
            <Helmet>
                <title>창호 성능 비교 가이드 - 호빵</title>
                <meta name="description"
                      content="호빵이 알려주는 창호 가격·성능 체크 포인트. 브랜드보다 중요한 유리와 옵션, 견적 비교 시 꼭 체크해야 할 사항을 확인하세요."/>

                <meta property="og:type" content="website"/>
                <meta property="og:title" content="창호 성능 비교 가이드 - 호빵(호구빵명) 창호"/>
                <meta property="og:description" content="호빵이 알려주는 창호 가격·성능 체크 포인트. 브랜드보다 중요한 유리와 옵션, 견적 비교 시 꼭 체크해야 할 사항을 확인하세요."/>
                <meta property="og:image" content="https://hoppang-guide-image.s3.ap-southeast-2.amazonaws.com/chassis-performance-guide-thumbnail.png"/>
                <meta property="og:url" content="https://hoppang.store/v2/guide/chassisperformance"/>

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
                    <button className="share-btn" onClick={() => handleShare('"창호 성능 비교 가이드 - 호빵(호구빵명) 창호"')}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path
                                d="M15 6.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM5 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM15 18.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
                                stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M7.5 10.5L12.5 7.5M7.5 10.5L12.5 16.5" stroke="currentColor"
                                  strokeWidth="1.5"/>
                        </svg>
                    </button>

                    <h1>
                        창호 성능 비교 가이드
                    </h1>
                    <p className="sub-title">
                        호빵이 알려주는 창호 가격·성능 체크 포인트
                    </p>
                </div>

                <div className="content">
                    <div className="guide-section">
                        <div className="section-header">
                            <h2>💡 발코니창은 최소사양으로</h2>
                        </div>
                        <div className="section-content">
                            <div className="guide-item">
                                <p>
                                    창호는 고급형을 쓴다고 해서 단열이나 방음이 체감될 만큼 좋아지지 않아요.
                                    <br/>
                                    👉 핵심은 <strong>유리 두께</strong>이에요.
                                    <br/>
                                    고급형 발코니창에 26T 페어 유리를 쓴다 해도 성능이 좋아지지 않아요.<br/>
                                    기본형 발코니창과 22T 페어 유리와 시험성적서 상의 성능은 거의 같아요.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="guide-section">
                        <div className="section-header">
                            <h2>🏷️ 브랜드보다 중요한 건 유리와 옵션</h2>
                        </div>
                        <div className="section-content">
                            <div className="guide-item">
                                <p>
                                    “LX, KCC, 현대L&C 중 뭐가 더 좋아요?” 라는 질문 많이 받아요.<br/>
                                    사실 <strong>브랜드 차이보다 중요한 건 유리 두께, 로이(Low-E) 적용</strong>이에요.
                                    <br/>
                                    가격과 성능은 결국 유리성능, 자동핸들 같은 옵션에서 갈려요.
                                    <br/>
                                    그럼에도 1군 브랜드, 그중에서도 직영점을 써야하는 결정적인 이유는<br/>
                                    결국 <strong>A/S를 본사에서 받기 위함</strong>입니다.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="guide-section">
                        <div className="section-header">
                            <h2>📏 두꺼운 창틀이 무조건 좋은 건 아니에요</h2>
                        </div>
                        <div className="section-content">
                            <div className="guide-item">
                                <p>
                                    예전에는 창틀이 두꺼우면 튼튼해 보였지만,<br/>
                                    지금은 기술 발달로 <strong>얇아도 단열·방음 성능 충분히 낼 수 있어요.</strong><br/>
                                    👉 두께만 보고 판단하지 마세요.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="guide-section">
                        <div className="section-header">
                            <h2>🪟 창호는 기본형으로도 충분해요</h2>
                        </div>
                        <div className="section-content">
                            <div className="guide-item">
                                <p>
                                    창호는 제일 기본형으로도 충분히 좋아요.<br/>
                                    더 좋은 사양을 원한다면 전체 금액의 <strong>7~10% 정도만 추가</strong>하면 됩니다.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="guide-section">
                        <div className="section-header">
                            <h2>✅ 견적 비교할 때 꼭 체크하세요</h2>
                        </div>
                        <div className="section-content">
                            <div className="guide-item">
                                <ul>
                                    <li><strong>유리 두께 & Low-E 적용 여부</strong></li>
                                    <li><strong>창호가 기본형인지, 고급형인지</strong></li>
                                    <li><strong>핸들 유무</strong></li>
                                </ul>
                                <p>이 3가지만 체크해도 견적 차이를 쉽게 이해할 수 있어요.</p>
                            </div>
                        </div>

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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                            </svg>
                        </button>
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

                <EnhancedGoToTopButton
                    onGoToList={undefined}
                    showListButton={false}
                />

                <div className="bottom-padding"></div>
            </div>
        </>
    );
}

export default ChassisPerformance;
