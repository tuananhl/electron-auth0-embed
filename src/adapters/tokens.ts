import { Adapter, ITokenResponse } from '../types';
import { context } from '../utils';

const epochSeconds = () => Date.now() / 1000;

const tokensAdapter: Adapter = () => {
  let tokenResponse: ITokenResponse | null = null;
  let expiredAt: number | null;

  return context('tokens', {
    async get() {
      return tokenResponse;
    },
    async set(value) {
      tokenResponse = value;
      expiredAt = epochSeconds() + value.expires_in;
    },
    async delete() {
      tokenResponse = null;
    },
    expiredIn: () => {
      if (expiredAt) return expiredAt - epochSeconds();
      return Infinity;
    }
  });
}

export default tokensAdapter;
