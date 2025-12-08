import React from 'react';

import './styles.css';


const TermOfUse = () => {

    const handGoBack = () => {
        window.location.href = document.referrer;
    }


    return (
        <>
            <header className="header">
                <div className="header-content">
                    <button className="back-btn" onClick={handGoBack}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                  stroke-linejoin="round"/>
                        </svg>
                    </button>
                    <div className="header-title">
                        <h1>이용약관</h1>
                    </div>
                </div>
            </header>

            <div className="container">
                <header className="content-header">
                    <h1>호빵 이용약관</h1>
                    <p className="intro">
                        호빵(이하 '회사')이 제공하는 모바일 애플리케이션 서비스 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정합니다.
                        본 약관을 숙지하시고 서비스를 이용해 주시기 바랍니다.
                    </p>
                </header>

                <nav className="toc">
                    <h2>목차</h2>
                    <ol>
                        <li><a href="#section1">목적</a></li>
                        <li><a href="#section2">용어의 정의</a></li>
                        <li><a href="#section3">약관의 효력 및 변경</a></li>
                        <li><a href="#section4">서비스의 제공</a></li>
                        <li><a href="#section5">서비스 이용</a></li>
                        <li><a href="#section6">개인정보보호</a></li>
                        <li><a href="#section7">서비스 이용의 제한</a></li>
                        <li><a href="#section8">면책사항</a></li>
                        <li><a href="#section9">손해배상</a></li>
                        <li><a href="#section10">분쟁의 해결</a></li>
                        <li><a href="#section11">고객센터</a></li>
                    </ol>
                </nav>

                <main className="content">
                    <section id="section1" className="section">
                        <h2>제1조 (목적)</h2>
                        <p>본 약관은 호빵(이하 "회사")가 제공하는 호빵 모바일 애플리케이션 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자 간의 권리, 의무 및 책임사항을 규정함을
                            목적으로 합니다.</p>
                    </section>

                    <section id="section2" className="section">
                        <h2>제2조 (용어의 정의)</h2>
                        <ol>
                            <li><strong>"서비스"</strong>란 회사가 제공하는 호빵 모바일 애플리케이션 및 관련 제반 서비스를 의미합니다.</li>
                            <li><strong>"이용자"</strong>란 본 약관에 따라 회사가 제공하는 서비스를 받는 자를 의미합니다.</li>
                            <li><strong>"웹뷰"</strong>란 모바일 애플리케이션 내에서 웹 콘텐츠를 표시하는 기술을 의미합니다.</li>
                            <li><strong>"콘텐츠"</strong>란 서비스를 통해 제공되는 정보, 텍스트, 이미지, 동영상 등 모든 형태의 정보를 의미합니다.</li>
                        </ol>
                    </section>

                    <section id="section3" className="section">
                        <h2>제3조 (약관의 효력 및 변경)</h2>
                        <ol>
                            <li>본 약관은 서비스 화면에 게시하거나 기타의 방법으로 이용자에게 공지함으로써 효력을 발생합니다.</li>
                            <li>회사는 필요 시 관련 법령에 위배되지 않는 범위에서 본 약관을 개정할 수 있습니다.</li>
                            <li>약관이 개정될 경우, 회사는 개정된 약관을 적용일자 7일 전부터 서비스 내 공지사항을 통해 공지합니다.</li>
                            <li>이용자가 개정된 약관에 동의하지 않는 경우, 서비스 이용을 중단하고 회원 탈퇴를 할 수 있습니다.</li>
                        </ol>
                    </section>

                    <section id="section4" className="section">
                        <h2>제4조 (서비스의 제공)</h2>
                        <ol>
                            <li>회사는 이용자에게 호빵 서비스를 제공합니다.</li>
                            <li>서비스는 웹뷰 기술을 통해 모바일 애플리케이션 내에서 웹 콘텐츠를 제공합니다.</li>
                            <li>서비스는 연중무휴, 1일 24시간 제공함을 원칙으로 하나, 다음의 경우 서비스가 일시 중단될 수 있습니다:
                                <ul>
                                    <li>시스템 점검, 보수, 교체 및 고장, 통신 두절 등의 사유</li>
                                    <li>정전, 제반 설비의 장애 또는 이용량의 폭주 등으로 정상적인 서비스 이용에 지장이 있는 경우</li>
                                    <li>기타 불가항력적 사유가 있는 경우</li>
                                </ul>
                            </li>
                            <li>회사는 서비스의 일부 또는 전부를 회사의 정책 및 운영의 필요상 수정, 중단, 변경할 수 있습니다.</li>
                        </ol>
                    </section>

                    <section id="section5" className="section">
                        <h2>제5조 (서비스 이용)</h2>
                        <ol>
                            <li>이용자는 본 약관과 관련 법령을 준수하여야 합니다.</li>
                            <li>이용자는 서비스 이용 시 다음 각 호의 행위를 하여서는 안 됩니다:
                                <ul>
                                    <li>다른 이용자의 개인정보를 수집, 저장, 공개하는 행위</li>
                                    <li>서비스의 안정적 운영을 방해하는 행위</li>
                                    <li>회사나 타인의 지적재산권을 침해하는 행위</li>
                                    <li>공공질서나 미풍양속에 위배되는 행위</li>
                                    <li>불법적이거나 부적절한 콘텐츠를 게시하는 행위</li>
                                    <li>바이러스, 악성코드 등을 고의로 전송하거나 유포하는 행위</li>
                                    <li>서비스를 이용하여 얻은 정보를 회사의 사전 승낙 없이 복제, 송신, 출판, 배포, 방송하거나 기타 방법에 의하여 영리목적으로 이용하는 행위
                                    </li>
                                </ul>
                            </li>
                            <li>이용자는 관계법령, 본 약관의 규정, 이용안내 및 서비스상에 공지한 주의사항, 회사가 통지하는 사항 등을 준수하여야 합니다.</li>
                        </ol>
                    </section>

                    <section id="section6" className="section">
                        <h2>제6조 (개인정보보호)</h2>
                        <ol>
                            <li>회사는 관련 법령에 따라 이용자의 개인정보를 보호합니다.</li>
                            <li>개인정보의 수집, 이용, 제공, 보관, 파기 등에 관한 사항은 별도의 개인정보처리방침에 따릅니다.</li>
                            <li>회사는 이용자의 개인정보를 본인의 승낙 없이 제3자에게 누설, 배포하지 않습니다. 단, 관련 법령에 의해 관계기관의 요구가 있는 경우는 예외로 합니다.
                            </li>
                        </ol>
                    </section>

                    <section id="section7" className="section">
                        <h2>제7조 (서비스 이용의 제한)</h2>
                        <ol>
                            <li>회사는 이용자가 본 약관을 위반한 경우 사전 통지 없이 서비스 이용을 제한하거나 중단할 수 있습니다.</li>
                            <li>회사는 다음 각 호에 해당하는 경우 서비스 제공을 중단할 수 있습니다:
                                <ul>
                                    <li>설비의 보수 등을 위해 부득이한 경우</li>
                                    <li>전기통신사업법에 규정된 기간통신사업자가 전기통신 서비스를 중지한 경우</li>
                                    <li>기타 불가항력적 사유가 있는 경우</li>
                                </ul>
                            </li>
                            <li>회사는 서비스 중단의 경우 미리 공지합니다. 단, 회사가 통제할 수 없는 사유로 인한 서비스의 중단의 경우는 사후에 통지할 수 있습니다.</li>
                        </ol>
                    </section>

                    <section id="section8" className="section">
                        <h2>제8조 (면책사항)</h2>
                        <ol>
                            <li>회사는 천재지변, 전쟁 및 기타 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 대한 책임이 면제됩니다.</li>
                            <li>회사는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.</li>
                            <li>회사는 서비스에 표출된 이용자의 의견이나 정보에 대해서는 책임을 지지 않습니다.</li>
                            <li>회사는 이용자가 서비스를 이용하여 기대하는 손익이나 결과를 얻지 못한 것에 대하여 책임을 지지 않습니다.</li>
                            <li>회사는 무료로 제공되는 서비스 이용과 관련하여 관련 법령에 특별한 규정이 없는 한 책임을 지지 않습니다.</li>
                        </ol>
                    </section>

                    <section id="section9" className="section">
                        <h2>제9조 (손해배상)</h2>
                        <ol>
                            <li>회사와 이용자는 서비스 이용과 관련하여 고의 또는 중대한 과실로 상대방에게 손해를 끼친 경우에는 그 손해를 배상할 책임이 있습니다.</li>
                            <li>회사가 이용자에게 배상하는 손해의 범위는 통상손해에 한합니다.</li>
                            <li>회사는 무료 서비스의 장애, 제공 중단, 보관된 자료 멸실 또는 삭제, 변조 등으로 인한 손해에 대하여는 배상책임을 지지 않습니다.</li>
                        </ol>
                    </section>

                    <section id="section10" className="section">
                        <h2>제10조 (분쟁의 해결)</h2>
                        <ol>
                            <li>회사와 이용자 간에 발생한 분쟁에 대해서는 대한민국의 법령을 적용합니다.</li>
                            <li>서비스 이용으로 발생한 분쟁에 대해 소송이 제기되는 경우 회사의 본사 소재지를 관할하는 법원을 관할법원으로 합니다.</li>
                            <li>회사와 이용자는 서비스와 관련하여 발생한 분쟁을 원만하게 해결하기 위하여 필요한 모든 노력을 하여야 합니다.</li>
                        </ol>
                    </section>

                    <section id="section11" className="section">
                        <h2>제11조 (고객센터)</h2>
                        <p>서비스 이용과 관련하여 문의사항이나 불만이 있는 경우 다음의 고객센터로 연락하시기 바랍니다.</p>

                        <div className="contact-info">
                            <h3>▶ 호빵 고객센터</h3>
                            <ul>
                                <li><strong>이메일</strong>: ho9nobody@gmail.com</li>
                                <li><strong>전화</strong>: 010-8825-7754 (평일 09:00~18:00)</li>
                            </ul>
                        </div>
                    </section>

                    <section className="section">
                        <h2>부칙</h2>
                        <ol>
                            <li>본 약관은 2025년 1월 1일부터 시행됩니다.</li>
                            <li>이전 약관은 본 약관으로 대체되며, 개정된 약관의 적용일 이후 체결되는 계약부터 적용됩니다.</li>
                        </ol>
                    </section>
                </main>
            </div>
        </>
    );
}

export default TermOfUse;