import React, {useEffect, useState} from 'react';
import {Select, Typography, Button} from "antd";
import companyTypeOptions from "../../../definition/companyType";

const { Title } = Typography;

const InitialScreen = (props: {secondStep:boolean, companyType:string, setCompanyType: (s: string) => void, companyTypeStatus:any, setCompanyTypeStatus: (s: string) => void}) => {

    const {secondStep, companyType, setCompanyType, companyTypeStatus, setCompanyTypeStatus} = props;

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
            {(!getStarted && !secondStep) &&
                <table>
                    <tbody>
                        <tr>
                            <td colSpan={2}>
                                <div style={{
                                    position: 'fixed',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    width: '80%', // 또는 원하는 너비
                                    maxHeight: '20vh', // 뷰포트 높이의 80%
                                    overflow: 'auto',
                                    textAlign: 'center',
                                    padding: '20px',
                                    marginTop: 30,
                                    boxSizing: 'border-box' }}>
                                    <div style={{fontFamily: 'Cochin', color: 'grey', textAlign: 'center'}}>
                                        안녕하세요 <strong>호빵</strong>입니다. <br/><br/>
                                        소비자들이 적정 가격에 샤시를 구매할 수 있도록 지표를 제시합니다.
                                        <br/><br/>
                                        호구가 빵명이 되는 그날까지.
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2}>
                                <div style={{
                                    position: 'fixed',
                                    overflow: 'auto',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transform: 'translate(-50%, -50%)',
                                    width: '60%',
                                    marginTop: 50
                                }}>
                                    <div style={{marginTop: 10}}>
                                        <Button onClick={handleGetStarted} size={"small"}> 견적 시작하기</Button>
                                    </div>
                                </div>
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
