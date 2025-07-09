import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import BottomNavigator from "../../../../component/V2/BottomNavigator";
import useSWR from "swr";
import {callBoards, callMeData} from "../../../../definition/apiPath";
import fetcher from "../../../../util/fetcher";

import './styles.css';
import '../../versatile-styles.css';
import axios from "axios";

interface Question {
    id: number;
    category: string;
    title: string;
    content: string;
    author: string;
    isAnonymous: boolean;
    createdAt: string;
    answersCount: number;
    viewCount: number;
    isAnswered: boolean;
    tags?: string[];
    imageCount?: number;
}

interface Category {
    id: string;
    name: string;
}

const QuestionsBoard = () => {
    const history = useHistory();
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'unanswered'>('latest');
    const [searchQuery, setSearchQuery] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);

    const { data: userData, error, mutate } = useSWR(callMeData, fetcher, {
        dedupingInterval: 2000
    });

    useEffect(() => {
        axios.get(callBoards + "?limit=")
            .then((res) => {
                const originalList: Category[] = res.data;
                const withAll = [{ id: "0", name: "전체" }, ...originalList];
                setCategories(withAll);
            })
            .catch((err) => {
                console.error("Failed to fetch categories:", err);
            });
    }, []);

    // 더미 데이터 - 실제로는 API에서 가져올 데이터
    const mockQuestions: Question[] = [
        {
            id: 1,
            category: '1',
            title: '아파트 거실 이중창 설치 비용이 얼마나 드나요?',
            content: '30평대 아파트 거실에 이중창을 설치하려고 하는데, 대략적인 비용이 궁금합니다. 현재 단창으로 되어있고...',
            author: '김민수',
            isAnonymous: false,
            createdAt: '2024-07-02T09:30:00Z',
            answersCount: 3,
            viewCount: 127,
            isAnswered: true,
            tags: ['이중창', '아파트', '거실'],
            imageCount: 2
        },
        {
            id: 2,
            category: '2',
            title: '창문에 결로 현상이 계속 생기는데 해결 방법이 있을까요?',
            content: '겨울마다 창문에 물방울이 맺혀서 고민입니다. 특히 아침에 일어나면 창틀이 젖어있어요...',
            author: '익명',
            isAnonymous: true,
            createdAt: '2024-07-01T14:22:00Z',
            answersCount: 5,
            viewCount: 89,
            isAnswered: true,
            tags: ['결로', '방수', '겨울'],
            imageCount: 1
        },
        {
            id: 3,
            category: '3',
            title: '샷시 교체 시 공사 기간은 보통 얼마나 걸리나요?',
            content: '전체 집 샷시를 교체하려고 하는데, 공사 기간이 얼마나 걸리는지 궁금합니다.',
            author: '박영희',
            isAnonymous: false,
            createdAt: '2024-07-01T11:15:00Z',
            answersCount: 0,
            viewCount: 45,
            isAnswered: false,
            tags: ['교체', '공사기간'],
            imageCount: 0
        },
        {
            id: 4,
            category: '4',
            title: '방음이 잘 되는 샷시 브랜드 추천해주세요',
            content: '길가에 집이 있어서 소음이 심합니다. 방음 효과가 좋은 샷시로 교체하고 싶어요.',
            author: '이철수',
            isAnonymous: false,
            createdAt: '2024-06-30T16:45:00Z',
            answersCount: 7,
            viewCount: 203,
            isAnswered: true,
            tags: ['방음', '브랜드', '추천'],
            imageCount: 0
        },
        {
            id: 5,
            category: '5',
            title: '샷시 견적서를 받았는데 적정한 가격인지 확인해주세요',
            content: '3개 업체에서 견적을 받았는데 가격 차이가 많이 나서 어떤 게 적정한지 모르겠어요...',
            author: '익명',
            isAnonymous: true,
            createdAt: '2024-06-30T10:20:00Z',
            answersCount: 2,
            viewCount: 156,
            isAnswered: false,
            tags: ['견적서', '가격비교'],
            imageCount: 3
        }
    ];

    const [questions, setQuestions] = useState<Question[]>(mockQuestions);

    const filteredQuestions = questions.filter(question => {
        const matchesCategory = selectedCategory === 'all' || question.category === selectedCategory;
        const matchesSearch = question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            question.content.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const sortedQuestions = [...filteredQuestions].sort((a, b) => {
        switch (sortBy) {
            case 'popular':
                return b.viewCount - a.viewCount;
            case 'unanswered':
                return a.isAnswered ? 1 : -1;
            case 'latest':
            default:
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
    });

    const formatTimeAgo = (dateString: string) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return '방금 전';
        if (diffInHours < 24) return `${diffInHours}시간 전`;
        if (diffInHours < 48) return '1일 전';
        return `${Math.floor(diffInHours / 24)}일 전`;
    };

    const getCategoryLabel = (categoryId: string) => {
        const category = categories.find(cat => cat.id === categoryId);
        return category ? category.name : '기타';
    };

    const handleQuestionClick = (questionId: number) => {
        // history.push(`/v2/questions/${questionId}`);
    };

    const handleWriteQuestion = () => {
        history.push('/question/boards/posts/register');
    };

    return (
        <div className="questions-container">
            {/* Header */}
            <header className="questions-header">
                <div className="header-content">
                    <button
                        className="back-btn"
                        onClick={() => history.goBack()}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <div className="header-title">샷시 지식인</div>
                    <div className="header-spacer"></div>
                </div>
            </header>

            {/* Main Content */}
            <main className="questions-main">
                {/* Stats Section */}
                <section className="stats-section">
                    <div className="stats-card">
                        <div className="stats-icon">🤔</div>
                        <div className="stats-content">
                            <h2 className="stats-title">함께 만드는 샷시 지식</h2>
                            <p className="stats-subtitle">전문가와 사용자들이 함께 답변하는 공간</p>
                            <div className="stats-numbers">
                                <div className="stat-item">
                                    <span className="stat-number">156</span>
                                    <span className="stat-label">질문</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">342</span>
                                    <span className="stat-label">답변</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">89%</span>
                                    <span className="stat-label">해결률</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Search & Filter Section */}
                <section className="filter-section">
                    {/* Search Bar */}
                    <div className="search-container">
                        <div className="search-input-wrapper">
                            <svg className="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M9 17A8 8 0 1 0 9 1a8 8 0 0 0 0 16zM19 19L14.65 14.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <input
                                type="text"
                                placeholder="궁금한 내용을 검색해보세요"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="search-input"
                            />
                            {searchQuery && (
                                <button
                                    className="search-clear"
                                    onClick={() => setSearchQuery('')}
                                >
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Category Tabs */}
                    <div className="category-tabs">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                className={`category-tab ${selectedCategory === category.id ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category.id)}
                            >
                                <span className="category-label">{category.name}</span>
                                {/*<span className="category-count">{category.count}</span>*/}
                            </button>
                        ))}
                    </div>

                    {/* Sort Options */}
                    <div className="sort-container">
                        <div className="sort-buttons">
                            <button
                                className={`sort-btn ${sortBy === 'latest' ? 'active' : ''}`}
                                onClick={() => setSortBy('latest')}
                            >
                                최신순
                            </button>
                            <button
                                className={`sort-btn ${sortBy === 'popular' ? 'active' : ''}`}
                                onClick={() => setSortBy('popular')}
                            >
                                인기순
                            </button>
                            <button
                                className={`sort-btn ${sortBy === 'unanswered' ? 'active' : ''}`}
                                onClick={() => setSortBy('unanswered')}
                            >
                                미해결
                            </button>
                        </div>
                    </div>
                </section>

                {/* Questions List */}
                <section className="questions-list-section">
                    <div className="questions-count">
                        총 <strong>{sortedQuestions.length}개</strong>의 질문
                    </div>

                    <div className="questions-list">
                        {sortedQuestions.map((question) => (
                            <div
                                key={question.id}
                                className="question-card"
                                onClick={() => handleQuestionClick(question.id)}
                            >
                                <div className="question-header">
                                    <div className="question-meta">
                                        <span className={`category-badge ${question.category}`}>
                                            {getCategoryLabel(question.category)}
                                        </span>
                                        <span className="question-time">
                                            {formatTimeAgo(question.createdAt)}
                                        </span>
                                    </div>
                                    <div className="question-status">
                                        {question.isAnswered ? (
                                            <span className="status-answered">해결됨</span>
                                        ) : (
                                            <span className="status-pending">답변대기</span>
                                        )}
                                    </div>
                                </div>

                                <h3 className="question-title">{question.title}</h3>

                                <p className="question-preview">{question.content}</p>

                                {question.tags && question.tags.length > 0 && (
                                    <div className="question-tags">
                                        {question.tags.map((tag, index) => (
                                            <span key={index} className="tag">#{tag}</span>
                                        ))}
                                    </div>
                                )}

                                <div className="question-footer">
                                    <div className="question-author">
                                        <span className="author-icon">👤</span>
                                        <span className="author-name">
                                            {question.isAnonymous ? '익명' : question.author}
                                        </span>
                                        {question.imageCount && question.imageCount > 0 && (
                                            <span className="image-indicator">
                                                📷 {question.imageCount}
                                            </span>
                                        )}
                                    </div>

                                    <div className="question-stats">
                                        <span className="stat">
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                <path d="M1 8A7 7 0 1 1 15 8A7 7 0 0 1 1 8Z" stroke="currentColor" strokeWidth="1.5"/>
                                                <path d="M8 4V8L11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                            </svg>
                                            {question.viewCount}
                                        </span>
                                        <span className="stat">
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                <path d="M14 1L7 8L4.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                <path d="M16 8V14A2 2 0 0 1 14 16H2A2 2 0 0 1 0 14V2A2 2 0 0 1 2 0H10" stroke="currentColor" strokeWidth="1.5"/>
                                            </svg>
                                            {question.answersCount}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {sortedQuestions.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-icon">🔍</div>
                            <h3 className="empty-title">검색 결과가 없습니다</h3>
                            <p className="empty-description">
                                다른 키워드로 검색하거나<br />
                                새로운 질문을 등록해보세요
                            </p>
                            <button className="empty-action-btn" onClick={handleWriteQuestion}>
                                질문하기
                            </button>
                        </div>
                    )}
                </section>
            </main>

            {/* Floating Write Button */}
            <button className="floating-write-btn" onClick={handleWriteQuestion}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 4V20M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
            </button>

            {/* Bottom Navigation */}
            <BottomNavigator
                userData={userData}
                isVisible={true}
            />
        </div>
    );
};

export default QuestionsBoard;
