import React from 'react';

const LandingPage = () => {

    return (
        <>
            <div style={{
                textAlign: 'center',
                fontFamily: 'Arial, sans-serif',
                backgroundColor: '#f9f9f9',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}>
                <div style={{
                    maxWidth: '600px',
                    background: 'white',
                    padding: '20px',
                    borderRadius: '10px',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)'
                }}>
                    <img src="/assets/hoppang-character.png" alt="호빵 서비스 아이콘" style={{ width: '100px', marginBottom: '10px' }} />
                    <h1 style={{ color: '#333' }}>🏠 호빵 - 가장 합리적인 창호 견적 서비스 </h1>
                    <p style={{ color: '#555', fontSize: '16px', lineHeight: '1.6', marginBottom: '7%' }}>
                        직접 측정하고, 전국 최저가 견적을 받아보세요.
                        <br/>
                        간편한 비교, 투명한 가격, 믿을 수 있는 시공까지 한 번에!
                    </p>
                    <a href="https://play.google.com/store/apps/details?id=store.hoppang.app&hl=ko"
                       style={{ display: 'inline-block', margin: '10px' }}>
                        <img src="/assets/LandingPage/play-store.png" alt="Android 다운로드" style={{ width: '150px' }} />
                    </a>
                    <a href="https://apps.apple.com/kr/app/%ED%98%B8%EB%B9%B5/id6737535725"
                       style={{ display: 'inline-block', margin: '10px' }}>
                        <img src="/assets/LandingPage/app-store.png" alt="iOS 다운로드" style={{ width: '150px' }} />
                    </a>

                    <div style={{ marginTop: '5px' }}></div>

                    <a href="http://pf.kakao.com/_dbxezn"
                       style={{
                           display: 'inline-flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                           padding: '12px 20px',
                           margin: '20px 10px 0',
                           textDecoration: 'none',
                           color: 'black',
                           backgroundColor: '#fae100',
                           borderRadius: '5px',
                           fontSize: '16px',
                           fontWeight: 'bold',
                           marginBottom: '10%'
                       }}>
                        <img src="/assets/Sso/kakao-logo.png" alt="Kakao" style={{ width: '24px', height: '24px', marginRight: '8px' }} />
                        카카오 플러스친구 추가
                    </a>

                    <div style={{ marginTop: '30px', fontSize: '14px', color: '#777' }}>
                        <p>© 2025 호빵 | 문의: ho9nobody@gmail.com</p>
                    </div>
                </div>
            </div>
            );
        </>
    )
}

export default LandingPage;
