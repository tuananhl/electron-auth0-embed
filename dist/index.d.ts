type IProfile = {
    sub: string;
    nickname: string;
    name: string;
    picture: string | null;
    updated_at: string;
    email: string;
    email_verified: boolean;
};
interface IConfig {
    debug?: boolean;
    auth0: {
        audience: string;
        clientId: string;
        domain: string;
        scopes: string;
    };
    login?: {
        windowConfig?: object;
        authorizeParams?: object;
    };
    logout?: {
        windowConfig?: object;
    };
}

declare function authConfig(config: IConfig): {
    getToken: () => Promise<string>;
    getProfile: () => Promise<IProfile>;
    login: () => Promise<string>;
    logout: () => Promise<void>;
};

export { authConfig as default };
