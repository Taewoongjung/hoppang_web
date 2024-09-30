import React, {useEffect, useState} from 'react';
import {Select, Typography, Button} from "antd";
import companyTypeOptions from "../../../definition/companyType";

const { Title } = Typography;

const InitialScreen = (props: {companyType:string, setCompanyType: (s: string) => void, companyTypeStatus:any, setCompanyTypeStatus: (s: string) => void}) => {

    const {companyType, setCompanyType, companyTypeStatus, setCompanyTypeStatus} = props;

    const [getStarted, setGetStarted] = useState(false);

    const handleGetStarted = () => {
        setGetStarted(!getStarted);
    }

    useEffect(() => {
        if (companyType !== '선택안함' && companyType !== undefined) {
            setCompanyTypeStatus('');
        }
    }, [companyType]);

    return (
        <>
            {!getStarted &&
                <table>
                    <tbody>
                        <tr>
                            <td colSpan={2}>
                                <div style={{fontFamily: 'Cochin', color: 'grey'}}>
                                    안녕하세요 <strong>호빵</strong>입니다. <br/><br/>
                                    소비자들이 적정 가격에 샤시를 구매할 수 있도록 지표를 제시합니다.
                                    <br/><br/>
                                    호구가 빵명이 되는 그날까지.
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2}>
                                <Button onClick={handleGetStarted}>견적 시작하기</Button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            }

            {getStarted &&
                <table>
                    <tbody>
                        <tr>
                            <td colSpan={2}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ color: 'red', fontSize: 16, marginTop: '10px' }}>*</div>
                                    <Title level={4}>
                                        샤시 회사 선택 :
                                    </Title>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2}>
                                <Select
                                    status={companyTypeStatus}
                                    defaultValue="샤시 회사 선택"
                                    style={{ width: 150 }}
                                    onChange={setCompanyType}
                                    options={companyTypeOptions}/>
                            </td>
                        </tr>
                    </tbody>
                </table>
            }
        </>
    );
}

export default InitialScreen;
