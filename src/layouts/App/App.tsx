import React from 'react';
import loadable from "@loadable/component";
import { Switch, Route, Redirect } from 'react-router-dom';

const MAINTENANCE_MODE_ENABLED = false;
const KAKAO_INQUIRY_URL = 'https://pf.kakao.com/_dbxezn';
const KAKAO_APP_INQUIRY_URL = 'kakaotalk://plusfriend/chat/_dbxezn';

// 어드민
const AdminLoginPage = loadable(() => import('../../pages/admin/Login'));
const ChassisPriceDatabaseMainScreen = loadable(() => import('../../pages/admin/ChassisPriceDatabaseMainScreen'));
const EstimatedDatabaseMainScreen = loadable(() => import('../../pages/admin/EstimatedDatabaseMainScreen'));
const StatisticsMainScreen = loadable(() => import('../../pages/admin/StatisticsMainScreen'));
const AdvertisementMainScreen = loadable(() => import('../../pages/admin/AdvertisementMainScreen'));

// 랜딩 페이지
const LandingPage = loadable(() => import('../../pages/landingPage'));

// 서비스
const InitialPageV2 = loadable(() => import('../../pages/main/Initial'));
const LoginPageV2 = loadable(() => import('../../pages/main/Login'));
const LoginFirstStepPageV2 = loadable(() => import('../../pages/main/LoginFirstStep'));
const LoginSecondStepPageV2 = loadable(() => import('../../pages/main/LoginSecondStep'));

const DetailCalculationAgreementPage = loadable(() => import('../../pages/main/agreement/DetailCalculation'));
const SimpleCalculationAgreementPage = loadable(() => import('../../pages/main/agreement/SimpleCalculation'));
const CalculationScreenV2 = loadable(() => import('../../pages/main/DetailCalculation'));
const CalculationResultScreen = loadable(() => import('../../pages/main/result'));
const CalculationInitial = loadable(() => import('../../pages/main/CalculatorInitial'));
const FastCalculationStep0 = loadable(() => import('../../pages/main/FastCalculation/Step0'));
const FastCalculationStep1 = loadable(() => import('../../pages/main/FastCalculation/Step1'));
const FastCalculationStep2 = loadable(() => import('../../pages/main/FastCalculation/Step2'));
const FastCalculationStep3 = loadable(() => import('../../pages/main/FastCalculation/Step3'));
const FastCalculationStep4 = loadable(() => import('../../pages/main/FastCalculation/Step4'));
const FastCalculationStep5 = loadable(() => import('../../pages/main/FastCalculation/Step5'));

const PrivacyPolicyPage = loadable(() => import('../../pages/main/Policy/PrivacyPolicy'));
const TermOfUsePage = loadable(() => import('../../pages/main/Policy/TermOfUse'));

const MyPageEstimationDetailPageV2 = loadable(() => import('../../pages/main/MyPage/EstimationDetail'));
const MyPageEstimationHistoriesPageV2 = loadable(() => import('../../pages/main/MyPage/EstimationHistory'));
const AppConfigPageV2 = loadable(() => import('../../pages/main/MyPage/AppConfig'));
const UserConfigPageV2 = loadable(() => import('../../pages/main/MyPage/UserConfig'));
const ProfilePage = loadable(() => import('../../pages/main/MyPage/ProfileDetail'));
const MyPageV2 = loadable(() => import('../../pages/main/MyPage'));

const QuestionBoardPage = loadable(() => import('../../pages/main/Question/Board'));
const QuestionBoardPostPage = loadable(() => import('../../pages/main/Question/Post'));
const QuestionRegisterFormPage = loadable(() => import('../../pages/main/Question/RegisterForm'));
const MyPostsPage = loadable(() => import('../../pages/main/Question/MyPosts'));

const CounselV2 = loadable(() => import('../../pages/main/Counsel'));

const HowToChooseChassisTypeGuide = loadable(() => import('../../pages/main/Guide/HowToChooseChassisType'));
const HoppangProcessGuide = loadable(() => import('../../pages/main/Guide/HoppangProcess'));
const ChassisPerformanceGuide = loadable(() => import('../../pages/main/Guide/ChassisPerformance'));
const DeepLink = loadable(() => import('../../pages/main/DeepLink'));


const App = () => {
        const handleKakaoInquiry = () => {
            const userAgent = navigator.userAgent.toLowerCase();
            const isIOS = userAgent.includes('iphone') || userAgent.includes('ipad');

            if (isIOS) {
                window.location.href = KAKAO_APP_INQUIRY_URL;
                return;
            }

            window.open(KAKAO_INQUIRY_URL, '_blank');
        };

        return (
            <>
            <Switch>
                    <Redirect exact path="/" to="/chassis/calculator"/>
                    <Route path="/chassis/calculator" component={InitialPageV2}/>
                    <Route path="/:oauthtype/chassis/calculator" component={InitialPageV2}/>

                    <Route exact path="/calculator" component={CalculationInitial}/>
                    <Route exact path="/v2/calculator" component={CalculationScreenV2}/>
                    <Route exact path="/calculator/detail/agreement" component={DetailCalculationAgreementPage}/>
                    <Route exact path="/calculator/simple/agreement" component={SimpleCalculationAgreementPage}/>
                    <Route exact path="/calculator/result" component={CalculationResultScreen}/>
                    <Route exact path="/calculator/simple/step0" component={FastCalculationStep0}/>
                    <Route exact path="/calculator/simple/step1" component={FastCalculationStep1}/>
                    <Route exact path="/calculator/simple/step2" component={FastCalculationStep2}/>
                    <Route exact path="/calculator/simple/step3" component={FastCalculationStep3}/>
                    <Route exact path="/calculator/simple/step4" component={FastCalculationStep4}/>
                    <Route exact path="/calculator/simple/step5" component={FastCalculationStep5}/>

                    <Route exact path="/question/boards/posts/register" component={QuestionRegisterFormPage}/>
                    <Route exact path="/question/boards/posts/:postId" component={QuestionBoardPostPage}/>
                    <Route exact path="/question/my/boards" component={MyPostsPage}/>
                    <Route exact path="/question/boards" component={QuestionBoardPage}/>

                    <Route exact path="/v2/mypage/estimation/histories" component={MyPageEstimationHistoriesPageV2}/>
                    <Route exact path="/v2/mypage/estimation/:estimationId" component={MyPageEstimationDetailPageV2}/>
                    <Route exact path="/v2/mypage/appconfig" component={AppConfigPageV2}/>
                    <Route exact path="/v2/mypage/userconfig" component={UserConfigPageV2}/>
                    <Route exact path="/v2/mypage/profile" component={ProfilePage}/>
                    <Route exact path="/v2/mypage" component={MyPageV2}/>
                    <Route exact path="/v2/counsel" component={CounselV2}/>

                    <Route exact path="/v2/login/second" component={LoginSecondStepPageV2}/>
                    <Route exact path="/v2/login/first" component={LoginFirstStepPageV2}/>
                    <Route exact path="/v2/login" component={LoginPageV2}/>

                    <Route exact path="/v2/guide/howtochoosechassistype" component={HowToChooseChassisTypeGuide}/>
                    <Route exact path="/v2/guide/hoppangprocess" component={HoppangProcessGuide}/>
                    <Route exact path="/v2/guide/chassisperformance" component={ChassisPerformanceGuide}/>

                    {/* 딥링크 */}
                    <Route exact path="/open" component={DeepLink}/>

                    <Route exact path="/policy/privacy" component={PrivacyPolicyPage}/>
                    <Route exact path="/policy/termofuse" component={TermOfUsePage}/>

                    {/* ADMIN */}
                    <Route path="/admin/login" component={AdminLoginPage}/>
                    <Route path="/admin/essentials/info" component={ChassisPriceDatabaseMainScreen}/>
                    <Route path="/admin/essentials/estimates/info" component={EstimatedDatabaseMainScreen}/>
                    <Route path="/admin/statistics" component={StatisticsMainScreen}/>
                    <Route path="/admin/advertisement" component={AdvertisementMainScreen}/>

                    {/* OFFICIAL */}
                    <Route path="/official" component={LandingPage}/>
            </Switch>
            {MAINTENANCE_MODE_ENABLED && (
                <div style={styles.overlay}>
                    <div style={styles.modal}>
                        <div style={styles.icon}>🔧</div>
                        <h2 style={styles.title}>서버 점검 중입니다</h2>
                        <p style={styles.description}>
                            더 나은 서비스를 위해 현재 서버 점검을 진행하고 있습니다.
                            <br />
                            점검이 끝난 뒤 다시 이용 부탁드립니다.
                        </p>
                        <p style={styles.inquiryText}>
                            문의가 필요하시면 카카오톡으로 문의하실 수 있습니다.
                        </p>
                        <button
                            type="button"
                            style={styles.kakaoButton}
                            onClick={handleKakaoInquiry}
                        >
                            카카오톡 문의하기
                        </button>
                    </div>
                </div>
            )}
            </>
        );
}

const styles: Record<string, React.CSSProperties> = {
    overlay: {
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: 'rgba(15, 23, 42, 0.78)',
    },
    modal: {
        width: '100%',
        maxWidth: '420px',
        borderRadius: '24px',
        backgroundColor: '#ffffff',
        boxShadow: '0 24px 64px rgba(15, 23, 42, 0.28)',
        padding: '32px 24px',
        textAlign: 'center',
    },
    icon: {
        fontSize: '44px',
        marginBottom: '16px',
    },
    title: {
        margin: '0 0 12px',
        fontSize: '28px',
        fontWeight: 700,
        color: '#111827',
    },
    description: {
        margin: '0 0 16px',
        fontSize: '16px',
        lineHeight: 1.7,
        color: '#4b5563',
    },
    inquiryText: {
        margin: '0 0 20px',
        fontSize: '15px',
        lineHeight: 1.6,
        color: '#6b7280',
    },
    kakaoButton: {
        width: '100%',
        border: 'none',
        borderRadius: '14px',
        backgroundColor: '#FEE500',
        color: '#3C1E1E',
        padding: '15px 16px',
        fontSize: '16px',
        fontWeight: 700,
        cursor: 'pointer',
    },
};

export default App;
