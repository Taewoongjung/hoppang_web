import React from 'react';
import loadable from "@loadable/component";
import { Switch, Route, Redirect } from 'react-router-dom';

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


const App = () => {
        return (
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
        );
}

export default App;
