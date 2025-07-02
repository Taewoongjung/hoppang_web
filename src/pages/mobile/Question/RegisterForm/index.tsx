import React, { useState, useRef, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import useSWR from "swr";
import {callMeData} from "../../../../definition/apiPath";
import fetcher from "../../../../util/fetcher";

import './styles.css';
import '../../versatile-styles.css';
import QuestionRegisterFormExitModal from "../../../../component/V2/Modal/QuestionRegisterFormExitModal";


const QuestionRegisterForm = () => {
    const history = useHistory();

    useEffect(() => {
        // 뒤로가기 감지
        const unblock = history.block((location: any, action: string) => {
            if (action === 'POP') {
                setShowExitModal(true); // 상태만 바꾸고
                return false; // 페이지 이동을 막음
            }

            return true; // 나머지는 허용
        });

        return () => {
            unblock(); // cleanup
        };
    }, [history]);

    const [formData, setFormData] = useState({
        category: '',
        title: '',
        content: '',
        images: [] as File[],
        isAnonymous: false
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const fileInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [showExitModal, setShowExitModal] = useState(false);

    const { data: userData, error, mutate } = useSWR(callMeData, fetcher, {
        dedupingInterval: 2000
    });

    const categories = [
        { id: 'estimate', label: '견적 문의' },
        { id: 'installation', label: '설치/시공' },
        { id: 'maintenance', label: '관리/수리' },
        { id: 'product', label: '제품 정보' },
        { id: 'etc', label: '기타' }
    ];

    // 자동 높이 조절
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }
    }, [formData.content]);

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        if (formData.images.length + files.length > 3) {
            alert('이미지는 최대 3장까지 업로드 가능합니다.');
            return;
        }

        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...files]
        }));
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const validateForm = () => {
        const newErrors: {[key: string]: string} = {};

        if (!formData.category) newErrors.category = '카테고리를 선택해주세요';
        if (!formData.title.trim()) newErrors.title = '제목을 입력해주세요';
        if (formData.title.length > 100) newErrors.title = '제목은 100자 이내로 입력해주세요';
        if (!formData.content.trim()) newErrors.content = '내용을 입력해주세요';
        if (formData.content.length > 1000) newErrors.content = '내용은 1000자 이내로 입력해주세요';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            // API 호출 로직
            await new Promise(resolve => setTimeout(resolve, 1500)); // 임시 딜레이

            // 성공 시 질문 목록 페이지로 이동
            history.push('/v2/questions');
        } catch (error) {
            alert('질문 등록에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="question-form-container">
            {/* Header */}
            <header className="form-header">
                <div className="header-content">
                    <button
                        className="back-btn"
                        onClick={() => setShowExitModal(true)}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                    <div className="header-title">질문하기</div>
                    <div className="header-spacer"></div>
                </div>
            </header>

            {/* Main Content */}
            <main className="form-main">
                {/* Hero Section */}
                <section className="form-hero">
                    <div className="hero-icon">
                        <img src="/assets/RegisterForm/register-form-icon.png" alt="Icon"/>
                    </div>
                    <h1 className="hero-title">궁금한 것을 물어보세요</h1>
                    <p className="hero-subtitle">샷시 전문가들이 친절하게 답변해드려요</p>
                </section>

                {/* Form Section */}
                <section className="form-section">
                    <div className="form-card">
                        {/* Category Selection */}
                        <div className="form-group">
                            <label className="form-label required">
                                카테고리
                            </label>
                            <div className="category-grid">
                                {categories.map((category) => (
                                    <button
                                        key={category.id}
                                        type="button"
                                        className={`category-btn ${formData.category === category.id ? 'active' : ''}`}
                                        onClick={() => handleInputChange('category', category.id)}
                                    >
                                        {category.label}
                                    </button>
                                ))}
                            </div>
                            {errors.category && <span className="error-text">{errors.category}</span>}
                        </div>

                        {/* Title Input */}
                        <div className="form-group">
                            <label className="form-label required">
                                제목
                            </label>
                            <span className="char-count">{formData.title.length}/100</span>
                            <input
                                type="text"
                                className={`form-input ${errors.title ? 'error' : ''}`}
                                placeholder="궁금한 내용을 간단히 요약해주세요"
                                value={formData.title}
                                onChange={(e) => handleInputChange('title', e.target.value)}
                                maxLength={100}
                            />
                            {errors.title && <span className="error-text">{errors.title}</span>}
                        </div>

                        {/* Content Textarea */}
                        <div className="form-group">
                            <label className="form-label required">
                                내용
                            </label>
                            <span className="char-count">{formData.content.length}/1000</span>
                            <textarea
                                ref={textareaRef}
                                className={`form-textarea ${errors.content ? 'error' : ''}`}
                                placeholder="궁금한 내용을 자세히 설명해주세요.&#10;&#10;• 현재 상황을 구체적으로 설명해주세요&#10;• 어떤 도움이 필요한지 명확히 적어주세요&#10;• 관련 사진이 있다면 함께 첨부해주세요"
                                value={formData.content}
                                onChange={(e) => handleInputChange('content', e.target.value)}
                                maxLength={1000}
                                rows={6}
                            />
                            {errors.content && <span className="error-text">{errors.content}</span>}
                        </div>

                        {/* Image Upload */}
                        <div className="form-group">
                            <label className="form-label">
                                사진 첨부
                                <span className="optional-text">(선택사항, 최대 3장)</span>
                            </label>

                            <div className="image-upload-area">
                                <button
                                    type="button"
                                    className="image-upload-btn"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={formData.images.length >= 3}
                                >
                                    <span className="upload-icon">📸</span>
                                    <span className="upload-text">
                                        {formData.images.length > 0 ? '사진 추가' : '사진 선택'}
                                    </span>
                                </button>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    style={{ display: 'none' }}
                                />
                            </div>

                            {formData.images.length > 0 && (
                                <div className="image-preview-grid">
                                    {formData.images.map((file, index) => (
                                        <div key={index} className="image-preview">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`미리보기 ${index + 1}`}
                                                className="preview-img"
                                            />
                                            <button
                                                type="button"
                                                className="remove-image-btn"
                                                onClick={() => removeImage(index)}
                                            >
                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                    <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Anonymous Option */}
                        <div className="form-group">
                            <div className="options-container">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        checked={formData.isAnonymous}
                                        onChange={(e) => handleInputChange('isAnonymous', e.target.checked)}
                                    />
                                    <span className="checkbox-custom"></span>
                                    <span className="checkbox-text">
                                        <span className="checkbox-main">🎭 익명으로 질문</span>
                                        <span className="checkbox-desc">닉네임을 숨기고 질문</span>
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Submit Section */}
                <section className="submit-section">
                    <div className="submit-notice">
                        <div className="notice-icon">💡</div>
                        <div className="notice-text">
                            <div className="notice-title">답변 안내</div>
                            <div className="notice-desc">
                                전문가 검토 후 24시간 내에 답변드립니다<br />
                                긴급한 경우 카카오톡으로 문의해주세요
                            </div>
                        </div>
                    </div>

                    <button
                        className={`submit-btn ${isSubmitting ? 'loading' : ''}`}
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <span className="loading-spinner"></span>
                                질문 등록 중...
                            </>
                        ) : (
                            <>
                                <span className="submit-icon">🚀</span>
                                질문 등록하기
                            </>
                        )}
                    </button>
                </section>
            </main>

            {showExitModal && <QuestionRegisterFormExitModal setShowExitModal={setShowExitModal}/>}
        </div>
    );
};

export default QuestionRegisterForm;
