import React, {useEffect, useState} from 'react';
import {Button, DatePicker, Input, Space, Table, Card} from "antd";
import moment from 'moment';
import axios from "axios";
import {findEstimationList} from "../../../definition/Admin/apiPath";
import {addCommasToNumber, convertAdditionalChassisPriceInfoToKo} from "../../../util";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import {SearchOutlined} from "@ant-design/icons";

dayjs.extend(customParseFormat);

const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';

const columns = [
    {
        title: '견적 번호',
        dataIndex: 'id',
        key: 'id',
    },
    {
        title: '회사 유형',
        dataIndex: 'companyType',
        key: 'companyType',
    },
    {
        title: '주소',
        dataIndex: 'chassisEstimationAddress',
        key: 'address',
        render: (address: { address: any | undefined; subAddress: any | undefined; }) => address ? `${address.address} ${address.subAddress}` : null,
    },
    {
        title: '총 가격',
        dataIndex: 'totalPrice',
        key: 'totalPrice',
        render: (price: any) => `₩${addCommasToNumber(price)}`,
    },
    {
        title: '생성일',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (date: any) => moment(date).format('YYYY-MM-DD HH:mm:ss'),
    },
];


const EstimationManagement = () => {

    const [data, setData] = useState();
    const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);


    // 견적 리스트 조회
    useEffect(() => {
        axios.get(findEstimationList + `?startTime=2024-09-22&endTime=2024-10-01`, {
            withCredentials: true,
            headers: {
                Authorization: localStorage.getItem("hoppang-admin-token") || '',
            },
        })
            .then(res => {
                const estimationList = res.data.map((item: any) => ({
                    ...item,
                    key: item.id // 각 항목에 고유한 key 추가
                }));
                console.log("estimationList = ", estimationList)
                setData(estimationList);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }, []);

    const expandedRowRender = (record: { additionalChassisPriceInfo: { [s: string]: unknown; } | ArrayLike<unknown>; chassisSizeList: readonly Record<string | number | symbol, any>[] | undefined; }) => {
        const chassisSizeColumns = [
            { title: '샤시 종류', dataIndex: 'chassisType', key: 'chassisType' },
            { title: '너비(w)', dataIndex: 'width', key: 'width' },
            { title: '높이(h)', dataIndex: 'height', key: 'height' },
            { title: '가격', dataIndex: 'price', key: 'price', render: (price: any ) => `₩${addCommasToNumber(price)}` },
        ];

        const additionalInfoColumns = [
            { title: '항목', dataIndex: 'item', key: 'item' },
            { title: '가격', dataIndex: 'price', key: 'price', render: (price: any) => `₩${addCommasToNumber(price)}` },
        ];

        const additionalInfoData = Object.entries(record.additionalChassisPriceInfo).map(([key, value], index) => ({
            key: index,
            item: convertAdditionalChassisPriceInfoToKo(key),
            price: value,
        }));

        return (
            <div style={{
                backgroundColor: "#e9ffe6",
                padding: "16px",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
            }}>
                <h3 style={{
                    borderBottom: "1px solid #4caf50",
                    paddingBottom: "8px",
                    marginBottom: "16px"
                }}>샤시 목록</h3>
                <Table
                    columns={chassisSizeColumns}
                    dataSource={record.chassisSizeList}
                    pagination={false}
                    style={{marginBottom: "24px"}}
                />
                <h3 style={{
                    borderBottom: "1px solid #4caf50",
                    paddingBottom: "8px",
                    marginBottom: "16px"
                }}>추가 가격 정보</h3>
                <Table
                    columns={additionalInfoColumns}
                    dataSource={additionalInfoData}
                    pagination={false}
                    style={{width: "60%"}}
                />
            </div>
        );
    };

    const onExpand = (expanded: boolean, record: any) => {
        setExpandedRowKeys(expanded
            ? [...expandedRowKeys, record.key]
            : expandedRowKeys.filter(k => k !== record.key)
        );
    };

    // 검색 파라메터 변수
    const [estimationIdList, setEstimationIdList] = useState('');
    const [dateRange, setDateRange] = useState([]);

    const onClickSearchEstimation = async () => {
        // ID 처리
        const processedIds = processIdList(estimationIdList);
        setEstimationIdList(processedIds);
        const estIdList = processedIds.split(',');

        // 날짜 처리
        let startDate, endDate;
        if (dateRange.length === 2) {
            // @ts-ignore
            [startDate, endDate] = dateRange.map(date => date.format(dateFormat));
        } else {
            startDate = moment().subtract(7, 'days').format(dateFormat);
            endDate = moment().add(7, 'days').format(dateFormat);
            // @ts-ignore
            setDateRange(startDate.toString);
            // @ts-ignore
            setDateRange(endDate.toString);
        }

        // API 호출 또는 상태 업데이트
        console.log('검색 파라미터:', {ids: estIdList, startDate, endDate});

        // 호출 파라메터 생성
        let requestParam = "?";
        if (!(estIdList.length === 1 && estIdList[0] === '')) {
            requestParam += "estimationIdList=";
            requestParam += estIdList.join(',');
            requestParam += "&";
        }

        requestParam += "startTime=" + startDate + "&" + "endTime=" + endDate;

        // 견적 리스트 호출
        await axios.get(findEstimationList + requestParam, {
            withCredentials: true,
            headers: {
                Authorization: localStorage.getItem("hoppang-admin-token") || '',
            },
        })
            .then(res => {
                const estimationList = res.data.map((item: any) => ({
                    ...item,
                    key: item.id // 각 항목에 고유한 key 추가
                }));
                console.log("estimationList = ", estimationList)
                setData(estimationList);
                setExpandedRowKeys([]);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }

    const handleInputChange = (e: { target: { value: any; }; }) => {
        const value = e.target.value;
        // 숫자와 콤마만 허용하는 정규 표현식
        const regex = /^[0-9,\s]*$/;

        if (regex.test(value) || value === '') {
            setEstimationIdList(value);
        }
    };

    const processIdList = (input: string) => {
        // 콤마로 구분된 각 부분을 처리
        return input.split(',').map(part => {
            // 각 부분에서 공백을 제거하고 연속된 숫자로 만듦
            return part.replace(/\s+/g, '').trim();
        }).filter(id => id !== '').join(',');
    };


    return (
        <>
            <div style={{ padding: '24px' }}>
                <Card
                    style={{ marginBottom: '24px', width: '500px'}}
                    title="견적 검색"
                    extra={
                        <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            onClick={onClickSearchEstimation}
                        >
                            검색
                        </Button>
                    }
                >
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <Input
                            placeholder="견적 번호를 콤마로 구분하여 입력"
                            value={estimationIdList}
                            onChange={handleInputChange}
                            style={{ width: '100%' }}
                        />
                        <RangePicker
                            format={dateFormat}
                            // @ts-ignore
                            value={dateRange}
                            // @ts-ignore
                            onChange={(dates) => setDateRange(dates)}
                            style={{ width: '60%' }}
                        />
                    </Space>
                </Card>

                <Table
                    columns={columns}
                    dataSource={data}
                    expandable={{
                        expandedRowRender,
                        expandedRowKeys,
                        onExpand
                    }}
                    style={{ backgroundColor: 'white' }}
                    bordered
                />
            </div>
        </>
    );
}

export default EstimationManagement;
