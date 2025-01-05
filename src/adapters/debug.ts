import { Adapter } from '../types';
import { context } from '../utils';

const debugAdapter: Adapter = (config) => {
  return context('debug', {
    log(...data: any[]) {
      if (config.debug) {
        console.log(...data);
      }
    }
  })
}

export default debugAdapter;
