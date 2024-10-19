import React from 'react';
import loadable from "@loadable/component";
import { Switch, Route, Redirect } from 'react-router-dom';

const CalculationScreen = loadable(() => import('../../pages/calculateChassis/CalculationScreen'));
const MyPage = loadable(() => import('../../pages/calculateChassis/MyPage'));
const LoginPage = loadable(() => import("../../pages/calculateChassis/Login"));
const LoginFirstStepPage = loadable(() => import("../../pages/calculateChassis/Login/LoginFirstStep"));
const LoginSecondStepPage = loadable(() => import("../../pages/calculateChassis/Login/LoginSecondStep"));
const MyPageConfigPage  = loadable(() => import('../../pages/calculateChassis/MyPage/ConfigPage'));
const DuplicatedSsoLoginErrorPage = loadable(() => import('../../pages/calculateChassis/Login/DuplicateLoginPage'));

// 어드민
const AdminLoginPage = loadable(() => import('../../pages/admin/Login'));
const ChassisPriceDatabaseMainScreen = loadable(() => import('../../pages/admin/ChassisPriceDatabaseMainScreen'));
const EstimatedDatabaseMainScreen = loadable(() => import('../../pages/admin/EstimatedDatabaseMainScreen'));

const App = () => {
    return (
        <Switch>
            <Redirect exact path="/" to="/chassis/calculator" />
            <Route path="/chassis/calculator" component={CalculationScreen} />
            <Route path="/:oauthtype/chassis/calculator" component={CalculationScreen} />

            <Route path="/mypage/config" component={MyPageConfigPage} />
            <Route path="/mypage" component={MyPage} />
            <Route path="/login/duplicate" component={DuplicatedSsoLoginErrorPage} />
            <Route path="/login/second" component={LoginSecondStepPage} />
            <Route path="/login/first" component={LoginFirstStepPage} />
            <Route path="/login" component={LoginPage} />

            {/* ADMIN */}
            <Route path="/admin/login" component={AdminLoginPage} />
            <Route path="/admin/essentials/info" component={ChassisPriceDatabaseMainScreen} />
            <Route path="/admin/essentials/estimates/info" component={EstimatedDatabaseMainScreen} />
        </Switch>
    )
}

export default App;
