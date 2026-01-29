import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import {BrowserRouter} from 'react-router-dom';
import App from './layouts/App/App';
import { initializeMobileClientDetection } from './util';
import {HelmetProvider} from "react-helmet-async";

initializeMobileClientDetection();

const rootElement = document.getElementById('app');

const app = (
    <HelmetProvider>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </HelmetProvider>
);

// 실제 HTML 내용이 있는 경우에만 pre-rendered로 간주
const isPrerendered =
    // @ts-ignore
    rootElement?.innerHTML.trim().length > 0;

if (rootElement && isPrerendered) {
    hydrateRoot(rootElement, app);
} else if (rootElement) {
    createRoot(rootElement).render(app);
}
