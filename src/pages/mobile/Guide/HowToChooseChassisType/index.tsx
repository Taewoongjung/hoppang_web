import React from 'react';

import './styles.css'

const ChassisGuidePage = () => {

    return (
        <div className="container">
            <div className="header">
                <button className="back-btn" onClick={() => window.location.href='/'}>←</button>
                <h1>호빵 창호 견적 가이드</h1>
                <p>창호 종류 알아보기</p>
            </div>

            <div className="content">
                <div className="guide-section">
                    <div className="section-header">
                        <h2>📋 기본 정보</h2>
                    </div>
                    <div className="section-content">
                        <div className="guide-item">
                            <h3>1. 가이드를 보셔야 하는 이유</h3>
                            <p>
                                호빵에서는 창호 견적을 산출할 때, 고객님 댁의 도면을 바탕으로 위치별로 설치되는 <strong>창호 종류</strong>를 선택하게 되어요.<br/>
                                또한 “어떤 공간에 어떤 창호가 들어가는지” 궁금하실 때에도 이 과정을 통해 쉽게 확인하실 수 있어요 🙂<br/>
                                <ul>
                                    <li>
                                        같은 위치라도 <strong>발코니 단창, 이중창, 내창, 분합창 등 종류</strong>가
                                        다르기 때문에 가격이 달라져요.
                                    </li>
                                    <li>
                                        정확한 종류를 알아야 <strong>견적이 정확하게 산출</strong>되어요.
                                    </li>
                                </ul><br/>
                                👉 이 가이드는 고객님이 도면 속 창호 위치와 종류를 이해하고, 호빵 견적을 쉽게 확인하실 수 있도록 준비했어요.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="guide-section">
                    <div className="section-header">
                        <h2>🔧 설치 가이드</h2>
                    </div>
                    <div className="section-content">
                        <div className="guide-item">
                            <h3>2. 창호 종류 구분법</h3>
                            <p>호빵에서 사용하는 샷시 종류는 다음과 같아요.</p>

                            {/*<div className="warning-box">*/}
                            {/*    <h4>안전 주의사항</h4>*/}
                            {/*    <p>설치 전 반드시 전원을 차단하고 안전장비를 착용해주세요.</p>*/}
                            {/*</div>*/}
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

                        <div className="guide-item">
                            <h3>3. 도면에서 확인하는 방법</h3>
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