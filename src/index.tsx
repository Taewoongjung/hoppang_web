import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import App from './layouts/App/App';
import { initializeMobileClientDetection } from './util';

initializeMobileClientDetection();

const rootElement = document.getElementById('app');

const app = (
    <BrowserRouter>
        <App />
    </BrowserRouter>
);

// react-snap으로 pre-render된 HTML이 있는지 확인
if (rootElement && rootElement.hasChildNodes()) {
    // Pre-rendered HTML이 있으면 hydrate
    hydrateRoot(rootElement, app);
} else if (rootElement) {
    // 일반적인 경우 render
    createRoot(rootElement).render(app);
}