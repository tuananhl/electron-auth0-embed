import { Adapter, IConfig } from '../types';
import { $applyContext } from '../utils';
import { IContext } from '../types';
import { getToken, getProfile, login, logout } from './handlers';
  
function initLibrary(adapter: Adapter, config: IConfig) {
  const applyContext = $applyContext(adapter(config) as IContext);

  return {
    getToken: applyContext(getToken),
    getProfile: applyContext(getProfile),
    login: applyContext(login),
    logout: applyContext(logout),
  };
}

export default initLibrary;
