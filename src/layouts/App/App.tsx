import React from 'react';
import loadable from "@loadable/component";
import { Switch, Route, Redirect } from 'react-router-dom';

const FirstScreen = loadable(() => import('../../pages/calculateChassis/first'));

const App = () => {
    return (
        <Switch>
            <Redirect exact path="/" to="/fir" />
            <Route path="/fir" component={FirstScreen} />
        </Switch>
    )
}

export default App;
