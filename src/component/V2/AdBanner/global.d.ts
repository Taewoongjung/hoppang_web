// Global type declarations
declare global {
    interface Window {
        adsbygoogle: any[];
        gtag?: (command: string, targetId: string, config?: Record<string, any>) => void;
    }
}

export {};
