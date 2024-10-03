import React from 'react';
import loadable from "@loadable/component";
import { Switch, Route, Redirect } from 'react-router-dom';

const LoginPage = loadable(() => import("../../pages/calculateChassis/Login"))
const CalculationScreen = loadable(() => import('../../pages/calculateChassis/CalculationScreen'));

// 어드민
const AdminLoginPage = loadable(() => import('../../pages/admin/Login'));
const ChassisPriceDatabaseMainScreen = loadable(() => import('../../pages/admin/ChassisPriceDatabaseMainScreen'));
const EstimatedDatabaseMainScreen = loadable(() => import('../../pages/admin/EstimatedDatabaseMainScreen'));

const App = () => {
    return (
        <Switch>
            <Redirect exact path="/" to="/chassis/calculator" />
            <Route path="/login" component={LoginPage} />
            <Route path="/chassis/calculator" component={CalculationScreen} />

            {/* ADMIN */}
            <Route path="/admin/login" component={AdminLoginPage} />
            <Route path="/admin/essentials/info" component={ChassisPriceDatabaseMainScreen} />
            <Route path="/admin/essentials/estimates/info" component={EstimatedDatabaseMainScreen} />
        </Switch>
    )
}

export default App;
