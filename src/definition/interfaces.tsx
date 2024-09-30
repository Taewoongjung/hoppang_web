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
    address: any,
    subAddress: any,
    buildingNumber: any,
}
