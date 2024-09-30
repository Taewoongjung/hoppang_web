import React from 'react';
import {Table, TableColumnsType} from "antd";

interface DataType {
    key: React.Key;
    name: string;
    age: number;
    address: string;
    description: string;
}

const columns: TableColumnsType<DataType> = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Age', dataIndex: 'age', key: 'age' },
    { title: 'Address', dataIndex: 'address', key: 'address' },
];

const columns2: TableColumnsType<DataType> = [
    { title: '견적번호', dataIndex: 'estimationId', key: 'id' },
    { title: '회사종류', dataIndex: 'companyType', key: 'companyType' },
    { title: '전체 금액', dataIndex: 'totalPrice', key: 'totalPrice' },
    { title: '주소', dataIndex: 'address', key: 'address' },
    { title: '상세주소', dataIndex: 'subAddress', key: 'subAddress' },
    { title: '견적일', dataIndex: 'createdAt', key: 'createdAt' },
];


const EstimationManagement = () => {

    const data: DataType[] = [
        {
            key: 1,
            name: 'John Brown',
            age: 32,
            address: 'New York No. 1 Lake Park',
            description: 'My name is John Brown, I am 32 years old, living in New York No. 1 Lake Park.',
        },
        {
            key: 2,
            name: 'Jim Green',
            age: 42,
            address: 'London No. 1 Lake Park',
            description: 'My name is Jim Green, I am 42 years old, living in London No. 1 Lake Park.',
        },
        {
            key: 3,
            name: 'Not Expandable',
            age: 29,
            address: 'Jiangsu No. 1 Lake Park',
            description: 'This not expandable',
        },
        {
            key: 4,
            name: 'Joe Black',
            age: 32,
            address: 'Sydney No. 1 Lake Park',
            description: 'My name is Joe Black, I am 32 years old, living in Sydney No. 1 Lake Park.',
        },
    ];

    return (
        <>
            <Table
                columns={columns}
                expandable={{
                    expandedRowRender: (record) => <p style={{ margin: 0 }}>{record.description}</p>,
                    rowExpandable: (record) => record.name !== 'Not Expandable',
                }}
                dataSource={data}
            />
        </>
    )
}

export default EstimationManagement;
