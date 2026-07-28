import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, apiKey, token, functionsVersion, appBaseUrl } = appParams;

const clientConfig = {
  appId,
  requiresAuth: false,
};

if (token) {
  clientConfig.token = token;
}

if (functionsVersion) {
  clientConfig.functionsVersion = functionsVersion;
}

if (appBaseUrl) {
  clientConfig.appBaseUrl = appBaseUrl;
}

if (apiKey) {
  clientConfig.headers = {
    api_key: apiKey,
  };
}

export const base44 = createClient(clientConfig);
