import React from 'react';
import './styles.css';
import BottomNavigator from "../../../component/V2/BottomNavigator";
import useSWR from "swr";
import {callMeData} from "../../../definition/apiPath";
import fetcher from "../../../util/fetcher";

const Initial = () => {

    const { data: userData, error, mutate } = useSWR(callMeData, fetcher, {
        dedupingInterval: 2000
    });


    const services = [
        { id: 1, icon: '🏠', title: '샷시 견적', description: '샷시 견적 서비스' },
        { id: 2, icon: '🪟', title: '샷시 지식인', description: '궁금한 것을 물어보세요', highlight: true },
    ];

    const handleServiceClick = (serviceTitle: string) => {
        if (serviceTitle === '샷시 견적') {
            window.location.href = '/calculator/agreement';
        }
    };

    const recentQuestions = [
        { id: 1, question: '이중창 설치 비용이 궁금해요', category: '설치', time: '2시간 전' },
        { id: 2, question: '샷시 교체 시기는 언제인가요?', category: '교체', time: '4시간 전' },
        { id: 3, question: '결로 현상 해결 방법', category: '수리', time: '6시간 전' },
    ];

    return (
        <div className="app-container">
            {/* Header */}
            <header className="app-header">
                <div className="header-content">
                    <div className="logo-container">
                        <img src="/assets/hoppang-character.png" alt="Hoppang Logo" className="logo-img" />
                        <span className="logo-text">호빵</span>
                    </div>
                    <div className="header-icons">
                        {/*<button className="icon-btn">🔔</button>*/}
                        {/*<button className="icon-btn">📋</button>*/}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="main-content">
                {/* Hero Section */}
                <section className="hero-section">
                    <div className="hero-content">
                        <h2 className="hero-title">샷시 관련 궁금한 점이 있으신가요?</h2>
                        <p className="hero-subtitle">전문가가 직접 답변해드립니다</p>
                        <button className="cta-button">
                            💬 질문하기
                        </button>
                    </div>
                    <div className="hero-illustration">
                        <div className="window-icon">🪟</div>
                    </div>
                </section>

                {/* Services Grid */}
                <section className="services-section">
                    <h3 className="section-title">서비스</h3>
                    <div className="services-grid">
                        {services.map((service) => (
                            <div
                                key={service.id}
                                className={"service-card"}
                                onClick={() => handleServiceClick(service.title)}
                            >
                                <div className="service-icon">{service.icon}</div>
                                <h4 className="service-title">{service.title}</h4>
                                <p className="service-description">{service.description}</p>
                                {service.highlight && <div className="highlight-badge">NEW</div>}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Recent Questions */}
                <section className="questions-section">
                    <div className="section-header">
                        <h3 className="section-title">최근 질문</h3>
                        <button className="see-all-btn">전체보기</button>
                    </div>
                    <div className="questions-list">
                        {recentQuestions.map((q) => (
                            <div key={q.id} className="question-item">
                                <div className="question-content">
                                    <span className="question-category">{q.category}</span>
                                    <p className="question-text">{q.question}</p>
                                    <span className="question-time">{q.time}</span>
                                </div>
                                <button className="question-arrow">→</button>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Bottom Navigation */}
            <BottomNavigator userData={userData}/>
        </div>
    );
};

export default Initial;
