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

// data-reactroot 속성이나 HTML 내용으로 확인
const isPrerendered =
    rootElement?.hasAttribute('data-reactroot') ||
    // @ts-ignore
    rootElement?.innerHTML.length > 0;

if (rootElement && isPrerendered) {
    hydrateRoot(rootElement, app);
} else if (rootElement) {
    createRoot(rootElement).render(app);
}