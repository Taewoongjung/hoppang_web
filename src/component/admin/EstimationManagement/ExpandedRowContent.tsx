import React, { useMemo, memo } from 'react';
import { Table } from 'antd';
import { addCommasToNumber, convertAdditionalChassisPriceInfoToKo } from '../../../util';
import { ExpandedRowRenderProps, AdditionalInfoData } from './types';

const ExpandedRowContent: React.FC<ExpandedRowRenderProps> = memo(({
    additionalChassisPriceInfo,
    chassisSizeList = [],
}) => {
    // 컬럼 정의는 한 번만 생성
    const chassisSizeColumns = useMemo(() => [
        { title: '샤시 종류', dataIndex: 'chassisType', key: 'chassisType' },
        { title: '너비(w)', dataIndex: 'width', key: 'width' },
        { title: '높이(h)', dataIndex: 'height', key: 'height' },
        {
            title: '가격',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => `₩${addCommasToNumber(price)}`,
        },
    ], []);

    const additionalInfoColumns = useMemo(() => [
        { title: '항목', dataIndex: 'item', key: 'item' },
        {
            title: '가격',
            dataIndex: 'price',
            key: 'price',
            render: (price: number) => `₩${addCommasToNumber(price)}`,
        },
    ], []);

    // 추가 가격 정보 데이터 메모이제이션
    const additionalInfoData: AdditionalInfoData[] = useMemo(() =>
        Object.entries(additionalChassisPriceInfo).map(
            ([key, value], index) => ({
                key: index,
                item: convertAdditionalChassisPriceInfoToKo(key),
                price: value as number,
            })
        ),
        [additionalChassisPriceInfo]
    );

    // 스타일 객체 메모이제이션
    const containerStyle = useMemo<React.CSSProperties>(() => ({
        backgroundColor: '#e9ffe6',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    }), []);

    const headingStyle = useMemo<React.CSSProperties>(() => ({
        borderBottom: '1px solid #4caf50',
        paddingBottom: '8px',
        marginBottom: '16px',
    }), []);

    return (
        <div style={containerStyle}>
            <h3 style={headingStyle}>샤시 목록</h3>
            <Table
                columns={chassisSizeColumns}
                dataSource={chassisSizeList}
                pagination={false}
                bordered
                size="small"
                style={{ marginBottom: '24px' }}
            />
            <h3 style={headingStyle}>추가 가격 정보</h3>
            <Table
                columns={additionalInfoColumns}
                dataSource={additionalInfoData}
                pagination={false}
                bordered
                size="small"
                style={{ width: '60%' }}
            />
        </div>
    );
});

ExpandedRowContent.displayName = 'ExpandedRowContent';

export default ExpandedRowContent;
