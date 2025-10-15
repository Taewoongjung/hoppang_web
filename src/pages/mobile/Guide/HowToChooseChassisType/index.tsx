import React, {useState} from 'react';
import { Helmet } from 'react-helmet-async';

import '../styles.css';
import '../../versatile-styles.css';

import {goToCommunity, handleShare, kakaoInquiry} from "../util";
import ImageViewer from "../../../../component/V2/ImageViewer";
import {EnhancedGoToTopButton} from "../../../../util/renderUtil";

const ChassisGuidePage = () => {

    const [imageViewerOpen, setImageViewerOpen] = useState(false);
    const [currentImageSrc, setCurrentImageSrc] = useState(''); // 현재 이미지 URL 저장

    // 수정: imageSrc 파라미터를 실제로 저장하고 사용
    const openImageViewer = (imageSrc: string) => {
        setCurrentImageSrc(imageSrc);
        setImageViewerOpen(true);
    };

    const closeImageViewer = () => {
        setImageViewerOpen(false);
        setCurrentImageSrc(''); // 이미지 URL 초기화
    };


    return (
        <>
            <Helmet>
                <title>호빵 창호 견적 가이드 - 창호 종류 알아보기</title>
                <meta name="description" content="창호 견적 전에 꼭 알아야 할 창호 종류 선택법"/>

                {/* Open Graph 태그 */}
                <meta property="og:type" content="website"/>
                <meta property="og:title" content="호빵 창호 견적 가이드"/>
                <meta property="og:description" content="창호 견적 전에 꼭 알아야 할 창호 종류 선택법"/>
                <meta property="og:image"
                      content="https://hoppang-guide-image.s3.ap-southeast-2.amazonaws.com/20py_apt.jpg"/>
                <meta property="og:url" content="https://hoppang.store/v2/guide/chassisperformance"/>

                {/* 카카오톡 공유용 */}
                <meta property="og:image:width" content="1200"/>
                <meta property="og:image:height" content="630"/>
            </Helmet>

            <div className="container">
                <div className="header">
                    <button className="back-btn" onClick={() => window.location.href = '/'}>←</button>
                    <img
                        src="/assets/hoppang-character.png"
                        alt="호빵 캐릭터"
                        className="character-img"
                    />
                    <button className="share-btn" onClick={handleShare}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path
                                d="M15 6.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM5 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM15 18.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"
                                stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M7.5 10.5L12.5 7.5M7.5 10.5L12.5 16.5" stroke="currentColor"
                                  strokeWidth="1.5"/>
                        </svg>
                    </button>

                    <h1>
                        호빵 창호 견적 가이드
                    </h1>
                    <p>창호 종류 알아보기</p>
                    <p className="sub-title">
                        견적 전에 꼭 알아야 할 창호 종류 선택법
                    </p>
                </div>

                <div className="content">
                    <div className="guide-section">
                        <div className="section-header">
                            <h2>가이드를 보셔야 하는 이유</h2>
                        </div>
                        <div className="section-content">
                            <div className="guide-item">
                                <p>
                                    호빵에서는 창호 견적을 산출할 때, 고객님 댁의 도면을 바탕으로 위치별로 설치되는 <strong>창호 종류</strong>를 선택하게 되어요.<br/>
                                    또한 "어떤 공간에 어떤 창호가 들어가는지" 궁금하실 때에도 이 과정을 통해 쉽게 확인하실 수 있어요 🙂<br/>
                                    <ul>
                                    <li>
                                            같은 위치라도 발코니 단창, 이중창, 내창, 분합창 등<strong>종류가
                                            다르기 때문에 가격이 달라져요.</strong>
                                        </li>
                                        <li>
                                            정확한 종류를 알아야 <strong>견적이 정확하게 산출</strong>되어요.
                                        </li>
                                    </ul>
                                    👉 이 가이드는 고객님이 도면 속 창호 위치와 종류를 이해하고, 호빵 견적을 쉽게 확인하실 수 있도록 준비했어요.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="guide-section">
                        <div className="section-header">
                            <h2>🪟 창호 종류 구분법</h2>
                        </div>
                        <div className="section-content">
                            <div className="guide-item">
                                <p>호빵에서 사용하는 샷시 종류는 다음과 같아요.</p>

                                <ol className="chassis-list">
                                    <li className="chassis-item">
                                        <div className="chassis-name">발코니 단창</div>
                                        <div className="chassis-description">외부 발코니에 설치되는 단일 창</div>
                                    </li>
                                    <li className="chassis-item">
                                        <div className="chassis-name">발코니 이중창</div>
                                        <div className="chassis-description">외부 발코니, 단열·방음 강화</div>
                                    </li>
                                    <li className="chassis-item">
                                        <div className="chassis-name">내창 단창</div>
                                        <div className="chassis-description">거실/방 ↔ 발코니 단창</div>
                                    </li>
                                    <li className="chassis-item">
                                        <div className="chassis-name">내창 이중창</div>
                                        <div className="chassis-description">거실/방 ↔ 발코니 이중창, 가장 보편적</div>
                                    </li>
                                    <li className="chassis-item">
                                        <div className="chassis-name">거실 분합창</div>
                                        <div className="chassis-description">거실 발코니에 설치, 넓게 열림</div>
                                    </li>
                                    <li className="chassis-item">
                                        <div className="chassis-name">픽스창</div>
                                        <div className="chassis-description">고정형 창, 열리지 않음, 채광용</div>
                                    </li>
                                    <li className="chassis-item">
                                        <div className="chassis-name">터닝도어</div>
                                        <div className="chassis-description">발코니 출입용 문, 밀폐력 우수</div>
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    <div className="guide-section">
                        <div className="section-header">
                            <h2>📜 도면에서 확인하는 방법</h2>
                        </div>
                        <div className="section-content">
                            <div className="guide-item">
                                <p>도면을 보면서 창호가 종류별로 어디에 들어가는지 확인해보세요. 훨씬 더 직관적으로 이해하실 수 있어요.</p>

                                <div className="image-gallery">
                                    <div className="gallery-item">
                                        <h4>20평대 아파트 도면</h4>
                                        <img
                                            src="https://hoppang-guide-image.s3.ap-southeast-2.amazonaws.com/20py_apt.jpg"
                                            alt="가이드 1"
                                            className="guide-image"
                                            onClick={() => openImageViewer("https://hoppang-guide-image.s3.ap-southeast-2.amazonaws.com/20py_apt.jpg")}
                                        />
                                        {/*<p className="image-description">발코니 단창과 이중창의 위치를 확인할 수 있어요</p>*/}
                                    </div>

                                    <div className="gallery-item">
                                        <h4>30평대 아파트 도면</h4>
                                        <img
                                            src="https://hoppang-guide-image.s3.ap-southeast-2.amazonaws.com/30py_apt.jpg"
                                            alt="가이드 2"
                                            className="guide-image"
                                            onClick={() => openImageViewer("https://hoppang-guide-image.s3.ap-southeast-2.amazonaws.com/30py_apt.jpg")}
                                        />
                                        {/*<p className="image-description">거실과 방에서 발코니로 연결되는 내창 위치</p>*/}
                                    </div>
                                </div>

                                <div className="tip-box">
                                    <h4>알아두면 좋아요</h4>
                                    <p>외부와 내부 사이에는 꼭 이중창이 필요해요.<br/>즉, 외부와 맞닿는 창은 두 겹으로 되어 있어야 해요.</p>
                                </div>
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

                {/* 수정: currentImageSrc를 사용하여 동적으로 이미지 표시 */}
                {imageViewerOpen && (
                    <ImageViewer
                        isOpen={imageViewerOpen}
                        onClose={closeImageViewer}
                        imageSrc={currentImageSrc}
                    />
                )}

                <EnhancedGoToTopButton
                    onGoToList={undefined}
                    showListButton={false}
                />

                <div className="bottom-padding"></div>
            </div>
        </>
    );
};

export default ChassisGuidePage;
