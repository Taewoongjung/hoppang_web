import React from 'react';

import './styles.css'

const ChassisGuidePage = () => {

    return (
        <div className="container">
            <div className="header">
                <button className="back-btn" onClick={() => window.location.href='/'}>←</button>
                <h1>샷시 가이드</h1>
                <p>올바른 설치 및 관리 방법</p>
            </div>

            <div className="content">
                <div className="guide-section">
                    <div className="section-header">
                        <h2>📋 기본 정보</h2>
                    </div>
                    <div className="section-content">
                        <div className="guide-item">
                            <h3>샷시란 무엇인가요?</h3>
                            <p>샷시는 전체 구조를 지탱하는 기본 프레임으로, 안정성과 내구성을 제공합니다.</p>
                            <div className="image-placeholder">
                                📸 샷시 구조 이미지
                            </div>
                        </div>
                    </div>
                </div>

                <div className="guide-section">
                    <div className="section-header">
                        <h2>🔧 설치 가이드</h2>
                    </div>
                    <div className="section-content">
                        <div className="guide-item">
                            <h3>설치 전 준비사항</h3>
                            <p>안전한 설치를 위해 다음 사항들을 확인해주세요.</p>

                            <div className="warning-box">
                                <h4>안전 주의사항</h4>
                                <p>설치 전 반드시 전원을 차단하고 안전장비를 착용해주세요.</p>
                            </div>

                            <ol className="guide-steps">
                                <li>작업 공간 확보 및 청소</li>
                                <li>필요한 도구 준비 확인</li>
                                <li>설치 매뉴얼 숙지</li>
                                <li>안전장비 착용 확인</li>
                            </ol>
                        </div>

                        <div className="guide-item">
                            <h3>단계별 설치 과정</h3>
                            <p>정확한 순서에 따라 설치를 진행해주세요.</p>

                            <ol className="guide-steps">
                                <li>베이스 플레이트 위치 확인</li>
                                <li>수평 상태 점검 및 조정</li>
                                <li>고정 볼트 체결</li>
                                <li>연결부 점검</li>
                                <li>최종 테스트 실시</li>
                            </ol>

                            <div className="tip-box">
                                <h4>설치 팁</h4>
                                <p>볼트는 대각선 순서로 조금씩 나누어 조여주세요.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="guide-section">
                    <div className="section-header">
                        <h2>🛠️ 유지보수</h2>
                    </div>
                    <div className="section-content">
                        <div className="guide-item">
                            <h3>정기 점검</h3>
                            <p>최적의 성능 유지를 위한 정기 점검 가이드입니다.</p>

                            <ol className="guide-steps">
                                <li>볼트 체결 상태 확인</li>
                                <li>마모 부위 점검</li>
                                <li>청소 및 윤활</li>
                                <li>작동 테스트</li>
                            </ol>

                            <div className="tip-box">
                                <h4>점검 주기</h4>
                                <p>월 1회 정기 점검을 권장합니다.</p>
                            </div>
                        </div>

                        <div className="guide-item">
                            <h3>문제 해결</h3>
                            <p>자주 발생하는 문제와 해결 방법입니다.</p>

                            <div className="warning-box">
                                <h4>주의사항</h4>
                                <p>복잡한 문제는 전문가에게 문의하세요.</p>
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
                            <p>추가 문의사항이 있으시면 언제든 연락해주세요.</p>

                            <div className="tip-box">
                                <h4>연락처</h4>
                                <p>고객센터: 1588-0000<br/>운영시간: 평일 09:00 - 18:00</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bottom-padding"></div>
        </div>
    );
};

export default ChassisGuidePage;