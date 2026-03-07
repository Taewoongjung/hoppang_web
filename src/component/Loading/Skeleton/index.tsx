import React from 'react';
import { Skeleton } from 'antd';
import './styles.css';

type SkeletonVariant = 'mypage' | 'result' | 'list' | 'card' | 'text';

interface SkeletonLoaderProps {
    variant?: SkeletonVariant;
    loading?: boolean;
    children?: React.ReactNode;
    repeat?: number;
}

/**
 * SkeletonLoader - Loading placeholder component using antd Skeleton
 *
 * @param variant - Type of skeleton to display ('mypage', 'result', 'list', 'card', 'text')
 * @param loading - Whether to show skeleton or children
 * @param children - Content to display when not loading
 * @param repeat - Number of times to repeat list items (default: 3)
 */
const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
    variant = 'text',
    loading = true,
    children,
    repeat = 3
}) => {
    if (!loading) {
        return <>{children}</>;
    }

    const renderSkeleton = () => {
        switch (variant) {
            case 'mypage':
                return <MyPageSkeleton />;
            case 'result':
                return <ResultSkeleton />;
            case 'list':
                return <ListSkeleton count={repeat} />;
            case 'card':
                return <CardSkeleton />;
            case 'text':
            default:
                return <TextSkeleton />;
        }
    };

    return (
        <div className="skeleton-wrapper" data-variant={variant}>
            {renderSkeleton()}
        </div>
    );
};

/* ==================== MyPage Skeleton ==================== */
const MyPageSkeleton: React.FC = () => (
    <div className="skeleton-mypage">
        {/* Header Skeleton */}
        <div className="skeleton-mypage-header">
            <Skeleton.Avatar active size={32} shape="circle" />
            <Skeleton.Input active size="small" style={{ width: 80 }} />
        </div>

        {/* Main Content Skeleton */}
        <div className="skeleton-mypage-main">
            {/* User Section Skeleton */}
            <div className="skeleton-user-section">
                <Skeleton active paragraph={{ rows: 1 }} />
            </div>

            {/* Quick Services Grid Skeleton */}
            <div className="skeleton-section">
                <Skeleton.Input active size="small" style={{ width: 120, marginBottom: 16 }} />
                <div className="skeleton-services-grid">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="skeleton-service-item">
                            <Skeleton.Button active size="small" style={{ width: '100%', height: 80 }} />
                        </div>
                    ))}
                </div>
            </div>

            {/* Menu Items Skeleton */}
            <div className="skeleton-section">
                <Skeleton.Input active size="small" style={{ width: 100, marginBottom: 16 }} />
                <div className="skeleton-menu-list">
                    {[1, 2].map((i) => (
                        <div key={i} className="skeleton-menu-item">
                            <Skeleton.Avatar active size={48} shape="square" />
                            <div className="skeleton-menu-text">
                                <Skeleton.Input active size="small" style={{ width: 100 }} />
                                <Skeleton.Input active size="small" style={{ width: 150 }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

/* ==================== Result Skeleton ==================== */
const ResultSkeleton: React.FC = () => (
    <div className="skeleton-result">
        {/* Company Header Skeleton */}
        <div className="skeleton-result-card">
            <div className="skeleton-company-header">
                <Skeleton.Input active size="small" style={{ width: 150 }} />
            </div>

            {/* Price Summary Skeleton */}
            <div className="skeleton-price-summary">
                <Skeleton.Input active size="small" style={{ width: 80 }} />
                <Skeleton.Input active style={{ width: 200, height: 40 }} />
            </div>

            {/* Materials List Skeleton */}
            <div className="skeleton-materials-section">
                <Skeleton.Input active size="small" style={{ width: 80, marginBottom: 12 }} />
                {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton-material-item">
                        <div className="skeleton-material-info">
                            <Skeleton.Input active size="small" style={{ width: 100 }} />
                            <Skeleton.Input active size="small" style={{ width: 80 }} />
                        </div>
                        <Skeleton.Input active size="small" style={{ width: 60 }} />
                    </div>
                ))}
            </div>

            {/* Cost List Skeleton */}
            <div className="skeleton-cost-section">
                <Skeleton.Input active size="small" style={{ width: 80, marginBottom: 12 }} />
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="skeleton-cost-item">
                        <Skeleton.Input active size="small" style={{ width: 100 }} />
                        <Skeleton.Input active size="small" style={{ width: 80 }} />
                    </div>
                ))}
            </div>

            {/* Action Button Skeleton */}
            <div className="skeleton-action">
                <Skeleton.Button active style={{ width: '100%', height: 48 }} />
            </div>
        </div>
    </div>
);

/* ==================== List Skeleton ==================== */
interface ListSkeletonProps {
    count?: number;
}

const ListSkeleton: React.FC<ListSkeletonProps> = ({ count = 3 }) => (
    <div className="skeleton-list">
        {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="skeleton-list-item">
                <Skeleton avatar paragraph={{ rows: 1 }} active />
            </div>
        ))}
    </div>
);

/* ==================== Card Skeleton ==================== */
const CardSkeleton: React.FC = () => (
    <div className="skeleton-card">
        <Skeleton active paragraph={{ rows: 3 }} />
    </div>
);

/* ==================== Text Skeleton ==================== */
const TextSkeleton: React.FC = () => (
    <div className="skeleton-text">
        <Skeleton active paragraph={{ rows: 2 }} />
    </div>
);

export default SkeletonLoader;

// Export individual skeletons for direct use
export {
    MyPageSkeleton,
    ResultSkeleton,
    ListSkeleton,
    CardSkeleton,
    TextSkeleton
};
