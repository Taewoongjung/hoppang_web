import chassisTypeOptions from "../definition/chassisType";
import {HYUNDAI, HYUNDAI_ko, KCC_GLASS, KCC_GLASS_ko, LX, LX_ko} from "../definition/companyType";
import {
    deliveryFee,
    demolitionFee,
    freightTransportFee, laborFee, ladderCarFee,
    maintenanceFee
} from "../definition/Admin/additionalChassisPriceInfo";
import {isMobile} from "react-device-detect";

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

export const isMobileClient = () => {
    let referrer = document.referrer;
    let isFromSearchEngine =
        referrer.includes("google.") ||
        referrer.includes("naver.") ||
        referrer.includes("daum.") ||
        referrer.includes("bing.") ||
        referrer.includes("search.yahoo.") ||
        referrer.includes("instagram.com") ||
        referrer.includes("facebook.com") ||
        referrer.includes("youtube.com");

    if (!isMobile || isFromSearchEngine) {
        return false;
    }

    return true;
}
