import React from 'react';
import { useHistory } from 'react-router-dom';

import './styles.css';
import '../versatile-styles.css';

import axios from "axios";
import {callMeData} from "../../../definition/apiPath";
import useSWR from "swr";
import fetcher from "../../../util/fetcher";

const Agreement = () => {

    const history = useHistory();


    const { data: userData, error, mutate } = useSWR(callMeData, fetcher, {
        dedupingInterval: 2000
    });

    const checkIfLoggedIn = () => {
        axios.get(callMeData, {
            headers: {
                withCredentials: true,
                Authorization: localStorage.getItem("hoppang-token")
            },
        }).then((res) => {
        }).catch((err) => {
            history.push("/login?needed=true");
        })
    }

    const handleAgree = async () => {
        await checkIfLoggedIn(); // 로그인 했는지 확인하기

        try {
            await mutate().then((user) => {
                if (user.tel === '') {
                    history.push(`/login/first?remainedProcess=true&userEmail=${user.email}`);
                    return;
                } else {
                    history.push('/v2/calculator');
                }
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleDisagree = () => {
        history.goBack();
    };

    return (
        <div className="app-container">
            {/* Header */}
            <header className="app-header">
                <div className="header-content">
                    <div className="logo-container">
                        <img src="/assets/hoppang-character.png" alt="Hoppang Logo" className="logo-img" />
                        <span className="logo-text">호빵</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="main-content">
                <section className="hero-section">
                    <div className="hero-content">
                        <h2 className="hero-title">샷시 견적 서비스를 시작하기 전에</h2>
                        <p className="hero-subtitle">아래 내용을 확인해주세요</p>
                    </div>
                    <div className="hero-illustration">
                        <div className="window-icon">🏠</div>
                    </div>
                </section>

                {/* Agreement Content */}
                <div className="agreement-content">
                    <section className="agreement-section">
                        <h3 className="section-title">호빵 소개</h3>
                        <div className="agreement-card">
                            <h4 className="card-title">호구 빵명 프로젝트란?</h4>
                            <div className="card-content">
                                <p className="highlight-text">
                                    "왜 인테리어 견적비에는 명확한 기준이 없을까?"
                                </p>
                                <p>
                                    통일된 창호 가격 기준을 제시하여 소비자가 신뢰할 수 있는 금액을 만들어보고자 합니다.
                                </p>
                                <p className="purpose-text">
                                    창호 금액의 기준을 제시합니다.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="agreement-section">
                        <h3 className="section-title">주의사항</h3>
                        <div className="agreement-card">
                            <div className="notice-list">
                                <div className="notice-item">
                                    <div className="notice-icon">⚠️</div>
                                    <p>본 서비스는 참고용이며, 실제 창호 제작 시 가격은 다를 수 있습니다.</p>
                                </div>
                                <div className="notice-item">
                                    <div className="notice-icon">⚡</div>
                                    <p>에너지 효율등급은 전체 창호 교체 시 2등급을 기준으로 합니다.</p>
                                </div>
                                <div className="notice-item">
                                    <div className="notice-icon">🪟</div>
                                    <p>각 회사별 발코니 창은 기본 사양 제품 기준입니다.</p>
                                </div>
                                <div className="notice-item">
                                    <div className="notice-icon">🚚</div>
                                    <div>
                                        <p><strong>양중비용 관련:</strong></p>
                                        <ul className="sub-notice-list">
                                            <li>사다리차 비용은 지역에 따라 상이할 수 있습니다.</li>
                                            <li>사다리차 사용이 불가능한 경우 추가 비용이 발생할 수 있습니다.</li>
                                            <li>양중이 불가능한 상황이 있을 수 있습니다. (예: 시스템 창호, 도로 혼잡 지역의 거실창 등)</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {/* Bottom Action Buttons */}
            <footer className="agreement-footer">
                <button className="button-secondary" onClick={handleDisagree}>
                    <span>미동의</span>
                </button>
                <button className="button-primary" onClick={handleAgree}>
                    <span>동의하고 견적 받기</span>
                </button>
            </footer>
        </div>
    );
};

export default Agreement;
