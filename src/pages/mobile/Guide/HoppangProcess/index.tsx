import React from 'react';

import '../styles.css';
import '../../versatile-styles.css';

const HoppangProcess = () => {

    const goToCommunity = () => {
        window.location.href = '/question/boards';
    }

    const kakaoInquiry = () => {
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


    return (
        <>
            <div className="container">
                <div className="header">
                    <button className="back-btn" onClick={() => window.location.href = '/'}>←</button>
                    <h1>
                        <img
                            src="/assets/hoppang-character.png"
                            alt="호빵 캐릭터"
                            className="character-img"
                        />
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
                                <li>실측 진행 (계약금 입금 후)</li>
                                <li>시공 날짜 협의</li>
                                <li>시공 완료</li>
                            </ol>

                            <div className="check-box">
                                <h4>계약금</h4>
                                <p>계약금은 현재 10만원입니다.</p>
                            </div>
                        </div>
                    </div>
                </div>

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
    )
}

export default HoppangProcess;