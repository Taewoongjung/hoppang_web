import React, {useState, useEffect} from 'react';

import './styles.css';


interface AddressInputModalProps {
    onClose: () => void;
    onAddressSelect: (addressData: any) => void;
    currentAddress?: string;
}

const AddressInputModal: React.FC<AddressInputModalProps> = ({
    onClose,
    onAddressSelect,
    currentAddress
}) => {

    const [isSearching, setIsSearching] = useState(false);

    // Daum 우편번호 스크립트 로드
    useEffect(() => {
        const existingScript = document.querySelector('script[src*="postcode.v2.js"]');
        if (!existingScript) {
            const script = document.createElement('script');
            script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
            script.async = true;
            document.head.appendChild(script);
        }
    }, []);

    // isSearching이 true가 되고 DOM이 업데이트된 후 embed 실행
    useEffect(() => {
        if (!isSearching) return;

        const runEmbed = () => {
            if (!(window as any).daum?.Postcode) {
                return false;
            }

            const container = document.getElementById('daum-postcode-container');
            if (!container) {
                return false;
            }

            // 기존 내용 초기화
            container.innerHTML = '';

            new (window as any).daum.Postcode({
                oncomplete: function (data: any) {
                    const addressData = {
                        address: data.address,
                        zonecode: data.zonecode,
                        buildingCode: data.buildingCode || '',
                        sido: data.sido,
                        sigungu: data.sigungu,
                        bname: data.bname,
                        bcode: data.bcode,
                        apartment: data.apartment || 'N'
                    };

                    onAddressSelect(addressData);
                    setIsSearching(false);
                    onClose();
                },
                onclose: function() {
                    setIsSearching(false);
                },
                width: '100%',
                height: '100%'
            }).embed(container);

            return true;
        };

        // 즉시 시도
        if (runEmbed()) return;

        // 실패하면 50ms 간격으로 재시도 (최대 2초)
        let attempts = 0;
        const maxAttempts = 40;
        const timer = setInterval(() => {
            attempts++;
            if (runEmbed() || attempts >= maxAttempts) {
                clearInterval(timer);
                if (attempts >= maxAttempts) {
                    setIsSearching(false);
                    alert('주소 검색 서비스를 불러오는데 실패했습니다.');
                }
            }
        }, 50);

        return () => clearInterval(timer);
    }, [isSearching, onAddressSelect, onClose]);

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
                            <div id="daum-postcode-container" style={{ width: '100%', height: '400px' }}></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddressInputModal;
