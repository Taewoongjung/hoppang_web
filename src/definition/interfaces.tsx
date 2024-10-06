interface RegisteringChassis {
    index: number;
    chassisType: string;
    width: number | undefined;
    height: number | undefined;
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
