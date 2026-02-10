import React from 'react';
import { Table } from 'antd';
import { addCommasToNumber, convertAdditionalChassisPriceInfoToKo } from '../../../util';
import { ExpandedRowRenderProps, AdditionalInfoData } from './types';

const ExpandedRowContent: React.FC<ExpandedRowRenderProps> = ({
    additionalChassisPriceInfo,
    chassisSizeList = [],
}) => {
    const chassisSizeColumns = [
        { title: '샤시 종류', dataIndex: 'chassisType', key: 'chassisType' },
        { title: '너비(w)', dataIndex: 'width', key: 'width' },
        { title: '높이(h)', dataIndex: 'height', key: 'height' },
        {
            title: '가격',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => `₩${addCommasToNumber(price)}`,
        },
    ];

    const additionalInfoColumns = [
        { title: '항목', dataIndex: 'item', key: 'item' },
        {
            title: '가격',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => `₩${addCommasToNumber(price)}`,
        },
    ];

    const additionalInfoData: AdditionalInfoData[] = Object.entries(additionalChassisPriceInfo).map(
        ([key, value], index) => ({
            key: index,
            item: convertAdditionalChassisPriceInfoToKo(key),
            price: value as number,
        })
    );

    const containerStyle: React.CSSProperties = {
        backgroundColor: '#e9ffe6',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    };

    const headingStyle: React.CSSProperties = {
        borderBottom: '1px solid #4caf50',
        paddingBottom: '8px',
        marginBottom: '16px',
    };

    return (
        <div style={containerStyle}>
            <h3 style={headingStyle}>샤시 목록</h3>
            <Table
                columns={chassisSizeColumns}
                dataSource={chassisSizeList}
                pagination={false}
                style={{ marginBottom: '24px' }}
            />
            <h3 style={headingStyle}>추가 가격 정보</h3>
            <Table
                columns={additionalInfoColumns}
                dataSource={additionalInfoData}
                pagination={false}
                style={{ width: '60%' }}
            />
        </div>
    );
};

export default ExpandedRowContent;
