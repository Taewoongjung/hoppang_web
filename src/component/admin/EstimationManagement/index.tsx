import React, { useEffect, useState, useCallback } from 'react';
import { Table, message } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { findEstimationList } from '../../../definition/Admin/apiPath';
import {
    EstimationData,
    ExpandedRowRenderProps,
} from './types';
import {
    useEstimationData,
} from './hooks';
import { columns } from './tableColumns';
import SearchForm from './SearchForm';
import ExpandedRowContent from './ExpandedRowContent';
import { processIdList, formatRequestParam, getDefaultDateRange } from './utils';
import {
    DATE_FORMAT,
    DEFAULT_DAYS_TO_SUBTRACT,
    PAGE_SIZE,
} from './constants';

dayjs.extend(customParseFormat);

type DateRange = [dayjs.Dayjs | null, dayjs.Dayjs | null] | null;

const EstimationManagement: React.FC = () => {
    const urlParams = new URLSearchParams(window.location.search);

    const {
        data,
        countOfData,
        isLoading,
        fetchData,
        setData,
    } = useEstimationData();

    const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
    const [estimationIdList, setEstimationIdList] = useState<string>('');
    const [dateRange, setDateRange] = useState<DateRange>(null);
    const [requestParam, setRequestParam] = useState<string>('');

    // 초기 렌더링 시 데이터 로드
    useEffect(() => {
        const defaultStartDate = dayjs()
            .subtract(DEFAULT_DAYS_TO_SUBTRACT, 'day')
            .format(DATE_FORMAT);
        const defaultEndDate = dayjs().format(DATE_FORMAT);

        let param: string;

        if (urlParams.get('estimationIdList')) {
            const requestEstimationIdParam = urlParams
                .get('estimationIdList')!
                .split(',')
                .map((id) => Number(id))
                .join(',');

            param = `?estimationIdList=${requestEstimationIdParam}&startTime=${defaultStartDate}&endTime=${defaultEndDate}`;

            // 입력 필드에도 ID 목록 설정
            setEstimationIdList(requestEstimationIdParam);
        } else {
            param = `?startTime=${defaultStartDate}&endTime=${defaultEndDate}`;
        }

        const initialDateRange: DateRange = [
            dayjs(defaultStartDate, DATE_FORMAT),
            dayjs(defaultEndDate, DATE_FORMAT),
        ];
        setDateRange(initialDateRange);
        setRequestParam(param);
        fetchData(param);
    }, []);

    const onExpand = useCallback((expanded: boolean, record: EstimationData) => {
        setExpandedRowKeys((prev) =>
            expanded
                ? [...prev, record.key]
                : prev.filter((k) => k !== record.key)
        );
    }, []);

    const onClickSearchEstimation = useCallback(async () => {
        const processedIds = processIdList(estimationIdList);
        setEstimationIdList(processedIds);

        let startDate: string, endDate: string;

        if (dateRange && dateRange[0] && dateRange[1]) {
            startDate = dateRange[0].format(DATE_FORMAT);
            endDate = dateRange[1].format(DATE_FORMAT);
        } else {
            const [defaultStart, defaultEnd] = getDefaultDateRange();
            startDate = defaultStart.format(DATE_FORMAT);
            endDate = defaultEnd.format(DATE_FORMAT);
            setDateRange([defaultStart, defaultEnd]);
        }

        const param = formatRequestParam(processedIds, startDate, endDate);

        try {
            setRequestParam(param);
            setExpandedRowKeys([]);
            await fetchData(param);
        } catch (error) {
            message.error('견적 데이터를 불러오는데 실패했습니다.');
        }
    }, [estimationIdList, dateRange, fetchData]);

    const expandedRowRender = useCallback(
        (record: ExpandedRowRenderProps) => {
            return <ExpandedRowContent {...record} />;
        },
        []
    );

    const handlePageChange = useCallback(
        (page: number, pageSize: number) => {
            if (requestParam) {
                fetchData(requestParam);
            }
        },
        [requestParam, fetchData]
    );

    return (
        <div>
            <SearchForm
                estimationIdList={estimationIdList}
                onEstimationIdListChange={setEstimationIdList}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                onSearch={onClickSearchEstimation}
            />

            <Table
                key={data?.length}
                columns={columns}
                dataSource={data}
                expandable={{
                    expandedRowRender,
                    expandedRowKeys,
                    onExpand,
                }}
                pagination={{
                    total: countOfData,
                    position: ['bottomCenter'],
                    pageSize: PAGE_SIZE,
                    showSizeChanger: false,
                    showTotal: (total, range) =>
                        `총 ${total}개 중 ${range[0]}-${range[1]}번째 항목`,
                    onChange: handlePageChange,
                }}
                bordered
                loading={isLoading}
                style={{ backgroundColor: 'white' }}
            />
        </div>
    );
};

export default EstimationManagement;
