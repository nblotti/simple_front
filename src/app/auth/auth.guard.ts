import {CanActivateFn, Router} from '@angular/router';
import {OAuthService} from 'angular-oauth2-oidc';
import {inject} from '@angular/core';
import {authCodeFlowConfig} from './auth.config'; // Assuming you have this configured
import {JwksValidationHandler} from 'angular-oauth2-oidc-jwks'
import {LoginService} from "./login.service";





export const authGuard: CanActivateFn = (route, state) => {
  const oauthService = inject(OAuthService);
  const loginService = inject(LoginService);
  const router = inject(Router);

  oauthService.configure(authCodeFlowConfig);
  oauthService.tokenValidationHandler = new JwksValidationHandler();
  oauthService.setupAutomaticSilentRefresh();


  return oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
    if (oauthService.hasValidAccessToken() && oauthService.hasValidIdToken()) {
      // Ensure the user profile is loaded
      return oauthService.loadUserProfile()
        .then((userProfile) => {

          return loginService.doLogin(userProfile);

        }).catch(err => {
          console.error('Error loading user profile', err);
          router.navigate(['/login']);
          return false;
        });
    } else {
      // Initiate login flow if the tokens are not valid
      oauthService.initCodeFlow();
      return false;
    }
  }).catch(error => {
    // Handle errors during the discovery document and login process
    console.error('Error during OAuth discovery/login', error);
    return router.navigate(['/login']).then(() => false);
  });
};


