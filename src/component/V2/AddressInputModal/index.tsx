import React, { useState, useEffect } from 'react';
import './styles.css';

interface AddressInputModalProps {
    onClose: () => void;
    onAddressSelect: (addressData: any) => void;
    currentAddress?: string;
}

declare global {
    interface Window {
        kakao?: any;
        daum?: any;
    }
}

const POSTCODE_SCRIPT_SRC =
    'https://t1.kakaocdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';

const AddressInputModal: React.FC<AddressInputModalProps> = ({
                                                                 onClose,
                                                                 onAddressSelect,
                                                                 currentAddress,
                                                             }) => {
    const [isSearching, setIsSearching] = useState(false);
    const [scriptLoaded, setScriptLoaded] = useState(false);

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
            setIsSearching(false);
        };

        document.head.appendChild(script);
    }, []);

    useEffect(() => {
        if (!isSearching || !scriptLoaded) return;

        const container = document.getElementById('daum-postcode-container');
        if (!container) return;

        container.innerHTML = '';

        const PostcodeCtor = window.kakao?.Postcode || window.daum?.Postcode;

        if (!PostcodeCtor) {
            alert('주소 검색 서비스를 불러오지 못했습니다.');
            setIsSearching(false);
            return;
        }

        const postcode = new PostcodeCtor({
            oncomplete: function (data: any) {
                const addressData = {
                    address: data.address,
                    zonecode: data.zonecode,
                    buildingCode: data.buildingCode || '',
                    sido: data.sido,
                    sigungu: data.sigungu,
                    bname: data.bname,
                    bcode: data.bcode,
                    apartment: data.apartment || 'N',
                };

                onAddressSelect(addressData);
                setIsSearching(false);
                onClose();
            },
            onclose: function () {
                setIsSearching(false);
            },
            width: '100%',
            height: '100%',
        });

        postcode.embed(container);
    }, [isSearching, scriptLoaded, onAddressSelect, onClose]);

    const handleDaumPostcode = () => {
        setIsSearching(true);
    };

    return (
        <div className="address-modal-overlay" onClick={onClose}>
            <div className="address-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="address-modal-header">
                    <h3 className="address-modal-title">주소 검색</h3>
                    <button className="address-modal-close" onClick={onClose}>
                        ✕
                    </button>
                </div>

                <div className="address-modal-body">
                    {!isSearching ? (
                        <div className="address-search-intro">
                            <div className="address-search-icon">📍</div>
                            <h4>정확한 견적을 위해 정확한 주소를 입력해주세요</h4>
                            <p>시공 예정 장소의 주소를 검색하여 선택해주세요.</p>

                            {currentAddress && (
                                <div className="current-address">
                                    <span className="current-address-label">현재 선택된 주소:</span>
                                    <span className="current-address-text">{currentAddress}</span>
                                </div>
                            )}

                            <button
                                className="address-search-button"
                                onClick={handleDaumPostcode}
                            >
                                <span className="search-icon">🔍</span>
                                주소 검색하기
                            </button>
                        </div>
                    ) : (
                        <div className="daum-postcode-wrapper">
                            <div
                                id="daum-postcode-container"
                                style={{ width: '100%', height: '400px' }}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddressInputModal;
