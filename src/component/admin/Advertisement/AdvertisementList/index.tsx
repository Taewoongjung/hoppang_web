import React, { useRef, useState, useEffect } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import {InputRef, TableColumnsType, TableColumnType, Radio, Typography, Row, Col} from 'antd';
import {Badge, Button, Input, Space, Table} from 'antd';
import type { FilterDropdownProps } from 'antd/es/table/interface';
import {findAdvertisementContentWithClickCount} from "../../../../definition/Admin/apiPath";
import axios from 'axios';
import {CheckboxGroupProps} from "antd/es/checkbox";

interface DataType {
    key: string;
    advId: string;
    advChannel: number;
    memo: string;
    isOnAir: React.ReactNode;
    clickCount: bigint;
}

type DataIndex = keyof DataType;


const AdvertisementList = () => {

    const [isOnAir, setIsOnAir] = useState('all');
    const [tableData, setTableData] = useState<DataType[]>([]);

    useEffect(() => {
        axios.get(findAdvertisementContentWithClickCount + getQueryParam(), {
            withCredentials: true,
            headers: {
                Authorization: localStorage.getItem("hoppang-admin-token"),
            },
        })
            .then((res) => {
                processData(res.data.advContentWithClickCountList);
            })
            .catch((err) => {
                console.error("조회 중 에러 발생 = ", err);
            });
    },[isOnAir]);

    const getQueryParam = () => {
        const limit = 15;
        const offset = 0;

        let queryParam = '';
        if (isOnAir === 'onAir') {
            queryParam = `?limit=${limit}&offset=${offset}&isOnAir=true`;
        } else if (isOnAir === 'offAir') {
            queryParam = `?limit=${limit}&offset=${offset}&isOnAir=false`;
        } else if (isOnAir === 'all') {
            queryParam = `?limit=${limit}&offset=${offset}`;
        }

        return queryParam;
    }


    const processData = (dataList: any[]) => {
        const formattedData = dataList.map(data => (
            {
                key: data.advId,
                advId: <span style={{fontWeight: "bolder"}}>{data.advId}</span>,
                advChannel: data.advChannel,
                clickCount: data.clickCount,
                startAt: data.startAt,
                endAt: data.endAt || "미정",
                memo: data.memo,
                publisherId: data.publisherId,
                publisherName: data.publisherName,
                isOnAir: getIsOnAir(data.startAt, data.endAt)
            }
        ));

        // @ts-ignore
        setTableData(formattedData);
    };

    const getIsOnAir = (startAt: any, endAt: any) => {
        if (endAt) {
            return (
                <>
                    <Badge status="error" text={<span style={{fontWeight:"bold"}}>광고중단</span>}/>
                    <br/>({startAt} - {endAt})
                </>
            );
        }

        return (
            <>
                <Badge status="processing" text={<span style={{fontWeight:"bold"}}>광고중</span>} />
                <br/>({startAt} - )
            </>
        )
    }


    // const [searchText, setSearchText] = useState('');
    // const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef<InputRef>(null);

    const handleSearch = (
        selectedKeys: string[],
        confirm: FilterDropdownProps['confirm'],
        dataIndex: DataIndex,
    ) => {
        confirm();
        // setSearchText(selectedKeys[0]);
        // setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters: () => void) => {
        clearFilters();
        // setSearchText('');
    };

    const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<DataType> => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({ closeDropdown: false });
                            // setSearchText((selectedKeys as string[])[0]);
                            // setSearchedColumn(dataIndex);
                        }}
                    >
                        Filter
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            close();
                        }}
                    >
                        close
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
        ),
        onFilter: (value, record) =>
            // @ts-ignore
            record[dataIndex]
                .toString()
                .toLowerCase()
                .includes((value as string).toLowerCase()),
        render: (text) =>
                text
    });

    const columns: TableColumnsType<DataType> = [
        {
            title: 'adv_id',
            dataIndex: 'advId',
            key: 'advId',
            width: '20%',
            fixed: 'left',
            ...getColumnSearchProps('advId'),
        },
        {
            title: '광고 플랫폼',
            dataIndex: 'advChannel',
            key: 'advChannel',
            width: '10%',
            ...getColumnSearchProps('advChannel'),
        },
        {
            title: '광고중 여부',
            dataIndex: 'isOnAir',
            key: 'isOnAir',
            ...getColumnSearchProps('isOnAir'),
        },
        {
            title: '유저 클릭 횟수',
            dataIndex: 'clickCount',
            key: 'clickCount',
            width: '10%',
            ...getColumnSearchProps('clickCount'),
        },
        {
            title: '메모',
            dataIndex: 'memo',
            key: 'memo',
            ...getColumnSearchProps('memo'),
            sorter: (a, b) => a.memo.length - b.memo.length,
            sortDirections: ['descend', 'ascend'],
        }
    ];

    const options: CheckboxGroupProps<string>['options'] = [
        { label: '모두', value: 'all' },
        { label: '광고중', value: 'onAir' },
        { label: '광고중단', value: 'offAir' },
    ];


    return (
        <>
            <Typography.Title level={1} style={{marginBottom: '2%'}}>
                광고 리스트
            </Typography.Title>

            <Row style={{display: 'flex', height: '100%', marginBottom: '1%'}}>
                <Col span={1} style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <span style={{fontSize: '20px', fontWeight: 'bolder'}}>
                        광고 필터:
                    </span>
                </Col>
                <Col>
                    <Radio.Group
                        onChange={(e) => setIsOnAir(e.target.value)}
                        options={options}
                        defaultValue="all"
                        optionType="button"
                        buttonStyle="solid"
                    />
                </Col>
            </Row>

            <hr/>

            <Table<DataType>
                columns={columns}
                dataSource={tableData}
                pagination={{ pageSize: 15 }}
                scroll={{ x: 1300, y: 650 }}
                bordered
                rowHoverable
            />
        </>
    );
}

export default AdvertisementList;
