import { useState } from 'react';
import axios from 'axios';
import { findCountOfEstimationList, findEstimationList } from '../../../definition/Admin/apiPath';
import { EstimationData } from './types';
import { ADMIN_TOKEN_KEY } from './constants';

interface UseEstimationDataResult {
    data: EstimationData[];
    countOfData: number;
    isLoading: boolean;
    fetchData: (requestParam: string) => Promise<void>;
    setData: React.Dispatch<React.SetStateAction<EstimationData[]>>;
}

export const useEstimationData = (): UseEstimationDataResult => {
    const [data, setData] = useState<EstimationData[]>([]);
    const [countOfData, setCountOfData] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const getAuthHeaders = () => ({
        Authorization: localStorage.getItem(ADMIN_TOKEN_KEY) || '',
    });

    const fetchData = async (requestParam: string) => {
        setIsLoading(true);
        try {
            const [listResponse, countResponse] = await Promise.all([
                axios.get(findEstimationList + requestParam, {
                    withCredentials: true,
                    headers: getAuthHeaders(),
                }),
                axios.get(findCountOfEstimationList + requestParam, {
                    withCredentials: true,
                    headers: getAuthHeaders(),
                }),
            ]);

            const estimationList = listResponse.data.map((item: EstimationData) => ({
                ...item,
                key: item.id,
            }));

            setData(estimationList);
            setCountOfData(countResponse.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        data,
        countOfData,
        isLoading,
        fetchData,
        setData,
    };
};
