declare global {
    interface Window {
        Kakao: KakaoSDK;
    }
}

    interface KakaoSDK {
        init: (appKey: string): void;
        Share: {
            sendDefault: (params: KakaoShareParams): void;
        }
    }

    interface KakaoShareParams {
        objectType: string;
        content: {
            title: string;
            description: string;
            imageUrl: string;
            link: KakaoShareLink;
        };
        buttons?: KakaoShareButton[];
    }

    interface KakaoShareLink {
        mobileWebUrl: string;
        webUrl: string;
        androidExecutionParams?: string;
        iosExecutionParams?: string;
    }

    interface KakaoShareButton {
        title: string;
        link: KakaoShareLink;
    }
