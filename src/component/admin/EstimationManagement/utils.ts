import dayjs from 'dayjs';
import { DATE_FORMAT, DEFAULT_DAYS_TO_ADD, DEFAULT_DAYS_TO_SUBTRACT } from './constants';

export const processIdList = (input: string): string => {
    return input
        .split(',')
        .map((part) => part.replace(/\s+/g, '').trim())
        .filter((id) => id !== '')
        .join(',');
};

export const getDefaultDateRange = (): [dayjs.Dayjs, dayjs.Dayjs] => {
    const startDate = dayjs().subtract(DEFAULT_DAYS_TO_SUBTRACT, 'day');
    const endDate = dayjs().add(DEFAULT_DAYS_TO_ADD, 'day');
    return [startDate, endDate];
};

export const formatRequestParam = (
    estimationIdList: string,
    startDate: string,
    endDate: string
): string => {
    let param = '?';

    const processedIds = processIdList(estimationIdList);
    const estIdList = processedIds.split(',').filter((id) => id !== '');

    if (estIdList.length > 0) {
        param += `estimationIdList=${estIdList.join(',')}&`;
    }

    param += `startTime=${startDate}&endTime=${endDate}`;
    return param;
};
