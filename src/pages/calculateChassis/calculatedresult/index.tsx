import React from 'react';
import {Button, Result} from 'antd';

const CalculatedResult = (props:{result:any}) => {

    const {result} = props;

    const onClickReCalculate = () => {
        window.location.reload();
    }

    return(
        <>
            <Result
                status="success"
                title={`계산된 가격은 ${result} 입니다.`}
                subTitle="받아본 견적은 상황에 따라 추가 금액이 붙을 수 있습니다. 참고 하시기 바랍니다."
                extra={[
                    <Button type="primary" key="console" onClick={onClickReCalculate}>
                        다시 견적 받기
                    </Button>,
                ]}
            />
        </>
    )
}

export default CalculatedResult;
