import chassisTypeOptions from "../definition/chassisType";
import {HYUNDAI, HYUNDAI_ko, KCC_GLASS, KCC_GLASS_ko, LX, LX_ko} from "../definition/companyType";
import {
    deliveryFee,
    demolitionFee,
    freightTransportFee, laborFee, ladderCarFee,
    maintenanceFee
} from "../definition/Admin/additionalChassisPriceInfo";

export const mappedValueByCompany = (value: string) => {
    if (value === HYUNDAI_ko) {
        return HYUNDAI;
    }

    if (value === LX_ko) {
        return LX;
    }

    if (value === KCC_GLASS_ko) {
        return KCC_GLASS;
    }
}

export const mappedCompanyByValue = (value: string) => {
    if (value === HYUNDAI) {
        return HYUNDAI_ko;
    }

    if (value === LX) {
        return LX_ko;
    }

    if (value === KCC_GLASS) {
        return KCC_GLASS_ko;
    }
}

export const getYetCalculatedCompanyList = (firstCalculatedCompany: string) => {
    if (firstCalculatedCompany === HYUNDAI) {
        return [LX_ko, KCC_GLASS_ko];
    }

    if (firstCalculatedCompany === LX) {
        return [HYUNDAI_ko, KCC_GLASS_ko];
    }

    if (firstCalculatedCompany === KCC_GLASS) {
        return [HYUNDAI_ko, LX_ko];
    }
}

export const convertCompanyTypeKoToNormal = (targetCompanyType : string | undefined) => {
    if (targetCompanyType === HYUNDAI_ko) {
        return HYUNDAI;
    }

    if (targetCompanyType === LX_ko) {
        return LX;
    }

    if (targetCompanyType === KCC_GLASS_ko) {
        return KCC_GLASS;
    }
}

export const addCommasToNumber = (number: any): string | undefined => {
    if (number === null) {
        return;
    }

    return number?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};


export const getLabelOfChassisType = (target:string) => {
    return chassisTypeOptions.find(
        (a) => a.value === target
    )?.label;
}

export const convertAdditionalChassisPriceInfoToKo = (target:string) => {
    if (target === 'laborFee') {
        return laborFee;}
    if (target === 'ladderCarFee') {
        return ladderCarFee;}
    if (target === 'demolitionFee') {
        return demolitionFee;}
    if (target === 'maintenanceFee') {
        return maintenanceFee;}
    if (target === 'freightTransportFee') {
        return freightTransportFee;}
    if (target === 'deliveryFee') {
        return deliveryFee;}
    else {
        return "unknown";
    }
}

export const formatDateTime = (date: Date) => {
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

export const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return '방금 전';
    if (diffInHours < 24) return `${diffInHours}시간 전`;
    if (diffInHours < 48) return '1일 전';
    return `${Math.floor(diffInHours / 24)}일 전`;
};

export const truncateContent = (content: string, maxLength: number = 50) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
};

const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// 검색엔진 감지
const isFromSearchEngine = (): boolean => {
    let referrer = document.referrer;
    return (
        referrer.includes("google.") ||
        referrer.includes("naver.") ||
        referrer.includes("daum.") ||
        referrer.includes("bing.") ||
        referrer.includes("search.yahoo.") ||
        referrer.includes("instagram.com") ||
        referrer.includes("facebook.com") ||
        referrer.includes("youtube.com")
    );
};

// 모바일 클라이언트 판단 로직
const checkIsMobileClient = (): boolean => {
    // 카카오 인앱 브라우저는 무조건 모바일 클라이언트로 간주
    if (isKakaoInApp()) {
        console.log('카카오 인앱 브라우저에서 접속');
        return false;
    }

    if (!isMobile() || isFromSearchEngine()) {
        return false;
    }

    return true;
};

// 카카오 인앱 브라우저 감지
export const isKakaoInApp = (): boolean => {
    const userAgent = navigator.userAgent;
    return userAgent.includes('KAKAOTALK') || userAgent.includes('KAKAOSTORY');
};

// 기타 인앱 브라우저들 감지
export const isInAppBrowser = (): boolean => {
    const userAgent = navigator.userAgent;
    return (
        userAgent.includes('KAKAOTALK') ||
        userAgent.includes('KAKAOSTORY') ||
        userAgent.includes('NAVER') ||
        userAgent.includes('Instagram') ||
        userAgent.includes('FBAN') || // Facebook
        userAgent.includes('FBAV') || // Facebook
        userAgent.includes('Line') ||
        userAgent.includes('wv') // WebView 일반적 표시
    );
};

// 전역 변수로 한 번만 계산
let _isMobileClientValue: boolean | null = null;

// 최초 한 번만 실행되는 함수
export const initializeMobileClientDetection = (): boolean => {
    if (_isMobileClientValue === null) {
        _isMobileClientValue = checkIsMobileClient();
        console.log('Mobile client detection initialized:', _isMobileClientValue);
    }
    return _isMobileClientValue;
};

// 어디서든 호출 가능한 getter 함수
export const getIsMobileClient = (): boolean => {
    if (_isMobileClientValue === null) {
        // 만약 초기화가 안되어 있다면 자동으로 초기화
        return initializeMobileClientDetection();
    }
    return _isMobileClientValue;
};
