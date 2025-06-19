interface RegisteringChassis {
    index: number;
    chassisType: string;
    width: number;
    height: number;
}

export default RegisteringChassis;


export interface CalculateResult {
    reqCalculateChassisPriceList: any[],
    zipCode: any,
    sido: string,
    siGunGu: string,
    yupMyeonDong: string,
    bCode: string,
    isApartment: boolean,
    isExpanded: boolean,
    remainAddress: any,
    buildingNumber: any,
}
