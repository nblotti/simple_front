import { AuthConfig } from 'angular-oauth2-oidc';

export const authCodeFlowConfig: AuthConfig = {
  clientId: "",
  issuer: '',
  redirectUri: window.location.origin  +  '/',
  responseType: "code",
  strictDiscoveryDocumentValidation: false,
  scope: "openid profile email",
  showDebugInformation: true,
  dummyClientSecret: '',
  requireHttps: false,
  useHttpBasicAuth: false,
  oidc: true,
  disableAtHashCheck: true, // Or any other property needed for PKCE configuration
};
