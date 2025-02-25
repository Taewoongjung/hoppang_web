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
