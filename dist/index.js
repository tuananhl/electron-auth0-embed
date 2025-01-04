var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => authConfig
});
module.exports = __toCommonJS(index_exports);

// src/adapters/authWindow.ts
var import_electron = require("electron");
var import_qs = __toESM(require("qs"));
var import_url = __toESM(require("url"));

// src/utils.ts
function mergeAdapters(...adapters) {
  return (config) => {
    return adapters.reduce((hashMap, adapter) => ({
      ...hashMap,
      ...adapter(config)
    }), {});
  };
}
function $applyContext(ctx) {
  return function(op) {
    return (input) => op(ctx, input);
  };
}
var context = (contextKey, vl) => ({
  [contextKey]: vl
});

// src/adapters/authWindow.ts
var authWindowAdapter = (config) => {
  const baseWindowConfig = {
    width: 800,
    height: 800,
    alwaysOnTop: true
  };
  return context("authWindow", {
    login: async (pair) => {
      return new Promise((resolve, reject) => {
        var _a, _b;
        const auth0AuthorizeURL = `https://${config.auth0.domain}/authorize?` + import_qs.default.stringify({
          audience: config.auth0.audience,
          scope: config.auth0.scopes,
          response_type: "code",
          client_id: config.auth0.clientId,
          code_challenge: pair.challenge,
          code_challenge_method: "S256",
          redirect_uri: `https://${config.auth0.domain}/result`,
          ...(_a = config.login) == null ? void 0 : _a.authorizeParams
        });
        const loginWindow = new import_electron.BrowserWindow({
          ...baseWindowConfig,
          title: "Login",
          ...(_b = config.login) == null ? void 0 : _b.windowConfig
        });
        loginWindow.webContents.on("did-navigate", (event, href) => {
          const location = import_url.default.parse(href);
          if (location.pathname == "/result") {
            const query = import_qs.default.parse(location.search || "", { ignoreQueryPrefix: true });
            resolve(query.code);
            loginWindow.destroy();
          }
        });
        loginWindow.on("close", () => {
          reject("Auth flow is rejected");
        });
        loginWindow.loadURL(auth0AuthorizeURL);
      });
    },
    logout: async () => {
      return new Promise((resolve, reject) => {
        var _a;
        let timeoutRef = null;
        const logoutWindow = new import_electron.BrowserWindow({
          ...baseWindowConfig,
          title: "Log out",
          skipTaskbar: true,
          show: false,
          frame: false,
          ...(_a = config.logout) == null ? void 0 : _a.windowConfig
        });
        logoutWindow.webContents.on("did-navigate", () => {
          logoutWindow.destroy();
          if (timeoutRef) {
            clearTimeout(timeoutRef);
          }
          resolve();
        });
        logoutWindow.loadURL(`https://${config.auth0.domain}/v2/logout`);
        timeoutRef = setTimeout(() => {
          reject(new Error("Logout time out"));
        }, 60 * 1e3);
      });
    }
  });
};
var authWindow_default = authWindowAdapter;

// src/adapters/cryptography.ts
var import_crypto = __toESM(require("crypto"));
function base64URLEncode(str) {
  return str.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}
function base64hash(str) {
  return import_crypto.default.createHash("sha256").update(str).digest().toString("base64");
}
function createBase64Random(bytes) {
  return import_crypto.default.randomBytes(bytes).toString("base64");
}
var cryptographyAdapter = (config) => {
  return context("cryptography", {
    getPKCEChallengePair: () => {
      const seed = createBase64Random(32);
      const verifier = base64URLEncode(seed);
      const challenge = base64URLEncode(base64hash(verifier));
      return { verifier, challenge };
    }
  });
};
var cryptography_default = cryptographyAdapter;

// src/adapters/tokens.ts
var epochSeconds = () => Date.now() / 1e3;
var tokensAdapter = () => {
  let tokenResponse = null;
  let expiredAt;
  return context("tokens", {
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
};
var tokens_default = tokensAdapter;

// src/adapters/authAPI.ts
var import_got = __toESM(require("got"));
var authAPIAdapter = (config) => {
  return context("authAPI", {
    exchangeAuthCode: (authCode, pair) => import_got.default.post(`https://${config.auth0.domain}/oauth/token`, {
      json: {
        grant_type: "authorization_code",
        client_id: config.auth0.clientId,
        code_verifier: pair.verifier,
        code: authCode,
        redirect_uri: `https://${config.auth0.domain}/result`
      }
    }).json(),
    getProfile: (accessToken) => (0, import_got.default)(`https://${config.auth0.domain}/userinfo`, { headers: { "Authorization": `Bearer ${accessToken}` } }).json()
  });
};
var authAPI_default = authAPIAdapter;

// src/library/handlers.ts
async function login(ctx) {
  const {
    cryptography,
    authWindow,
    authAPI,
    tokens
  } = ctx;
  const pair = cryptography.getPKCEChallengePair();
  const authCode = await authWindow.login(pair);
  const token = await authAPI.exchangeAuthCode(authCode, pair);
  tokens.set(token);
  return token.access_token;
}
async function getToken(ctx) {
  const { tokens } = ctx;
  const token = await tokens.get();
  if (token && tokens.expiredIn() > 60) {
    return token.access_token;
  }
  return login(ctx);
}
async function logout(ctx) {
  const {
    authWindow: { logout: logout2 },
    tokens
  } = ctx;
  await Promise.all([tokens.delete(), logout2()]);
}
async function getProfile(ctx) {
  const {
    tokens,
    authAPI
  } = ctx;
  const token = await tokens.get();
  if (!token) return null;
  return authAPI.getProfile(token.access_token);
}

// src/library/index.ts
function initLibrary(adapter, config) {
  const applyContext = $applyContext(adapter(config));
  return {
    getToken: applyContext(getToken),
    getProfile: applyContext(getProfile),
    login: applyContext(login),
    logout: applyContext(logout)
  };
}
var library_default = initLibrary;

// src/index.ts
function authConfig(config) {
  const adapter = mergeAdapters(
    authWindow_default,
    cryptography_default,
    tokens_default,
    authAPI_default
  );
  return library_default(adapter, config);
}
//# sourceMappingURL=index.js.map