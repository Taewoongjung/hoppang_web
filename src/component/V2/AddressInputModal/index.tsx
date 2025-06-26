import React, {useState} from 'react';

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


    const handleDaumPostcode = () => {
        setIsSearching(true);

        // Daum 우편번호 서비스 로드
        const script = document.createElement('script');
        script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
        script.onload = async () => {
            new (window as any).daum.Postcode({
                oncomplete: async function (data: any) {
                    // 주소 데이터 가공
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
            }).embed(document.getElementById('daum-postcode-container'));
        };
        document.head.appendChild(script);
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
                            <div className="address-search-icon">🏠</div>
                            <h4>정확한 견적을 위해 주소를 입력해주세요</h4>
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
