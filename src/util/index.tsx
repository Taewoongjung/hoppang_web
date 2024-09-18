import chassisTypeOptions from "../definition/chassisType";

export const mappedValueByCompany = (value: string) => {
    if (value === '현대 L&C') {
        return 'HYUNDAI';
    }

    if (value === 'LX 하우시스') {
        return 'LX';
    }

    if (value === '홈 CC') {
        return 'HOME_CC';
    }
}

export const mappedCompanyByValue = (value: string) => {
    if (value === 'HYUNDAI') {
        return '현대 L&C';
    }

    if (value === 'LX') {
        return 'LX 하우시스';
    }

    if (value === 'HOME_CC') {
        return '홈 CC';
    }
}

export const getYetCalculatedCompanyList = (firstCalculatedCompany: string) => {
    if (firstCalculatedCompany === 'HYUNDAI') {
        return ['LX 하우시스', '홈 CC'];
    }

    if (firstCalculatedCompany === 'LX') {
        return ['현대 L&C', '홈 CC'];
    }

    if (firstCalculatedCompany === 'HOME_CC') {
        return ['현대 L&C', 'LX 하우시스'];
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
