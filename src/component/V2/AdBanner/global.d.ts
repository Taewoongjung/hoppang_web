// Global type declarations
declare global {
    interface Window {
        adsbygoogle: any[];
        gtag?: (command: string, targetIdOrParams: string | Record<string, any>, config?: Record<string, any>) => void;
    }
}

export {};
