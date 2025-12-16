// TTL 기본값: 10분 (밀리초)
const DEFAULT_TTL_MS = 10 * 60 * 1000;

interface StorageItemWithTTL<T> {
    value: T;
    expiry: number;
}

// TTL과 함께 localStorage에 저장
export const setItemWithTTL = <T>(key: string, value: T, ttlMs: number = DEFAULT_TTL_MS): void => {
    const item: StorageItemWithTTL<T> = {
        value,
        expiry: Date.now() + ttlMs,
    };
    localStorage.setItem(key, JSON.stringify(item));
};

// TTL 확인 후 localStorage에서 가져오기 (만료시 null 반환 및 삭제)
export const getItemWithTTL = <T>(key: string): T | null => {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) {
        return null;
    }

    try {
        const item: StorageItemWithTTL<T> = JSON.parse(itemStr);

        // expiry 필드가 없으면 기존 데이터로 간주하고 그대로 반환 (호환성)
        if (item.expiry === undefined) {
            return item as unknown as T;
        }

        // 만료 확인
        if (Date.now() > item.expiry) {
            localStorage.removeItem(key);
            return null;
        }

        return item.value;
    } catch (e) {
        // JSON 파싱 실패시 기존 형식으로 간주
        console.error('localStorage 파싱 실패:', e);
        return null;
    }
};

export const invalidateMandatoryData = () => {
    localStorage.removeItem('simple-estimate-address');
    localStorage.removeItem('simple-estimate-area');
    localStorage.removeItem('simple-estimate-bay');
    localStorage.removeItem('simple-estimate-expansion');
    localStorage.removeItem('simple-estimate-resident');
    localStorage.removeItem('simple-estimate-data');
}
