import React from 'react';
import { Button, Input, Space, Card, DatePicker } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { Dayjs } from 'dayjs';
import { DATE_FORMAT } from './constants';

type DateRange = [Dayjs | null, Dayjs | null] | null;

interface SearchFormProps {
    estimationIdList: string;
    onEstimationIdListChange: (value: string) => void;
    dateRange: DateRange;
    onDateRangeChange: (dates: DateRange) => void;
    onSearch: () => void;
}

const SearchForm: React.FC<SearchFormProps> = ({
    estimationIdList,
    onEstimationIdListChange,
    dateRange,
    onDateRangeChange,
    onSearch,
}) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const regex = /^[0-9,\s]*$/;

        if (regex.test(value) || value === '') {
            onEstimationIdListChange(value);
        }
    };

    return (
        <Card
            style={{ marginBottom: '10px', width: '500px' }}
            title="견적 검색"
            extra={
                <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={onSearch}
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
                <DatePicker.RangePicker
                    format={DATE_FORMAT}
                    // @ts-ignore
                    value={dateRange}
                    onChange={(dates) => onDateRangeChange(dates as DateRange)}
                    style={{ width: '60%' }}
                />
            </Space>
        </Card>
    );
};

export default SearchForm;
