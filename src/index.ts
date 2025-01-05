import authWindowAdapter from './adapters/authWindow';
import cryptographyAdapter from './adapters/cryptography';
import tokensAdapter from './adapters/tokens';
import authAPIAdapter from './adapters/authAPI';
import debugAdapter from './adapters/debug';
import { IConfig } from './types';
import { mergeAdapters } from './utils';
import initLibrary from './library/index';

export default function authConfig(config: IConfig) {
  const adapter = mergeAdapters(
    authWindowAdapter,
    cryptographyAdapter,
    tokensAdapter,
    authAPIAdapter,
    debugAdapter
  );

  return initLibrary(adapter, config);
}