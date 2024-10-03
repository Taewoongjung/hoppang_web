import React, {useEffect, useState} from 'react';
import {Select, Typography, Button, Modal} from "antd";
import companyTypeOptions from "../../../definition/companyType";
import "./initialScreenStyles.css";
import {LeftOutlined} from "@ant-design/icons";

const { Title } = Typography;

const InitialScreen = (props: {secondStep:boolean, companyType:string, setCompanyType: (s: string) => void, companyTypeStatus:any, setCompanyTypeStatus: (s: string) => void}) => {

    const {secondStep, companyType, setCompanyType, companyTypeStatus, setCompanyTypeStatus} = props;

    const [isAgreed, setIsAgreed] = useState(false);
    const [openNotification, setOpenNotification] = useState(false);
    const [getStarted, setGetStarted] = useState(false);

    const handleGetStarted = () => {
        setOpenNotification(true);
    }

    const handleNotificationAgree = () => {
        setGetStarted(!getStarted);
        setIsAgreed(!isAgreed);
        setOpenNotification(!openNotification);
    }

    const handleBack = () => {
        window.location.reload();
    }

    useEffect(() => {
        if (companyType !== '선택안함' && companyType !== undefined) {
            setCompanyTypeStatus('');
        }
    }, [companyType]);

    return (
        <>
            { ( !getStarted && !secondStep && !isAgreed ) &&
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

                        <Modal
                            centered
                            open={openNotification}
                            onOk={handleNotificationAgree}
                            okText={"동의하고 견적 받기"}
                            cancelText={"미동의"}
                            onCancel={() => setOpenNotification(false)}
                            cancelButtonProps={{ style: { backgroundColor: "#fff", color: "#000", border: "1px solid #000" } }} // 미동의 버튼 테두리 검정, 바탕 흰색
                        >
                            <body className="modal-body">
                                <h1 className="modal-h1">호빵 소개</h1>

                                <div className="project-description">
                                    <h2>호구 빵명 프로젝트란?</h2>
                                    <p>
                                        "왜 인테리어에는 명확한 소비자 기준 금액이 없을까?"
                                        이 질문에서 시작된 저희 호빵의 프로젝트는, 창호 계산 프로그램을 통해 전국에 통일된 창호 가격 기준을 제시하여 소비자들이 신뢰할 수 있는 금액을 만들어보고자 합니다.
                                        현재 인테리어 시장의 불신은 비전문가들이 퍼뜨린 잘못된 정보에서 비롯된다고 생각합니다.
                                        저희 호빵은 완벽하진 않지만, 한 분야의 전문가로서 올바른 방향을 제시하고 기준이 되려 노력하고 있습니다.
                                    </p>
                                </div>

                                <div className="caution">
                                    <h2 className="modal-h2">주의사항</h2>
                                    <ul>
                                        <li>본 서비스는 참고용이며, 실제 창호 제작 시 가격은 다를 수 있습니다.</li>
                                        <li>에너지 효율등급은 전체 창호 교체 시 2등급을 기준으로 합니다.</li>
                                        <li>각 회사별 발코니 창은 기본 사양 제품 기준입니다.</li>
                                        <li>양중비용 관련:
                                            <ul>
                                                <li>사다리차 비용은 지역에 따라 상이할 수 있습니다.</li>
                                                <li>사다리차 사용이 불가능한 경우 추가 비용이 발생할 수 있습니다.</li>
                                                <li>양중이 불가능한 상황이 있을 수 있습니다 (예: 시스템 창호, 도로 혼잡 지역의 거실창 등).</li>
                                            </ul>
                                        </li>
                                    </ul>
                                </div>
                            </body>
                        </Modal>
                    </tbody>
                </table>
            }

            { ( getStarted && isAgreed ) &&
                <table>
                    <tbody>
                        <tr>
                            <td colSpan={2}>
                                <div onClick={handleBack} style={{color: "darkred"}}>
                                    <LeftOutlined style={{marginBottom:20}}/> 뒤로
                                </div>
                            </td>
                        </tr>
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
