import React, { useState, useEffect, useRef } from 'react';

import './styles.css';

interface ImageViewerProps {
    isOpen: boolean;
    imageSrc: string;
    onClose: () => void;
    alt?: string;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
                                                     isOpen,
                                                     imageSrc,
                                                     onClose,
                                                     alt = "이미지"
                                                 }) => {

    const [imageScale, setImageScale] = useState(1);
    const [imagePosition, setImagePosition] = useState({x: 0, y: 0});
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({x: 0, y: 0});
    const [showHint, setShowHint] = useState(false);

    // 핀치 줌을 위한 state
    const [lastTouchDistance, setLastTouchDistance] = useState(0);
    const [isPinching, setIsPinching] = useState(false);

    // 스크롤 위치 저장
    const scrollPositionRef = useRef(0);

    const imageRef = useRef<HTMLImageElement>(null);

    // 뷰어가 열릴 때마다 초기화 및 힌트 표시
    useEffect(() => {
        if (isOpen) {
            setImageScale(1);
            setImagePosition({x: 0, y: 0});
            setIsDragging(false);
            setShowHint(true);

            // 현재 스크롤 위치 저장
            scrollPositionRef.current = window.pageYOffset || document.documentElement.scrollTop;

            // body 스크롤 완전히 막기
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollPositionRef.current}px`;
            document.body.style.width = '100%';

            // 2초 후 힌트 자동 숨김
            const timer = setTimeout(() => {
                setShowHint(false);
            }, 2000);

            return () => {
                clearTimeout(timer);
                // body 스크롤 복원
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                window.scrollTo(0, scrollPositionRef.current);
            };
        }
    }, [isOpen]);

    // ESC 키로 닫기
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    // 두 터치 포인트 사이의 거리 계산
    const getTouchDistance = (touch1: React.Touch, touch2: React.Touch) => {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    };

    // 두 터치 포인트의 중심점 계산
    const getTouchCenter = (touch1: React.Touch, touch2: React.Touch) => {
        return {
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2
        };
    };

    const handleZoom = (delta: number, clientX: number, clientY: number) => {
        const newScale = Math.min(Math.max(imageScale + delta, 0.5), 3);
        if (newScale !== imageScale) {
            const viewer = document.querySelector('.image-viewer-content');
            if (viewer) {
                const rect = viewer.getBoundingClientRect();
                const mouseX = clientX - rect.left;
                const mouseY = clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const realMouseX = (mouseX - centerX - imagePosition.x) / imageScale;
                const realMouseY = (mouseY - centerY - imagePosition.y) / imageScale;
                const newMouseX = realMouseX * newScale;
                const newMouseY = realMouseY * newScale;

                setImagePosition({
                    x: mouseX - centerX - newMouseX,
                    y: mouseY - centerY - newMouseY
                });
            }
            setImageScale(newScale);
        }
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const delta = -e.deltaY * 0.001;
        handleZoom(delta, e.clientX, e.clientY);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button === 0) {
            e.preventDefault();
            setIsDragging(true);
            setDragStart({
                x: e.clientX - imagePosition.x,
                y: e.clientY - imagePosition.y
            });
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            e.preventDefault();
            setImagePosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        const handleGlobalMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                e.preventDefault();
                setImagePosition({
                    x: e.clientX - dragStart.x,
                    y: e.clientY - dragStart.y
                });
            }
        };

        const handleGlobalMouseUp = () => {
            setIsDragging(false);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleGlobalMouseMove);
            document.addEventListener('mouseup', handleGlobalMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleGlobalMouseMove);
            document.removeEventListener('mouseup', handleGlobalMouseUp);
        };
    }, [isDragging, dragStart]);

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 1) {
            // 단일 터치 - 드래그
            setIsDragging(true);
            setDragStart({
                x: e.touches[0].clientX - imagePosition.x,
                y: e.touches[0].clientY - imagePosition.y
            });
        } else if (e.touches.length === 2) {
            // 두 손가락 터치 - 핀치 줌
            e.preventDefault();
            setIsPinching(true);
            setIsDragging(false);
            const distance = getTouchDistance(e.touches[0], e.touches[1]);
            setLastTouchDistance(distance);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (e.touches.length === 1 && isDragging && !isPinching) {
            // 단일 터치 드래그
            e.preventDefault();
            setImagePosition({
                x: e.touches[0].clientX - dragStart.x,
                y: e.touches[0].clientY - dragStart.y
            });
        } else if (e.touches.length === 2 && isPinching) {
            // 핀치 줌
            e.preventDefault();
            const currentDistance = getTouchDistance(e.touches[0], e.touches[1]);
            const center = getTouchCenter(e.touches[0], e.touches[1]);

            if (lastTouchDistance > 0) {
                const delta = (currentDistance - lastTouchDistance) * 0.01;
                handleZoom(delta, center.x, center.y);
            }

            setLastTouchDistance(currentDistance);
        }
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (e.touches.length < 2) {
            setIsPinching(false);
            setLastTouchDistance(0);
        }
        if (e.touches.length === 0) {
            setIsDragging(false);
        }
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        if (imageScale === 1) {
            handleZoom(1, e.clientX, e.clientY);
        } else {
            setImageScale(1);
            setImagePosition({x: 0, y: 0});
        }
    };

    const handleImageError = () => {
        console.error('이미지를 로드할 수 없습니다:', imageSrc);
    };

    if (!isOpen) return null;

    return (
        <div className="image-viewer-overlay" onClick={onClose}>
            <div className="image-viewer-header">
                <button
                    className="image-viewer-close"
                    onClick={onClose}
                    aria-label="닫기"
                >
                    ×
                </button>
            </div>

            {/* 펼치기 모션 힌트 */}
            {showHint && (
                <div className="zoom-hint-overlay">
                    <div className="zoom-hint-animation">
                        <div className="pinch-hands">
                            <span className="hand left">👈</span>
                            <span className="hand right">👉</span>
                        </div>
                        <p className="hint-message">확대/축소 및 이동 가능</p>
                    </div>
                </div>
            )}

            <div
                className="image-viewer-content"
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onDoubleClick={handleDoubleClick}
                onClick={(e) => e.stopPropagation()}
                style={{cursor: isDragging ? 'grabbing' : 'grab'}}
            >
                <img
                    ref={imageRef}
                    src={imageSrc}
                    alt={alt}
                    className="image-viewer-img"
                    style={{
                        transform: `scale(${imageScale}) translate(${imagePosition.x / imageScale}px, ${imagePosition.y / imageScale}px)`,
                        transition: isDragging || isPinching ? 'none' : 'transform 0.2s ease'
                    }}
                    draggable={false}
                    onError={handleImageError}
                />
            </div>
        </div>
    );
};

export default ImageViewer;