import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import './styles.css';

declare global {
    interface Window {
        kakao?: any;
        daum?: any;
    }
}

const POSTCODE_SCRIPT_SRC =
    'https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';

const AddressSearch = () => {
    const history = useHistory();
    const location = useLocation();
    const [scriptLoaded, setScriptLoaded] = useState(false);

    const queryParams = new URLSearchParams(location.search);
    const redirectPath = queryParams.get('redirect') || '/calculator/simple/step0';

    useEffect(() => {
        let script = document.querySelector(
            `script[src="${POSTCODE_SCRIPT_SRC}"]`
        ) as HTMLScriptElement | null;

        if (script) {
            if (window.kakao?.Postcode || window.daum?.Postcode) {
                setScriptLoaded(true);
            } else {
                script.addEventListener('load', () => setScriptLoaded(true), { once: true });
            }
            return;
        }

        script = document.createElement('script');
        script.src = POSTCODE_SCRIPT_SRC;
        script.async = true;
        script.onload = () => setScriptLoaded(true);
        script.onerror = () => {
            alert('주소 검색 스크립트를 불러오지 못했습니다.');
            history.goBack();
        };

        document.head.appendChild(script);
    }, [history]);

    useEffect(() => {
        if (!scriptLoaded) return;

        const container = document.getElementById('postcode-container');
        if (!container) return;

        container.innerHTML = '';

        const PostcodeCtor = window.kakao?.Postcode || window.daum?.Postcode;

        if (!PostcodeCtor) {
            alert('주소 검색 서비스를 불러오지 못했습니다.');
            history.goBack();
            return;
        }

        const postcode = new PostcodeCtor({
            oncomplete: function (data: any) {
                let extraAddress = '';
                let fullAddress = data.address;

                if (data.addressType === 'R') {
                    if (data.bname !== '') {
                        extraAddress += data.bname;
                    }
                    if (data.buildingName !== '') {
                        extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
                    }
                    fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
                }

                const addressData = {
                    address: data.address,
                    zonecode: data.zonecode,
                    buildingCode: data.buildingCode || '',
                    sido: data.sido,
                    sigungu: data.sigungu,
                    bname: data.bname,
                    bcode: data.bcode,
                    apartment: data.apartment || 'N',
                    buildingName: data.buildingName || '',
                    addressType: data.addressType,
                    extraAddress: extraAddress,
                    fullAddress: fullAddress,
                };

                // 결과를 sessionStorage에 저장
                sessionStorage.setItem('selected-address', JSON.stringify(addressData));

                // 원래 페이지로 이동
                history.replace(redirectPath);
            },
            onclose: function () {
                history.goBack();
            },
            width: '100%',
            height: '100%',
        });

        postcode.embed(container);
    }, [scriptLoaded, history, redirectPath]);

    const handleBack = () => {
        history.goBack();
    };

    return (
        <>
            <Helmet>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            <div className="address-search-page">
                <header className="address-search-header">
                    <button className="back-button" onClick={handleBack}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <h1 className="header-title">주소 검색</h1>
                    <div style={{ width: '24px' }}></div>
                </header>

                <div className="postcode-container-wrapper">
                    {!scriptLoaded && (
                        <div className="loading-placeholder">
                            <div className="loading-spinner"></div>
                            <p>주소 검색을 불러오는 중...</p>
                        </div>
                    )}
                    <div id="postcode-container" style={{ width: '100%', height: '100%' }}></div>
                </div>
            </div>
        </>
    );
};

export default AddressSearch;
