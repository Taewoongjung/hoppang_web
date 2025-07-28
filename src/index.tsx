import React from 'react';
import { createRoot } from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import App from './layouts/App/App';
import { initializeMobileClientDetection } from './util';

initializeMobileClientDetection();

// @ts-ignore
createRoot(document.getElementById('app')).render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);
