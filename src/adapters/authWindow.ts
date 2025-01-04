import { BrowserWindow, BrowserWindowConstructorOptions } from 'electron';
import qs from 'qs';
import url from 'url';
import { Adapter } from '../types';
import { context } from '../utils';

const authWindowAdapter: Adapter = (config) => {
  const baseWindowConfig: BrowserWindowConstructorOptions = {
    width: 800,
    height: 800,
    alwaysOnTop: true,
  };

  return context('authWindow', {
    login: async (pair) => {
      return new Promise((resolve, reject) => {
        const auth0AuthorizeURL = `https://${config.auth0.domain}/authorize?` + qs.stringify({
          audience: config.auth0.audience,
          scope: config.auth0.scopes,
          response_type: 'code',
          client_id: config.auth0.clientId,
          code_challenge: pair.challenge,
          code_challenge_method: 'S256',
          redirect_uri: `https://${config.auth0.domain}/result`,
          ...config.login?.authorizeParams
        });
        const loginWindow = new BrowserWindow({
          ...baseWindowConfig,
          title: 'Login',
          ...config.login?.windowConfig,
        });

        loginWindow.webContents.on('did-navigate', (event, href) => {
          const location = url.parse(href);
          if (location.pathname == '/result') {
            const query = qs.parse(location.search || '', {ignoreQueryPrefix: true});
            resolve(query.code);
            loginWindow.destroy();
          }
        });

        loginWindow.on('close', () => {
          reject('Auth flow is rejected');
        });

        loginWindow.loadURL(auth0AuthorizeURL);
      });
    },
    logout: async () => {
      return new Promise((resolve, reject) => {
        let timeoutRef: NodeJS.Timeout | null = null;
        const logoutWindow = new BrowserWindow({
          ...baseWindowConfig,
          title: 'Log out',
          skipTaskbar: true,
          show: false,
          frame: false,
          ...config.logout?.windowConfig,
        });

        logoutWindow.webContents.on('did-navigate', () => {
          logoutWindow.destroy();
          if (timeoutRef) {
            clearTimeout(timeoutRef)
          }
          resolve();
        });

        logoutWindow.loadURL(`https://${config.auth0.domain}/v2/logout`);
        timeoutRef = setTimeout(() => {
          reject(new Error('Logout time out'))
        }, 60 * 1_000);
      });
    }
  })
}

export default authWindowAdapter;
