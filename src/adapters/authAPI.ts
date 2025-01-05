import { Adapter } from '../types';
import { context } from '../utils';

const authAPIAdapter: Adapter = (config) => {
  return context('authAPI', {
    exchangeAuthCode: (authCode, pair) => {
      return fetch(`https://${config.auth0.domain}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: config.auth0.clientId,
          code_verifier: pair.verifier,
          code: authCode,
          redirect_uri: `https://${config.auth0.domain}/mobile`
        }),
      }).then((response: Response) => response.json());
    },
    getProfile: (accessToken) => fetch(`https://${config.auth0.domain}/userinfo`, { headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json', } }).then((response) => response.json())
  })
};


export default authAPIAdapter;
