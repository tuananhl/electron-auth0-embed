import got from 'got';
import { Adapter } from '../types';
import { context } from '../utils';

const authAPIAdapter: Adapter = (config) => {
  return context('authAPI', {
    exchangeAuthCode: (authCode, pair) => got.post(`https://${config.auth0.domain}/oauth/token`, {
      json: {
        grant_type: 'authorization_code',
        client_id: config.auth0.clientId,
        code_verifier: pair.verifier,
        code: authCode,
        redirect_uri: `https://${config.auth0.domain}/result`
      }
    }).json(),
    getProfile: (accessToken) => got(`https://${config.auth0.domain}/userinfo`, { headers: { 'Authorization': `Bearer ${accessToken}` } }).json()
  })
};


export default authAPIAdapter;
