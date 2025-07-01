import React, {useCallback, useEffect, useRef, useState} from 'react';
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import {Spin} from "antd";
import {addCommasToNumber} from "../../../../util";
import moment from "moment/moment";
import useSWR from "swr";
import {callEstimationHistories, callMeData} from "../../../../definition/apiPath";
import fetcher from "../../../../util/fetcher";
import axios from "axios";
import {LeftOutlined, CalendarOutlined, EyeOutlined} from "@ant-design/icons";
import {GoToTopButton} from "../../../../util/renderUtil";

import './styles.css';
import '../../versatile-styles.css';

dayjs.extend(customParseFormat);

interface Estimation {
    estimationId: number;
    companyType: string;
    fullAddress: string;
    wholePrice: number;
    estimatedAt: string;
}

const EstimationHistory = () => {
    const { data: userData, error, mutate } = useSWR(callMeData, fetcher, {
        dedupingInterval: 2000
    });

    const [data, setData] = useState<Estimation[]>([]);
    const [lastEstimationId, setLastEstimationId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLastPage, setIsLastPage] = useState(false);
    const observer = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        loadEstimationData(lastEstimationId);
    }, []);

    const loadEstimationData = async (lastId: number | null) => {
        if (isLoading || isLastPage) return;

        setIsLoading(true);

        try {
            const lastEstimationIdParam = lastId ? `lastEstimationId=${lastId}` : "";
            const res = await axios.get(`${callEstimationHistories}?size=10&${lastEstimationIdParam}`, {
                withCredentials: true,
                headers: {
                    Authorization: localStorage.getItem("hoppang-token"),
                }
            });

            if (res.data && res.data.estimationList.length > 0) {
                setData((prevData) => [...prevData, ...mapEstimationHistories(res.data)]);
                setLastEstimationId(res.data.lastEstimationId);
            }

            setIsLastPage(res.data.isLastPage);
        } catch (err) {
            console.error("Error fetching estimation histories:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const mapEstimationHistories = (response: any): Estimation[] => {
        return response.estimationList.map((estimation: any) => ({
            estimationId: estimation.estimationId,
            companyType: estimation.companyType,
            fullAddress: estimation.fullAddress,
            wholePrice: estimation.wholePrice,
            estimatedAt: estimation.estimatedAt
        }));
    };

    const clickBackButton = () => {
        window.location.href = "/v2/mypage";
    };

    const lastElementRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (isLoading || isLastPage) return;
            if (observer.current) observer.current.disconnect();

            observer.current = new IntersectionObserver(
                (entries) => {
                    if (entries[0].isIntersecting) {
                        loadEstimationData(lastEstimationId);
                    }
                },
                { threshold: 1 }
            );

            if (node) observer.current.observe(node);
        },
        [isLoading, isLastPage, lastEstimationId]
    );

    const clickEstimation = (estimationId: any) => {
        if (!estimationId) {
            return;
        }
        return window.location.href = "/v2/mypage/estimation/" + estimationId;
    }

    const formatPrice = (price: number) => {
        return `${addCommasToNumber(price)}원`;
    };

    return (
        <div className="estimation-history-container">
            {/* Header */}
            <header className="estimation-header">
                <div className="header-content">
                    <button className="back-btn" onClick={clickBackButton}>
                        <LeftOutlined />
                    </button>
                    <div className="header-title">
                        <h1>견적 이력</h1>
                        <p>내가 받은 견적을 확인하세요</p>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="estimation-main">
                {data.length > 0 ? (
                    <>
                        <div className="estimation-summary">
                            <div className="summary-card">
                                <div className="summary-icon">📋</div>
                                <div className="summary-text">
                                    <span className="summary-count">{data.length}개</span>
                                    <span className="summary-label">견적서</span>
                                </div>
                            </div>
                        </div>

                        <div className="estimation-list">
                            {data.map((item, index) => (
                                <div
                                    key={item.estimationId}
                                    ref={index === data.length - 1 ? lastElementRef : null}
                                    className="estimation-card"
                                    onClick={() => clickEstimation(item.estimationId)}
                                >
                                    <div className="card-header">
                                        <div className="estimation-id">
                                            <span className="id-label">견적서</span>
                                            <span className="id-number">#{item.estimationId}</span>
                                        </div>
                                        <div className="estimation-date">
                                            <CalendarOutlined />
                                            <span>{moment(item.estimatedAt).format('YYYY.MM.DD')}</span>
                                        </div>
                                    </div>

                                    <div className="card-body">
                                        <div className="info-row">
                                            <div className="info-item">
                                                <div className="info-text">
                                                    <span className="info-label">회사 유형</span>
                                                    <span className="info-value">{item.companyType}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="info-row">
                                            <div className="info-item">
                                                <div className="info-text">
                                                    <span className="info-label">주소</span>
                                                    <span className="info-value address-text">{item.fullAddress}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="price-section">
                                            <div className="price-container">
                                                <div className="price-icon">💰</div>
                                                <div className="price-text">
                                                    <span className="price-label">총 견적가</span>
                                                    <span className="price-value">{formatPrice(item.wholePrice)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-footer">
                                        <button
                                            className="detail-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                clickEstimation(item.estimationId);
                                            }}
                                        >
                                            <EyeOutlined />
                                            <span>자세히 보기</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="empty-state">
                        <div className="empty-illustration">
                            <div className="empty-icon">📝</div>
                        </div>
                        <div className="empty-content">
                            <h3>견적 내역이 없습니다</h3>
                            <p>새로운 견적을 요청해보세요!</p>
                            <button
                                className="create-estimation-btn"
                                onClick={() => window.location.href = "/chassis/calculator"}
                            >
                                견적 요청하기
                            </button>
                        </div>
                    </div>
                )}

                {isLoading && (
                    <div className="loading-container">
                        <Spin size="large" />
                        <p>견적 내역을 불러오는 중...</p>
                    </div>
                )}
            </main>

            <GoToTopButton/>
        </div>
    );
};

export default EstimationHistory;
