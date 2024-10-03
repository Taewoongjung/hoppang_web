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
                                <div style={{fontFamily: 'Cochin', color: 'grey', width: 300}}>
                                    안녕하세요 <strong style={{ color: '#444444'}}>호빵</strong>입니다. <br/><br/>
                                    전국 창호금액의 기준을 제시하는 것을 목표로 합니다.
                                    <br/><br/>
                                    <strong style={{ color: '#444444'}}>호</strong>구가 <strong style={{ color: '#444444'}}>빵</strong>명이 되는 그날까지.
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2}>
                                <div style={{marginTop: '7%', marginBottom: '-14%'}}>
                                    <Button onClick={handleGetStarted} size={"small"}> 창호 견적 시작하기</Button>
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
                                        창호 회사 선택 :
                                    </Title>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2}>
                                <Select
                                    status={companyTypeStatus}
                                    defaultValue="창호 회사 선택"
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
