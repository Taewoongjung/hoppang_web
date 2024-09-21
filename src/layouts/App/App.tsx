import React from 'react';
import loadable from "@loadable/component";
import { Switch, Route, Redirect } from 'react-router-dom';

const FirstScreen = loadable(() => import('../../pages/calculateChassis/First'));

// 어드민
const LoginPage = loadable(() => import('../../pages/admin/Login'));
const ChassisPriceDatabaseMainScreen = loadable(() => import('../../pages/admin/ChassisPriceDatabaseMainScreen'));
const EstimatedDatabaseMainScreen = loadable(() => import('../../pages/admin/EstimatedDatabaseMainScreen'));

const App = () => {
    return (
        <Switch>
            <Redirect exact path="/" to="/chassis/calculator" />
            <Route path="/chassis/calculator" component={FirstScreen} />
            <Route path="/admin/login" component={LoginPage} />
            <Route path="/admin/essentials/info" component={ChassisPriceDatabaseMainScreen} />
            <Route path="/admin/essentials/estimates/info" component={EstimatedDatabaseMainScreen} />
        </Switch>
    )
}

export default App;
