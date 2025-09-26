import React from 'react';

import '../styles.css';
import '../../versatile-styles.css';

const HoppangProcess = () => {

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
                        호빵 견적부터 시공 한눈에 보기
                    </h1>
                    <p>처음 상담부터 완공까지, 호빵이 함께합니다.</p>
                </div>
                <div className="guide-section">
                    <div className="section-content">
                        <div className="guide-item">
                            <h3>호빵 견적 부터 시공 프로세스</h3>
                            <p>안전한 설치를 위해 다음 사항들을 확인해주세요.</p>

                            <ol className="guide-steps">
                                <li>호빵에서 견적</li>
                                <li>문의 (카카오톡, 전화)</li>
                                <li>실측 (선납금 입금 시)</li>
                                <li>시공 날짜 상의</li>
                                <li>시공</li>
                            </ol>

                            <div className="check-box">
                                <h4>선납금</h4>
                                <p>선납금은 계약 시 전체 금액에 포함 됩니다.</p>
                            </div>

                            <div className="check-box">
                                <h4>계약금</h4>
                                <p>계약금은 100% 선납으로 진행중입니다.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default HoppangProcess;