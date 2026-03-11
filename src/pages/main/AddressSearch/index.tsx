import React, { useState, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import './styles.css';

interface AddressResult {
    roadAddress: string;
    jibunAddress: string;
    sido: string;
    sigungu: string;
    bname: string;
    roadName: string;
    buildingName: string;
    zonecode: string;
    x: string;
    y: string;
}

const NAVER_CLIENT_ID = process.env.REACT_APP_NAVER_MAP_CLIENT_ID || '';
const NAVER_CLIENT_SECRET = process.env.REACT_APP_NAVER_MAP_CLIENT_SECRET || '';

const AddressSearch = () => {
    const history = useHistory();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<AddressResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    const queryParams = new URLSearchParams(location.search);
    const redirectPath = queryParams.get('redirect') || '/calculator/simple/step0';

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setError('검색어를 입력해주세요');
            return;
        }

        if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
            setError('네이버 API 키가 설정되지 않았습니다.');
            return;
        }

        setIsSearching(true);
        setError('');
        setHasSearched(true);

        try {
            const response = await axios.get(
                `https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode`,
                {
                    params: {
                        query: searchQuery,
                        count: 20,
                    },
                    headers: {
                        'X-NCP-APIGW-API-KEY-ID': NAVER_CLIENT_ID,
                        'X-NCP-APIGW-API-KEY': NAVER_CLIENT_SECRET,
                    },
                }
            );

            if (response.data.addresses && response.data.addresses.length > 0) {
                setResults(response.data.addresses);
            } else {
                setResults([]);
                setError('검색 결과가 없습니다. 다른 검색어로 시도해주세요.');
            }
        } catch (err: any) {
            console.error('Address search error:', err);
            setError('주소 검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectAddress = (address: AddressResult) => {
        const addressData = {
            address: address.roadAddress || address.jibunAddress,
            zonecode: address.zonecode || '',
            sido: address.sido || '',
            sigungu: address.sigungu || '',
            bname: address.bname || '',
            bcode: '',
            buildingCode: '',
            apartment: 'N',
            buildingName: address.buildingName || '',
            addressType: 'R',
            extraAddress: address.buildingName || '',
            fullAddress: address.buildingName
                ? `${address.roadAddress} (${address.buildingName})`
                : address.roadAddress || address.jibunAddress,
        };

        sessionStorage.setItem('selected-address', JSON.stringify(addressData));
        history.replace(redirectPath);
    };

    const handleBack = () => {
        history.goBack();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
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

                <div className="address-search-content">
                    <div className="search-input-wrapper">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="도로명, 지번, 건물명 입력"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                            autoFocus
                        />
                        <button
                            className="search-button"
                            onClick={handleSearch}
                            disabled={isSearching}
                        >
                            {isSearching ? (
                                <div className="button-spinner"></div>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                            )}
                        </button>
                    </div>

                    {error && (
                        <div className="search-error">
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="search-results">
                        {results.length > 0 ? (
                            <>
                                <div className="results-count">
                                    총 {results.length}개의 검색 결과
                                </div>
                                {results.map((address, index) => (
                                    <div
                                        key={index}
                                        className="address-result-item"
                                        onClick={() => handleSelectAddress(address)}
                                    >
                                        <div className="address-result-icon">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                        <div className="address-result-content">
                                            <div className="address-road">
                                                {address.buildingName && (
                                                    <span className="building-name">{address.buildingName}</span>
                                                )}
                                                <span className="road-address">{address.roadAddress}</span>
                                            </div>
                                            <div className="address-jibun">
                                                지번: {address.jibunAddress}
                                            </div>
                                        </div>
                                        <div className="address-arrow">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : hasSearched && !error ? (
                            <div className="no-results">
                                <span>검색 결과가 없습니다</span>
                            </div>
                        ) : (
                            <div className="search-guide">
                                <div className="guide-icon">📍</div>
                                <h3>주소를 검색해주세요</h3>
                                <p>도로명, 지번, 건물명 등으로 검색할 수 있습니다</p>
                                <div className="guide-examples">
                                    <span>예: 강남대로 311</span>
                                    <span>예: 삼성동 157</span>
                                    <span>예: 역삼동 롯데캐슬</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default AddressSearch;
