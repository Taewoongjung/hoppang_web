const mappedValueByCompany = (value: string) => {
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

export default mappedValueByCompany;

export const addCommasToNumber = (number: any): string | undefined => {
    return number?.toString()?.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
