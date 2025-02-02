import React, {useEffect, useState} from 'react';
import {Button, Descriptions, Divider, Typography, Input, message} from "antd";
import axios from "axios";
import {addCommasToNumber} from "../../../../util";
import {
    findAllAdditionalChassisPriceCriteria,
    reviseAdditionalChassisPriceCriteria
} from "../../../../definition/Admin/apiPath";


const { Title } = Typography;

const AdditionalChassisPriceCriteria = () => {

    const [messageApi, contextHolder] = message.useMessage();

    const [isUpdating, setIsUpdating] = useState(false);
    const [isFirstEditing, setIsFirstEditing] = useState(false); // 수정 모드 관리
    const [isSecondEditing, setIsSecondEditing] = useState(false); // 수정 모드 관리
    const [fees, setFees] = useState({
        DemolitionFee: undefined,
        MinimumLaborFee: undefined,
        MaintenanceFee: undefined,
        FreightTransportFee: undefined,
        DeliveryFee: undefined,
        IncrementRate: undefined,
        LadderCar2To6: undefined,
        LadderCar7To8: undefined,
        LadderCar9To10: undefined,
        LadderCar11To22PerF: undefined,
        LadderCarOver23: undefined,
    });

    const success = (successMsg:string) => {
        messageApi.open({
            type: 'success',
            content: successMsg,
        });
    };


    const errorModal = (errorMsg:string) => {
        messageApi.open({
            type: 'error',
            content: errorMsg
        });
    };

    // Input change handler
    const handleInputChange = (key: any, value: string) => {
        setFees(prevFees => ({ ...prevFees, [key]: value }));
    };

    useEffect(() => {
        axios.get(findAllAdditionalChassisPriceCriteria, {
            withCredentials: true,
            headers: {
                Authorization: localStorage.getItem("hoppang-admin-token") || '',
            },
        })
            .then((res) => {
                const newFees: { [key: string]: number } = {}; // newFees의 타입을 명확히 정의
                res.data.forEach((item: { type: string; price: number }) => { // type과 price의 정확한 타입 지정
                    newFees[item.type] = item.price; // 각 type에 맞는 price를 newFees에 저장
                });
                // @ts-ignore
                setFees(newFees); // 상태 업데이트
            })
            .catch((error) => {
                console.error('Error fetching data:', error); // 에러 메시지 출력
                errorModal(error);
            });

        setIsUpdating(false);

    }, [isUpdating]);

    const filterTargetedCriteriaKeyList = (targetList:any) => {
        return Object.entries(fees)
            .filter(([key]) => targetList.includes(key))
            .map(([key, value]) => ({
                type: key,
                revisingPrice: value,
            }));
    }

    const handleFirstTableEditToggle = () => setIsFirstEditing(!isFirstEditing); // 철거비/최소 인건비/보양비/도수 운반비 Edit mode toggle
    const callReviseHandleForFirst = () => {

        const targetList = [
            'DemolitionFee',
            'MinimumLaborFee',
            'MaintenanceFee',
            'FreightTransportFee',
            'DeliveryFee'
        ]

        const reqReviseAdditionalChassisPriceList = filterTargetedCriteriaKeyList(targetList);

        axios.put(reviseAdditionalChassisPriceCriteria,
            {reqReviseAdditionalChassisPriceList},
            {
            withCredentials: true,
            headers: {
                Authorization: localStorage.getItem("hoppang-admin-token") || '',
            },
        })
            .then((res) => {
                if (res.data === true) {
                    success('수정 완료');
                    setIsUpdating(true);
                }
                // 수정 상태 원복
                handleFirstTableEditToggle();
            })
            .catch((err) => {
                errorModal("수정 중 에러 발생");
                // 수정 상태 원복
                handleFirstTableEditToggle();
            });
    }

    const handleSecondTableEditToggle = () => setIsSecondEditing(!isSecondEditing); // 층 별 사다리차 청구 금액 정보 Edit mode toggle
    const callReviseHandleForSecond = () => {

        const targetList = [
            'LadderCar2To6',
            'LadderCar7To8',
            'LadderCar9To10',
            'LadderCar11To22PerF',
            'LadderCarOver23'
        ]

        const reqReviseAdditionalChassisPriceList = filterTargetedCriteriaKeyList(targetList);

        setIsUpdating(true);
        axios.put(reviseAdditionalChassisPriceCriteria,
            {reqReviseAdditionalChassisPriceList},
            {
            withCredentials: true,
            headers: {
                Authorization: localStorage.getItem("hoppang-admin-token") || '',
            },
        })
            .then((res) => {
                if (res.data === true) {
                    success('수정 완료');
                    setIsUpdating(true);
                }
                // 수정 상태 원복
                handleSecondTableEditToggle();
            })
            .catch((err) => {
                errorModal("수정 중 에러 발생");
                // 수정 상태 원복
                handleSecondTableEditToggle();
            });
    }

    const renderFirstItem = (label: string, key: keyof typeof fees, span: number = 3) => (
        <Descriptions.Item label={label} span={span}>
            {isFirstEditing ? (
                <Input
                    value={fees[key]}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                />
            ) : (
                addCommasToNumber(fees[key])
            )}
        </Descriptions.Item>
    );

    const renderSecondItem = (label: string, key: keyof typeof fees, span: number = 3) => (
        <Descriptions.Item label={label} span={span}>
            {isSecondEditing ? (
                <Input
                    value={fees[key]}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                />
            ) : (
                addCommasToNumber(fees[key])
            )}
        </Descriptions.Item>
    );

    return (
        <>
            {contextHolder}
            <div style={{ width: 450 }}>
                <Divider orientation="center">가격 추가/수정</Divider>
                <Title level={3} style={{ marginBottom: '5%' }}>창호 가격에 적용 될 추가적 요소</Title>
                <div>
                    <Descriptions
                        bordered
                        title="철거비/최소 인건비/보양비/도수 운반비/배송비/원가대비 상승비율"
                        size="middle"
                        extra={
                            <>
                                {!isFirstEditing && <Button onClick={handleFirstTableEditToggle}>수정</Button>}

                                {isFirstEditing && <Button onClick={handleFirstTableEditToggle}>취소</Button>}
                                {isFirstEditing && <Button onClick={callReviseHandleForFirst}>저장</Button>}
                            </>
                        }
                    >
                        {renderFirstItem('철거비', 'DemolitionFee')}
                        {renderFirstItem('최소 인건비', 'MinimumLaborFee')}
                        {renderFirstItem('보양비', 'MaintenanceFee')}
                        {renderFirstItem('도수 운반비', 'FreightTransportFee')}
                        {renderFirstItem('배송비', 'DeliveryFee')}
                        {renderFirstItem('원가대비 상승비율', 'IncrementRate')}
                    </Descriptions>

                    <br />
                    <br />

                    <Descriptions
                        bordered
                        title="층 별 사다리차 청구 금액 정보"
                        size="middle"
                        extra={
                            <>
                                {!isSecondEditing && <Button onClick={handleSecondTableEditToggle}>수정</Button>}

                                {isSecondEditing && <Button onClick={handleSecondTableEditToggle}>취소</Button>}
                                {isSecondEditing && <Button onClick={callReviseHandleForSecond}>저장</Button>}
                            </>
                        }
                    >
                        {renderSecondItem('2 ~ 6 층', 'LadderCar2To6')}
                        {renderSecondItem('7 ~ 8 층', 'LadderCar7To8')}
                        {renderSecondItem('9 ~ 10 층', 'LadderCar9To10')}
                        {renderSecondItem('11 ~ 22 층 (층별 가격)', 'LadderCar11To22PerF')}
                        {renderSecondItem('23 층 이상 (층별 가격)', 'LadderCarOver23')}
                    </Descriptions>
                </div>
                <Divider/>
            </div>
        </>
    );
}

export default AdditionalChassisPriceCriteria;
