import React, {useEffect, useState} from 'react';
import {Select, Typography, Button, Modal, Divider, Steps} from "antd";
import companyTypeOptions, {companyTypeOptionsString} from "../../../definition/companyType";
import "./initialScreenStyles.css";
import {CheckOutlined, LeftOutlined} from "@ant-design/icons";

const { Title } = Typography;

const InitialScreen = (props: {
    secondStep:boolean,
    companyType:string,
    setCompanyType: (s: string) => void,
    companyTypeStatus:any,
    setCompanyTypeStatus: (s: string) => void,
    current:number,
    setCurrent: (s: number) => void}
) => {

    const {secondStep, companyType, setCompanyType, companyTypeStatus, setCompanyTypeStatus, current, setCurrent} = props;

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
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('code')) {
            console.log("kakao = ", urlParams.get('code'));
        }
    }, []);

    useEffect(() => {
        if (companyType !== '선택안함' && companyType !== undefined) {
            setCompanyTypeStatus('');
        }
    }, [companyType]);

    const [selectedOption, setSelectedOption] = useState(null);

    const handleSelect = (option: any) => {
        setSelectedOption(option);
        setCompanyType(option);
        setCurrent(current + 1)
    };


    return (
        <>
            { ( !getStarted && !secondStep && !isAgreed ) &&
                <table>
                    <tbody>
                        <tr>
                            <td colSpan={2}>
                                <div style={{fontFamily: 'Cochin', color: 'grey', width: 500}}>
                                    안녕하세요 <strong style={{ color: '#444444'}}>호빵</strong>입니다. <br/><br/>
                                    전국 창호금액의 기준을 제시하는 것을 목표로 합니다.
                                    <br/><br/>
                                    <strong style={{ color: '#444444'}}>호</strong>구가 <strong style={{ color: '#444444'}}>빵</strong>명이 되는 그날까지.
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2}>
                                <div style={{ marginTop: '7%' }}>
                                    <Button onClick={handleGetStarted} size={"small"}> 창호 견적 시작하기</Button>
                                </div>
                            </td>
                        </tr>

                        <Modal
                            centered
                            closeIcon={false}
                            open={openNotification}
                            onOk={handleNotificationAgree}
                            okText={"동의하고 견적 받기"}
                            cancelText={"미동의"}
                            onCancel={() => setOpenNotification(false)}
                            cancelButtonProps={{ style: { backgroundColor: "#fff", color: "#000", border: "1px solid #000" } }}
                        >
                            <body className="modal-body">
                                <h1 className="modal-h1">호빵 소개</h1>

                                <div className="project-description">
                                    <h2>호구 빵명 프로젝트란?</h2>
                                    <p>
                                        <strong>"왜 인테리어 견적비에는 명확한 기준이 없을까?"</strong>
                                        통일된 창호 가격 기준을 제시하여 소비자가 신뢰할 수 있는 금액을 만들어보고자 합니다.<br/><br/>
                                        현재 인테리어 시장의 불신은 비전문가들이 퍼뜨린 잘못된 정보에서 비롯된다고 생각합니다.
                                        저희 호빵은 한 분야의 전문가로서 올바른 방향을 제시하고 기준이 되고자 합니다.
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
                <>
                    {/*상황 진척도*/}
                    <div style={{width: "800px"}}>
                        <Steps
                            current={current}
                            items={[
                                {
                                    title: '회사선택',
                                    description: companyType
                                },
                                {
                                    title: '창호 입력',

                                },
                                {
                                    title: '주소 입력',
                                },
                                {
                                    title: '기타 사항 입력',
                                },
                                {
                                    title: '계산시작',
                                },
                            ]}
                        />
                    </div>

                    <div style={{width: '800px'}}>
                        {/*뒤로가기*/}
                        <div onClick={handleBack} style={{color: "blue", marginRight: "80%", marginTop: '50px'}}>
                            <LeftOutlined/>
                        </div>
                        <table>
                            <tbody>
                                <tr>
                                    <td colSpan={2}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: "50%" }}>
                                            <div style={{ color: 'red', fontSize: 16 }}>*</div>
                                            <Title level={2}>
                                                창호 회사 선택
                                            </Title>
                                        </div>
                                        <Divider  style={{  borderColor: '#a4a3a3', marginTop: '-10px' }}/>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={2}>
                                        <div style={styles.container}>
                                            {companyTypeOptionsString.map((option, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => handleSelect(option)}
                                                    style={{
                                                        ...styles.box,
                                                        borderColor: selectedOption === option ? 'green' : '#ccc',
                                                        position: 'relative',
                                                    }}
                                                >
                                                    {option}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </>
            }
        </>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        gap: '10px',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: '10%'
    },
    box: {
        width: '150px',
        height: '50px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: '2px solid #ccc',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'border-color 0.3s ease',
    }
};


export default InitialScreen;
