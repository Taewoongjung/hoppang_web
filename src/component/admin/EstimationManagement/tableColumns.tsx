import React from 'react';
import { ColumnsType } from 'antd/es/table';
import { CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { addCommasToNumber } from '../../../util';
import { EstimationData } from './types';

export const columns: ColumnsType<EstimationData> = [
    {
        title: '견적 번호',
        dataIndex: 'id',
        key: 'id',
        width: 100,
        align: 'center',
    },
    {
        title: '회사 유형',
        dataIndex: 'companyType',
        key: 'companyType',
        width: 120,
        align: 'center',
    },
    {
        title: '고객 명',
        dataIndex: 'userName',
        key: 'userName',
        width: 100,
        align: 'center',
    },
    {
        title: '고객 전화번호',
        dataIndex: 'userPhoneNumber',
        key: 'userPhoneNumber',
        width: 150,
        align: 'center',
    },
    {
        title: '주소',
        dataIndex: 'chassisEstimationAddress',
        key: 'address',
        width: 300,
        align: 'left',
        render: (address) =>
            address
                ? `(${address.zipCode}) ${address.address} ${address.subAddress}`
                : null,
    },
    {
        title: '확장여부',
        dataIndex: 'chassisEstimationAddress',
        key: 'isExpanded',
        width: 90,
        align: 'center',
        render: (address) => (address.isExpanded ? 'O' : <CloseOutlined />),
    },
    {
        title: '총 가격',
        dataIndex: 'totalPrice',
        key: 'totalPrice',
        width: 120,
        align: 'right',
        render: (price: number) => addCommasToNumber(price),
    },
    {
        title: '생성일',
        dataIndex: 'createdAt',
        key: 'createdAt',
        width: 180,
        align: 'center',
        render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss'),
    },
];
