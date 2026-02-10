export interface Address {
    zipCode: string;
    address: string;
    subAddress: string;
    isExpanded: boolean;
}

export interface ChassisSize {
    chassisType: string;
    width: number;
    height: number;
    price: number;
}

export interface AdditionalChassisPriceInfo {
    [key: string]: number;
}

export interface EstimationData {
    id: number;
    key: number;
    companyType: string;
    userName: string;
    userPhoneNumber: string;
    chassisEstimationAddress: Address;
    totalPrice: number;
    createdAt: string;
    chassisSizeList?: ChassisSize[];
    additionalChassisPriceInfo: AdditionalChassisPriceInfo;
}

export interface AdditionalInfoData {
    key: number;
    item: string;
    price: number;
}

export interface ExpandedRowRenderProps {
    additionalChassisPriceInfo: AdditionalChassisPriceInfo;
    chassisSizeList?: ChassisSize[];
}

export interface EstimationListResponse {
    data: EstimationData[];
    count: number;
}
