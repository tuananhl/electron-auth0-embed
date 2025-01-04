import crypto from 'crypto';
import { Adapter, PKCEPair } from '../types';
import { context } from '../utils';

function base64URLEncode(str: string) {
  return str
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64hash(str: string) {
  return crypto.createHash('sha256').update(str).digest().toString('base64');
}

function createBase64Random(bytes: number) {
  return crypto.randomBytes(bytes).toString('base64');
}

const cryptographyAdapter: Adapter = (config) => {
  return context('cryptography', {
    getPKCEChallengePair: () => {
      const seed = createBase64Random(32);
      const verifier = base64URLEncode(seed);
      const challenge = base64URLEncode(base64hash(verifier));
      return { verifier, challenge };
    }
  });
}

export default cryptographyAdapter;
