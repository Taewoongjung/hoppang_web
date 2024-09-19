import chassisTypeOptions from "../definition/chassisType";
import {HYUNDAI, HYUNDAI_ko, KCC_GLASS, KCC_GLASS_ko, LX, LX_ko} from "../definition/companyType";

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


export const addCommasToNumber = (number: any): string | undefined => {
    return number?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const getLabelOfChassisType = (target:string) => {
    return chassisTypeOptions.find(
        (a) => a.value === target
    )?.label;
}
