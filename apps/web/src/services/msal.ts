import { PublicClientApplication, type Configuration } from '@azure/msal-browser';

let msalInstance: PublicClientApplication | null = null;

function getMsalConfig(): Configuration | null {
  const clientId = import.meta.env.VITE_MICROSOFT_CLIENT_ID;
  if (!clientId) return null;

  return {
    auth: {
      clientId,
      authority: 'https://login.microsoftonline.com/common',
      redirectUri: window.location.origin,
    },
    cache: {
      cacheLocation: 'sessionStorage',
    },
  };
}

export async function getMsalInstance(): Promise<PublicClientApplication | null> {
  if (msalInstance) return msalInstance;

  const config = getMsalConfig();
  if (!config) return null;

  msalInstance = new PublicClientApplication(config);
  await msalInstance.initialize();
  return msalInstance;
}

export async function loginWithMicrosoftPopup(): Promise<string | null> {
  const instance = await getMsalInstance();
  if (!instance) return null;

  const response = await instance.loginPopup({
    scopes: ['openid', 'profile', 'email'],
  });

  return response.idToken;
}
