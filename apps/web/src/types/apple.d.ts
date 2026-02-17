interface AppleSignInAuthorization {
  code: string;
  id_token: string;
  state?: string;
  user?: {
    email: string;
    name: {
      firstName: string;
      lastName: string;
    };
  };
}

interface AppleSignInError {
  error: string;
}

interface AppleIDAuth {
  init: (config: {
    clientId: string;
    scope: string;
    redirectURI: string;
    state?: string;
    usePopup: boolean;
  }) => void;
  signIn: () => Promise<{ authorization: AppleSignInAuthorization }>;
}

interface AppleID {
  auth: AppleIDAuth;
}

interface Window {
  AppleID?: AppleID;
}
