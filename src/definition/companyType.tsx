export const HYUNDAI = 'HYUNDAI';
export const LX = 'LX';
export const KCC_GLASS = 'KCC_GLASS';

export const HYUNDAI_ko = '현대 L&C';
export const LX_ko = 'LX 하우시스';
export const KCC_GLASS_ko = 'KCC 글라스';

const companyTypeOptions = [
    { value: HYUNDAI, label: HYUNDAI_ko },
    { value: LX, label: LX_ko, disabled: true },
    { value: KCC_GLASS, label: KCC_GLASS_ko, disabled: true },
]

export default companyTypeOptions;
