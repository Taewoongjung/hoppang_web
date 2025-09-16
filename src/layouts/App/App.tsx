import React from 'react';
import loadable from "@loadable/component";
import { Switch, Route, Redirect } from 'react-router-dom';

// const CalculationInitialScreen = loadable(() => import('../../pages/hoppangMainStream/InitialScreen'));
// const CalculationScreen = loadable(() => import('../../pages/hoppangMainStream/CalculationScreen'));
// const MyPage = loadable(() => import('../../pages/hoppangMainStream/MyPage'));
// const LoginPage = loadable(() => import("../../pages/hoppangMainStream/Login"));
// const LoginFirstStepPage = loadable(() => import("../../pages/hoppangMainStream/Login/LoginFirstStep"));
// const LoginSecondStepPage = loadable(() => import("../../pages/hoppangMainStream/Login/LoginSecondStep"));
// const MyPageConfigPage  = loadable(() => import('../../pages/hoppangMainStream/MyPage/ConfigPage'));
// const MyPageAppConfigPage  = loadable(() => import('../../pages/hoppangMainStream/MyPage/ConfigPage/AppConfigPage'));
// const MyPageEstimationHistoriesPage = loadable(() => import('../../pages/hoppangMainStream/MyPage/EstimationHistory'));
// const EstimationDetailPage = loadable(() => import('../../pages/hoppangMainStream/MyPage/EstimationDetailPage'));
// const DuplicatedSsoLoginErrorPage = loadable(() => import('../../pages/hoppangMainStream/Login/DuplicateLoginPage'));
// const CounselMainScreen = loadable(() => import('../../pages/hoppangMainStream/Counsel'));

// 어드민
const AdminLoginPage = loadable(() => import('../../pages/admin/Login'));
const ChassisPriceDatabaseMainScreen = loadable(() => import('../../pages/admin/ChassisPriceDatabaseMainScreen'));
const EstimatedDatabaseMainScreen = loadable(() => import('../../pages/admin/EstimatedDatabaseMainScreen'));
const StatisticsMainScreen = loadable(() => import('../../pages/admin/StatisticsMainScreen'));
const AdvertisementMainScreen = loadable(() => import('../../pages/admin/AdvertisementMainScreen'));

// 랜딩 페이지
const LandingPage = loadable(() => import('../../pages/landingPage'));

// V2 버전
const InitialPageV2 = loadable(() => import('../../pages/mobile/initial'));
const AgreementPage = loadable(() => import('../../pages/mobile/agreement'));
const CalculationScreenV2 = loadable(() => import('../../pages/mobile/calculation'));
const CalculationResultScreen = loadable(() => import('../../pages/mobile/result'));
const LoginPageV2 = loadable(() => import('../../pages/mobile/Login'));
const LoginFirstStepPageV2 = loadable(() => import('../../pages/mobile/LoginFirstStep'));
const LoginSecondStepPageV2 = loadable(() => import('../../pages/mobile/LoginSecondStep'));

const PrivacyPolicyPage = loadable(() => import('../../pages/mobile/Policy/PrivacyPolicy'));

const MyPageEstimationDetailPageV2 = loadable(() => import('../../pages/mobile/MyPage/EstimationDetail'));
const MyPageEstimationHistoriesPageV2 = loadable(() => import('../../pages/mobile/MyPage/EstimationHistory'));
const AppConfigPageV2 = loadable(() => import('../../pages/mobile/MyPage/AppConfig'));
const UserConfigPageV2 = loadable(() => import('../../pages/mobile/MyPage/UserConfig'));
const ProfilePage = loadable(() => import('../../pages/mobile/MyPage/ProfileDetail'));
const MyPageV2 = loadable(() => import('../../pages/mobile/MyPage'));

const QuestionBoardPage = loadable(() => import('../../pages/mobile/Question/Board'));
const QuestionBoardPostPage = loadable(() => import('../../pages/mobile/Question/Post'));
const QuestionRegisterFormPage = loadable(() => import('../../pages/mobile/Question/RegisterForm'));
const MyPostsPage = loadable(() => import('../../pages/mobile/Question/MyPosts'));

const CounselV2 = loadable(() => import('../../pages/mobile/Counsel'));


const App = () => {
        return (
            <Switch>
                    <Redirect exact path="/" to="/chassis/calculator"/>

                    {/* V2 */}
                    <Route path="/chassis/calculator" component={InitialPageV2}/>
                    <Route path="/:oauthtype/chassis/calculator" component={InitialPageV2}/>
                    <Route exact path="/calculator/agreement" component={AgreementPage}/>
                    <Route exact path="/v2/calculator" component={CalculationScreenV2}/>
                    <Route exact path="/calculator/result" component={CalculationResultScreen}/>

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

                    <Route exact path="/policy/privacy" component={PrivacyPolicyPage}/>

                    {/* ADMIN */}
                    <Route path="/admin/login" component={AdminLoginPage}/>
                    <Route path="/admin/essentials/info" component={ChassisPriceDatabaseMainScreen}/>
                    <Route path="/admin/essentials/estimates/info" component={EstimatedDatabaseMainScreen}/>
                    <Route path="/admin/statistics" component={StatisticsMainScreen}/>
                    <Route path="/admin/advertisement" component={AdvertisementMainScreen}/>

                    {/* OFFICIAL */}
                    <Route path="/official" component={LandingPage}/>

                    {/* V1 */}
                    {/*<Route path="/chassis/calculator" component={CalculationInitialScreen}/>*/}
                    {/*<Route path="/:oauthtype/chassis/calculator" component={CalculationInitialScreen}/>*/}
                    {/*<Route path="/chassis/estimation/calculator/" component={CalculationScreen}/>*/}

                    {/*<Route path="/mypage/config/app" component={MyPageAppConfigPage}/>*/}
                    {/*<Route path="/mypage/config" component={MyPageConfigPage}/>*/}
                    {/*<Route path="/mypage/estimation/histories" component={MyPageEstimationHistoriesPage}/>*/}
                    {/*<Route path="/mypage/estimation/:estimationId" component={EstimationDetailPage}/>*/}
                    {/*<Route path="/mypage" component={MyPage}/>*/}
                    {/*<Route path="/counsel" component={CounselMainScreen}/>*/}

                    {/*<Route path="/login/duplicate" component={DuplicatedSsoLoginErrorPage}/>*/}
                    {/*<Route path="/login/second" component={LoginSecondStepPage}/>*/}
                    {/*<Route path="/login/first" component={LoginFirstStepPage}/>*/}
                    {/*<Route path="/login" component={LoginPage}/>*/}
            </Switch>
        );
}

export default App;
