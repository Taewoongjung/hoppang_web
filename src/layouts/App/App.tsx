import React from 'react';
import loadable from "@loadable/component";
import { Switch, Route, Redirect } from 'react-router-dom';

const FirstScreen = loadable(() => import('../../pages/calculateChassis/First'));

// 어드민
const LoginPage = loadable(() => import('../../pages/admin/Login'));
const ManipulateDBPage = loadable(() => import('../../pages/admin/ManipulateDatabase'));

const App = () => {
    return (
        <Switch>
            <Redirect exact path="/" to="/chassis/calculator" />
            <Route path="/chassis/calculator" component={FirstScreen} />
            <Route path="/admin/login" component={LoginPage} />
            <Route path="/admin/essentials/info" component={ManipulateDBPage} />
        </Switch>
    )
}

export default App;
