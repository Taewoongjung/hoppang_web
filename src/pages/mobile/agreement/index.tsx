import React, {useEffect, useState} from 'react';
import { useHistory } from 'react-router-dom';

import './styles.css';
import '../versatile-styles.css';

import axios from "axios";
import {callMeData} from "../../../definition/apiPath";
import useSWR from "swr";
import fetcher from "../../../util/fetcher";

const Agreement = () => {

    const history = useHistory();

    // Safe area 지원 감지
    const [supportsSafeArea, setSupportsSafeArea] = useState(false);

    // Safe area 지원 여부 확인 및 viewport 설정
    useEffect(() => {
        const checkSafeAreaSupport = () => {
            if (CSS && CSS.supports) {
                const supports = CSS.supports('padding', 'env(safe-area-inset-top)');
                setSupportsSafeArea(supports);

                // body에 safe area 관련 클래스 추가
                if (supports) {
                    document.body.classList.add('supports-safe-area');
                } else {
                    document.body.classList.add('no-safe-area');
                }
            }
        };

        // Safe area를 위한 viewport meta tag 동적 설정
        const setViewportMeta = () => {
            let viewportMeta = document.querySelector('meta[name="viewport"]');
            if (!viewportMeta) {
                viewportMeta = document.createElement('meta');
                viewportMeta.setAttribute('name', 'viewport');
                document.head.appendChild(viewportMeta);
            }

            // Safe area를 고려한 viewport 설정
            viewportMeta.setAttribute('content',
                'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
            );
        };

        setViewportMeta();
        checkSafeAreaSupport();
    }, []);

    useEffect(() => {
        const unblock = history.block((location: any, action: string) => {
            if (action === 'POP') {
                const currentPath = window.location.pathname;

                if (currentPath === '/calculator/result') {
                    window.location.href = '/chassis/calculator';
                } else {
                    window.location.href = '/chassis/calculator';
                }
            }

            return true;
        });

        return () => {
            unblock();
        };
    }, [history]);

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
            history.push("/v2/login?needed=true");
        })
    }

    const handleAgree = async () => {
        await checkIfLoggedIn(); // 로그인 했는지 확인하기

        try {
            await mutate().then((user) => {
                if (user.tel === '') {
                    window.location.href = `/v2/login/first?remainedProcess=true&userEmail=${user.email}`;
                    return;
                } else {
                    window.location.href = '/v2/calculator';
                }
            });
        } catch (error) {
            console.error(error);
        }
    };

    const handleDisagree = () => {
        window.location.href = "/chassis/calculator";
    };

    return (
        <div className="app-container" style={{
            // Safe area를 고려한 인라인 스타일
            paddingTop: supportsSafeArea ? 'env(safe-area-inset-top)' : '0',
            paddingBottom: supportsSafeArea ? 'env(safe-area-inset-bottom)' : '0',
            paddingLeft: supportsSafeArea ? 'env(safe-area-inset-left)' : '0',
            paddingRight: supportsSafeArea ? 'env(safe-area-inset-right)' : '0',
        }}>
            {/* Header */}
            <header className="app-header">
                <div className="header-content">
                    <div className="logo-container">
                        <img src="/assets/hoppang-character.png" alt="Hoppang Logo" className="logo-img"/>
                        <span className="logo-text">호빵</span>
                    </div>
                    <div className="header-greeting">
                        {userData ? (
                            <span className="user-greeting">안녕하세요&nbsp;
                                <strong>{userData.nickname ? userData.nickname : userData.name}</strong>님!
                            </span>
                        ) : (
                            <button
                                className="login-btn"
                                onClick={() => window.location.href = '/v2/login'}
                            >
                                로그인
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="main-content">
                <section className="hero-section">
                    <div className="hero-content">
                        <h2 className="hero-title">창호 견적 서비스를 시작하기 전에</h2>
                        <p className="hero-subtitle">아래 내용을 확인해주세요</p>
                    </div>
                    <div className="hero-illustration">
                        <div className="window-icon">🏠</div>
                    </div>
                </section>

                {/* Agreement Content */}
                <div className="agreement-content">
                    <section className="agreement-section">
                        <h3 className="section-title">견적 전 안내사항</h3>
                        <div className="agreement-card">
                            <div className="notice-list">
                                <div className="notice-item">
                                    <div className="notice-icon">⚠️</div>
                                    <p>본 서비스는 어느정도 참고용이며, 실제 창호 제작 시 약간의 가격 차이는 있을 수 있습니다. <br/><u>(실제로 그날 이벤트에 따라 가격이 저렴할 수도 있어요)</u></p>
                                </div>
                                <div className="notice-item">
                                    <div className="notice-icon">⚡</div>
                                    <p>에너지 효율등급은 전체 창호 교체 시 2등급을 기준으로 합니다.</p>
                                </div>
                                <div className="notice-item">
                                    <div className="notice-icon">🪟</div>
                                    <div><p>각 회사별 창호는 기본 사양 제품 기준입니다.</p></div>
                                </div>
                                <div className="notice-item">
                                    <div className="notice-icon">🚚</div>
                                    <div>
                                        <p><strong>양중비용 관련 내용이에요</strong></p>
                                        <ul className="sub-notice-list">
                                            <li>사다리차 비용은 지역에 따라 상이할 수 있습니다.</li>
                                            <li>사다리차 사용이 불가능한 경우 추가 비용이 발생할 수 있습니다.</li>
                                            <li>양중이 불가능한 상황이 있을 수 있습니다. (예: 시스템 창호, 도로 혼잡 지역의 거실창 등)</li>
                                        </ul>
                                    </div>
                                </div>
                                <div className="notice-item">
                                    <div className="notice-icon">📍</div>
                                    <div>
                                        <p><strong>정확한 견적을 위해 정확한 주소를 입력해주세요</strong></p>
                                        <ul className="sub-notice-list">
                                            <li>정확한 주소를 입력해주셔야 양중비용 등 정확한 견적이 산출됩니다.</li>
                                            <li>아파트의 경우 동/호수까지 입력해주시면 더욱 정확합니다.</li>
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
                    <span>← 뒤로가기</span>
                </button>
                <button className="button-primary" onClick={handleAgree}>
                    <span>견적 내기 →</span>
                </button>
            </footer>
        </div>
    );
};

export default Agreement;
