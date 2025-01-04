export type PKCEPair = {
  verifier: string,
  challenge: string
}

export type IProfile = {
  sub: string;
  nickname: string;
  name: string;
  picture: string | null;
  updated_at: string;
  email: string;
  email_verified: boolean;
}

export type ITokenResponse = {
  access_token: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
  token_type: string;
}

export type IContext = {
  authWindow: {
    login: (pair: PKCEPair) => Promise<string>;
    logout: () => Promise<void>;
  };
  cryptography: {
    getPKCEChallengePair: () => PKCEPair;
  };
  tokens: IStore<ITokenResponse> & {
    expiredIn: () => number;
  };
  authAPI: {
    exchangeAuthCode: (authCode: string, pair: PKCEPair) => Promise<ITokenResponse>;
    getProfile: (accessToken: string) => Promise<IProfile | null>;
  };
}

export type Adapter = (config: IConfig) => Partial<IContext>;

export type IOperation<I, O> = (ctx: IContext, input: I) => O;

export interface IStore<T> {
  delete: () => Promise<void>;
  get: () => Promise<T | null>;
  set: (value: T) => void;
}

export interface IConfig {
  debug?: boolean;
  auth0: {
    audience: string;
    clientId: string;
    domain: string;
    scopes: string;
  };
  login?: {
    // Properties for the Electron BrowserWindow used during login
    windowConfig?: object,
    // Additional query params sent on the /authorize request - consult Auth0 documentation
    authorizeParams?: object
  },

  // Customise the logout
  logout?: {
    windowConfig?: object
  },
}