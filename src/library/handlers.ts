import { IContext, IProfile } from '../types';

async function login(ctx: IContext): Promise<string> {
  /**
   * generate pair
   * get authorize code
   * get exchange access token by auth code
   * set token to cache
   * return token;
   */
  const {
    cryptography,
    authWindow,
    authAPI,
    tokens,
  } = ctx;
  const pair = cryptography.getPKCEChallengePair();
  const authCode = await authWindow.login(pair);
  const token = await authAPI.exchangeAuthCode(authCode, pair);
  tokens.set(token);
  return token.access_token;
}

async function getToken(ctx: IContext): Promise<string> {
  const { tokens } = ctx;

  const token = await tokens.get();
  if (token && tokens.expiredIn() > 60) {
    return token.access_token;
  }
  
  return login(ctx);
}

async function logout(ctx: IContext): Promise<void> {
  const {
    authWindow: { logout },
    tokens,
  } = ctx;

  await Promise.all([tokens.delete(), logout()]);
}

async function getProfile(ctx: IContext): Promise<IProfile | null> {
  const {
    tokens,
    authAPI,
  } = ctx;

  const token = await tokens.get();
  if (!token) return null;
  return authAPI.getProfile(token.access_token);
}

export {
  login,
  logout,
  getToken,
  getProfile,
};
