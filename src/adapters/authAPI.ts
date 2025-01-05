import { Adapter } from '../types';
import { context } from '../utils';

const authAPIAdapter: Adapter = (config) => {
  return context('authAPI', {
    exchangeAuthCode: (authCode, pair) => fetch(`https://${config.auth0.domain}/oauth/token`, {
      method: 'POST',
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: config.auth0.clientId,
        code_verifier: pair.verifier,
        code: authCode,
        redirect_uri: `https://${config.auth0.domain}/result`
      }),
    }).then((response: Response) => response.json()),
    getProfile: (accessToken) => fetch(`https://${config.auth0.domain}/userinfo`, { headers: { 'Authorization': `Bearer ${accessToken}` } }).then((response) => response.json())
  })
};


export default authAPIAdapter;
