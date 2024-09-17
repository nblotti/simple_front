import {CanActivateFn, Router} from '@angular/router';
import {OAuthService} from 'angular-oauth2-oidc';
import {inject} from '@angular/core';
import {authCodeFlowConfig} from './auth.config'; // Assuming you have this configured
import {JwksValidationHandler} from 'angular-oauth2-oidc-jwks';
import {LoginService} from "./login.service";

export const authGuard: CanActivateFn = async (route, state) => {
  const oauthService = inject(OAuthService);
  const loginService = inject(LoginService);
  const router = inject(Router);

  try {
    if (loginService.isLogged())
      return true;
    oauthService.configure(authCodeFlowConfig);
    oauthService.tokenValidationHandler = new JwksValidationHandler();
    oauthService.setupAutomaticSilentRefresh();

    await oauthService.loadDiscoveryDocumentAndTryLogin();

    if (oauthService.hasValidAccessToken() && oauthService.hasValidIdToken()) {
      try {
        const userProfile = await oauthService.loadUserProfile();
        if (!await loginService.doLogin(userProfile)) {
          await router.navigate(['/login']);
          return false;
        }
        return true;
      } catch (err) {
        console.error('Error loading user profile', err);
        await router.navigate(['/login']);
        return false;
      }
    } else {
      oauthService.initCodeFlow();
      return false;
    }
  } catch (error) {
    // Handle errors during the discovery document and login process
    console.error('Error during OAuth discovery/login', error);
    await router.navigate(['/login']);
    return false;
  }
};
