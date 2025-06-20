import React from 'react';
import loadable from "@loadable/component";
import { Switch, Route, Redirect } from 'react-router-dom';

const CalculationInitialScreen = loadable(() => import('../../pages/hoppangMainStream/InitialScreen'));
const CalculationScreen = loadable(() => import('../../pages/hoppangMainStream/CalculationScreen'));
const MyPage = loadable(() => import('../../pages/hoppangMainStream/MyPage'));
const LoginPage = loadable(() => import("../../pages/hoppangMainStream/Login"));
const LoginFirstStepPage = loadable(() => import("../../pages/hoppangMainStream/Login/LoginFirstStep"));
const LoginSecondStepPage = loadable(() => import("../../pages/hoppangMainStream/Login/LoginSecondStep"));
const MyPageConfigPage  = loadable(() => import('../../pages/hoppangMainStream/MyPage/ConfigPage'));
const MyPageAppConfigPage  = loadable(() => import('../../pages/hoppangMainStream/MyPage/ConfigPage/AppConfigPage'));
const MyPageEstimationHistoriesPage = loadable(() => import('../../pages/hoppangMainStream/MyPage/EstimationHistory'));
const EstimationDetailPage = loadable(() => import('../../pages/hoppangMainStream/MyPage/EstimationDetailPage'));
const DuplicatedSsoLoginErrorPage = loadable(() => import('../../pages/hoppangMainStream/Login/DuplicateLoginPage'));
const CounselMainScreen = loadable(() => import('../../pages/hoppangMainStream/Counsel'));

// 어드민
const AdminLoginPage = loadable(() => import('../../pages/admin/Login'));
const ChassisPriceDatabaseMainScreen = loadable(() => import('../../pages/admin/ChassisPriceDatabaseMainScreen'));
const EstimatedDatabaseMainScreen = loadable(() => import('../../pages/admin/EstimatedDatabaseMainScreen'));
const StatisticsMainScreen = loadable(() => import('../../pages/admin/StatisticsMainScreen'));
const AdvertisementMainScreen = loadable(() => import('../../pages/admin/AdvertisementMainScreen'));

// 랜딩 페이지
const LandingPage = loadable(() => import('../../pages/landingPage'));


const App = () => {
        return (
            <Switch>
                    <Redirect exact path="/" to="/chassis/calculator"/>
                    <Route path="/chassis/calculator" component={CalculationInitialScreen}/>
                    <Route path="/:oauthtype/chassis/calculator" component={CalculationInitialScreen}/>
                    <Route path="/chassis/estimation/calculator/" component={CalculationScreen}/>

                    <Route path="/mypage/config/app" component={MyPageAppConfigPage}/>
                    <Route path="/mypage/config" component={MyPageConfigPage}/>
                    <Route path="/mypage/estimation/histories" component={MyPageEstimationHistoriesPage}/>
                    <Route path="/mypage/estimation/:estimationId" component={EstimationDetailPage}/>
                    <Route path="/mypage" component={MyPage}/>
                    <Route path="/counsel" component={CounselMainScreen}/>

                    <Route path="/login/duplicate" component={DuplicatedSsoLoginErrorPage}/>
                    <Route path="/login/second" component={LoginSecondStepPage}/>
                    <Route path="/login/first" component={LoginFirstStepPage}/>
                    <Route path="/login" component={LoginPage}/>

                    {/* ADMIN */}
                    <Route path="/admin/login" component={AdminLoginPage}/>
                    <Route path="/admin/essentials/info" component={ChassisPriceDatabaseMainScreen}/>
                    <Route path="/admin/essentials/estimates/info" component={EstimatedDatabaseMainScreen}/>
                    <Route path="/admin/statistics" component={StatisticsMainScreen}/>
                    <Route path="/admin/advertisement" component={AdvertisementMainScreen}/>

                    {/*OFFICIAL*/}
                    <Route path="/official" component={LandingPage}/>

            </Switch>
        );
}

export default App;
