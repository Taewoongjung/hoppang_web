import React, {useEffect, useState} from 'react';
import {Typography, Button, Modal, Divider} from "antd";
import {companyTypeOptionsString} from "../../../definition/companyType";
import "./initialScreenStyles.css";
import {LeftOutlined} from "@ant-design/icons";
import useSWR from "swr";
import {appleAuth, callMeData, kakaoAuth, googleAuth} from "../../../definition/apiPath";
import fetcher from 'src/util/fetcher';
import axios from "axios";
import { useParams } from 'react-router-dom';
import OverlayLoadingPage from "../../../component/Loading/OverlayLoadingPage";


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
    const { oauthtype } = useParams();

    const urlParams = new URLSearchParams(window.location.search);

    const { data: userData, error, mutate } = useSWR(callMeData, fetcher, {
        dedupingInterval: 2000
    });

    const [isLoading, setIsLoading] = useState(false);

    const {secondStep, companyType, setCompanyType, companyTypeStatus, setCompanyTypeStatus, current, setCurrent} = props;

    const [isAgreed, setIsAgreed] = useState(false);
    const [openNotification, setOpenNotification] = useState(false);
    const [getStarted, setGetStarted] = useState(false);

    const handleGetStarted = () => {
        setOpenNotification(true);
    }

    const handleNotificationAgree = async () => {
        await checkIfLoggedIn(); // 로그인 했는지 확인하기

        await mutate()
            .then(() => {
                checkIfFinishedSignedUp(); // 모든 로그인 프로세스를 마쳤는지 확인하기
                setGetStarted(!getStarted);
                setIsAgreed(!isAgreed);
                setOpenNotification(!openNotification);
            });
    }

    const checkIfLoggedIn = () => {
        axios.get(callMeData, {
            headers: {
                withCredentials: true,
                Authorization: localStorage.getItem("hoppang-token")
            },
        }).then((res) => {

        }).catch((err) => {
            window.location.href = "/login?needed=true";
        })
    }

    const checkIfFinishedSignedUp = () => {
        if (!userData.tel) {
            window.location.href = "/login/first?remainedProcess=true&userEmail=" + userData.email;
        }
    }

    const handleBack = () => {
        window.location.reload();
    }

    // 카카오 소셜 로그인
    useEffect(() => {
        if (oauthtype) {
            setIsLoading(true);
            if (oauthtype === 'kko' && localStorage.getItem('kakaoTokenInfo')) {
                // 카카오 로그인 성공 요청
                axios.post(kakaoAuth,
                    {
                        // deviceId: '122333444555666',
                        deviceId: localStorage.getItem('deviceId'),
                        deviceType: localStorage.getItem('deviceType'),
                        tokenInfo: localStorage.getItem('kakaoTokenInfo')
                    },
                    {withCredentials: true})
                    .then((res) => {
                        const token = res.headers['authorization'];
                        localStorage.setItem("hoppang-token", token); // 로그인 성공 시 로컬 스토리지에 토큰 저장
                        localStorage.setItem("hoppang-login-oauthType", res.data.oauthType); // 로그인 타입 설정
                        localStorage.setItem('kakaoTokenInfo', '');

                        if (res.data.isSuccess && res.data.isTheFirstLogIn) {
                            window.location.href = "/login/first?remainedProcess=false&userEmail=" + res.data.userEmail
                        }
                        return setIsLoading(false);

                    })
                    .catch((err) => {
                        alert(err.response.data.errorMessage);
                        if (err.response.data.errorCode === 7) { // 리프레시 토큰이 만료 되었을 때
                            window.location.href = err.response.data.redirectUrl; // 로그인 화면으로 리다이렉팅
                        }
                        return setIsLoading(false);
                    });
                return setIsLoading(false);
            }

            if (oauthtype === 'apl' && urlParams.get('code')) {
                // 애플 로그인 성공 요청
                axios.post(appleAuth + urlParams.get('code'),
                    {
                        deviceId: localStorage.getItem('deviceId'),
                        deviceType: localStorage.getItem('deviceType')
                    },
                    {withCredentials: true})
                    .then((res) => {

                        const token = res.headers['authorization'];
                        localStorage.setItem("hoppang-token", token); // 로그인 성공 시 로컬 스토리지에 토큰 저장
                        localStorage.setItem("hoppang-login-oauthType", res.data.oauthType); // 로그인 타입 설정

                        if (res.data.isSuccess && res.data.isTheFirstLogIn) {
                            window.location.href = "/login/first?remainedProcess=false&userEmail=" + res.data.userEmail
                        }
                        return setIsLoading(false);

                    })
                    .catch((err) => {
                        alert(err.response.data.errorMessage);
                        if (err.response.data.errorCode === 7) { // 리프레시 토큰이 만료 되었을 때
                            window.location.href = err.response.data.redirectUrl; // 로그인 화면으로 리다이렉팅
                        }
                        return setIsLoading(false);
                    });
                return setIsLoading(false);
            }

            if (oauthtype === 'gle' && urlParams.get('code')) {
                // 구글 로그인 성공 요청
                axios.post(googleAuth + "?code=" + urlParams.get('code'),
                    {
                        deviceId: localStorage.getItem('deviceId'),
                        deviceType: localStorage.getItem('deviceType')
                    },
                    {withCredentials: true})
                    .then((res) => {
                        console.log("소셜로그인 성공 = ", res.data);

                        const token = res.headers['authorization'];
                        localStorage.setItem("hoppang-token", token); // 로그인 성공 시 로컬 스토리지에 토큰 저장
                        localStorage.setItem("hoppang-login-oauthType", res.data.oauthType); // 로그인 타입 설정

                        if (res.data.isSuccess && res.data.isTheFirstLogIn) {
                            window.location.href = "/login/first?remainedProcess=false&userEmail=" + res.data.userEmail
                        }
                        return setIsLoading(false);

                    })
                    .catch((err) => {
                        alert(err.response.data.errorMessage);
                        if (err.response.data.errorCode === 7) { // 리프레시 토큰이 만료 되었을 때
                            window.location.href = err.response.data.redirectUrl; // 로그인 화면으로 리다이렉팅
                        }
                        return setIsLoading(false);
                    });
            }
        }
        setIsLoading(false);
    }, [oauthtype, urlParams.get('code')]);


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
            {isLoading && <OverlayLoadingPage/>}


            { ( !getStarted && !secondStep && !isAgreed ) &&
                <table>
                    <tbody>
                        <tr>
                            <td colSpan={2}>
                                <div style={{fontFamily: 'Cochin', color: 'grey', width: 500}}>
                                    안녕하세요, <strong style={{ color: '#444444'}}>호빵</strong>입니다.
                                    <br/><br/>

                                    전국 창호 가격의 기준을 세웁니다.<br/>
                                    더 이상 비싸게 고민하지 마세요!

                                    <br/><br/>
                                    <strong style={{ color: '#444444'}}>호</strong>구가 <strong style={{ color: '#444444'}}>빵</strong>명이 되는 그날까지.
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2}>
                                <div style={{ marginTop: '7%' }}>
                                    <Button
                                        onClick={handleGetStarted}
                                        size={"small"}
                                        style={{
                                            width: window.innerWidth > 768 ? '90%' : '55%',
                                            maxWidth: '400px',
                                            minWidth: '150px',
                                            padding: '10px 0',
                                            fontSize: '16px'
                                        }}
                                    >
                                        창호 견적 시작하기
                                    </Button>
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
                                        창호 금액의 기준을 제시합니다.
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
                    {/*<div style={{width: "700px"}}>*/}
                    {/*    <Steps*/}
                    {/*        current={current}*/}
                    {/*        size="small"*/}
                    {/*        items={[*/}
                    {/*            {*/}
                    {/*                title: '회사선택',*/}
                    {/*                description: companyType*/}
                    {/*            },*/}
                    {/*            {*/}
                    {/*                title: '창호 입력',*/}

                    {/*            },*/}
                    {/*            {*/}
                    {/*                title: '주소 입력',*/}
                    {/*            },*/}
                    {/*            {*/}
                    {/*                title: '기타 사항 입력',*/}
                    {/*            },*/}
                    {/*            {*/}
                    {/*                title: '계산시작',*/}
                    {/*            },*/}
                    {/*        ]}*/}
                    {/*    />*/}
                    {/*</div>*/}

                    <div style={{width: '700px'}}>
                        {/*뒤로가기*/}
                        <div onClick={handleBack} style={{color: "blue", marginRight: "80%", marginTop: '50px'}}>
                            <LeftOutlined/>
                        </div>
                        <table>
                            <tbody>
                                <tr>
                                    <td colSpan={2}>
                                        <div style={{
                                            position: 'relative',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            width: '100%',
                                            padding: '0 10px'
                                        }}>
                                            <Title
                                                level={2}
                                                style={{
                                                    margin: 0,
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    position: 'relative'
                                                }}
                                            >
                                                창호 회사 선택
                                            </Title>
                                        </div>
                                        <Divider
                                            style={{
                                                borderColor: '#a4a3a3',
                                                width: '100%',
                                                margin: '10px auto'
                                            }}
                                        />
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan={2}>
                                        <div style={{
                                            display: 'flex',
                                            flexDirection: window.innerWidth < 600 ? 'column' : 'row', // 화면 크기에 따라 가로/세로 변경
                                            gap: '10px',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            flexWrap: 'wrap',
                                            marginBottom: '10%'
                                        }}>
                                            {companyTypeOptionsString.map((option, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => handleSelect(option)}
                                                    style={{
                                                        width: '150px',
                                                        height: '50px',
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        border: '2px solid',
                                                        borderColor: selectedOption === option ? 'green' : '#ccc',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        transition: 'border-color 0.3s ease',
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


export default InitialScreen;
