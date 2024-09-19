import chassisTypeOptions from "../definition/chassisType";

export const mappedValueByCompany = (value: string) => {
    if (value === '현대 L&C') {
        return 'HYUNDAI';
    }

    if (value === 'LX 하우시스') {
        return 'LX';
    }

    if (value === 'KCC 글라스') {
        return 'KCC_GLASS';
    }
}

export const mappedCompanyByValue = (value: string) => {
    if (value === 'HYUNDAI') {
        return '현대 L&C';
    }

    if (value === 'LX') {
        return 'LX 하우시스';
    }

    if (value === 'KCC_GLASS') {
        return 'KCC 글라스';
    }
}

export const getYetCalculatedCompanyList = (firstCalculatedCompany: string) => {
    if (firstCalculatedCompany === 'HYUNDAI') {
        return ['LX 하우시스', 'KCC 글라스'];
    }

    if (firstCalculatedCompany === 'LX') {
        return ['현대 L&C', 'KCC 글라스'];
    }

    if (firstCalculatedCompany === 'KCC_GLASS') {
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
