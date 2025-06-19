import React, {useEffect} from 'react';
import '../styles.css';
import './styles.css';
import BottomNavigator from "../../../component/BottomNavigator";
import useSWR from "swr";
import {callMeData} from "../../../definition/apiPath";
import fetcher from "../../../util/fetcher";
import {isMobile} from "react-device-detect";

const useResponsiveStyles = () => {

    const styles: { [key: string]: React.CSSProperties } = {
        container: {
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fff',
            width: '100%',
            height: '100vh',
        },
        box: {
            borderRadius: '15px',
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: '700px',
            padding: '60px',
        }
    }

    return styles;
}


const Counsel = () => {

    const styles = useResponsiveStyles();

    useEffect(() => {
        let referrer = document.referrer;
        let isFromSearchEngine =
            referrer.includes("google.") ||
            referrer.includes("naver.") ||
            referrer.includes("daum.") ||
            referrer.includes("bing.") ||
            referrer.includes("search.yahoo.") ||
            referrer.includes("instagram.com") ||
            referrer.includes("facebook.com") ||
            referrer.includes("youtube.com");

        if (!isMobile || isFromSearchEngine) {
            window.location.href = "https://hoppang.store/official?adv_id=329263e0-5d61-4ade-baf9-7e34cc611828";
        }
    }, []);

    const { data: userData, error, mutate } = useSWR(callMeData, fetcher, {
        dedupingInterval: 2000
    });

    const chassisEstimatedHistories = () => {

        if (userData) {
            window.location.href = "/mypage/estimation/histories";
        } else {
            window.location.href = "/login";
        }
    }

    const directInquiry = () => {
        const kakaoWebLink = 'https://pf.kakao.com/_dbxezn/chat';
        const kakaoAppLink = 'kakaotalk://plusfriend/chat/_dbxezn';
        const userAgent = navigator.userAgent.toLowerCase();

        if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
            setTimeout(() => {
                window.location.href = kakaoWebLink;
            }, 500);
            window.location.href = kakaoAppLink;
        } else {
            window.open(kakaoWebLink, '_blank');
        }
    }


    return (
        <>
            <div style={styles.container}>
                <div style={styles.box}>
                    <h2 style={{ textAlign: 'center', fontSize: '24px', fontWeight: '700', marginBottom: '20px', color: '#333' }}>
                        샷시 상담 시작하기
                    </h2>
                    <p className="question-text">호빵에서 샷시 견적 받아보신 적 있으신가요?</p>
                    <p className="sub-text">
                        기존 견적이 있다면 더 빠르고 정확하게 상담해드릴게요 😊<br />
                        없으셔도 바로 상담 가능하니 걱정 마세요!
                    </p>
                    <div className="choice-buttons">
                        <button
                            className="choice-button yes"
                            onClick={chassisEstimatedHistories}
                        >
                            ✔️ 받은 견적으로 상담하기
                        </button>
                        <button
                            className="choice-button no"
                            onClick={directInquiry}
                        >
                            🙋🏻‍♂ 바로 상담하기
                        </button>
                    </div>
                </div>
                <BottomNavigator/>
            </div>
        </>
    )
}

export default Counsel;
