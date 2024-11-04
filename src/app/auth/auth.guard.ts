import {CanActivateFn, Router} from '@angular/router';
import {OAuthService} from 'angular-oauth2-oidc';
import {inject} from '@angular/core';
import {authCodeFlowConfig} from './auth.config';
import {JwksValidationHandler} from 'angular-oauth2-oidc-jwks';
import {LoginService} from './login.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const oauthService = inject(OAuthService);
  const loginService = inject(LoginService);
  const router = inject(Router);

  try {
    if (loginService.isLogged()) {
      return true;
    }


    // Configure OAuthService
    oauthService.configure(authCodeFlowConfig);
    oauthService.tokenValidationHandler = new JwksValidationHandler();
    oauthService.setupAutomaticSilentRefresh();

    // Load discovery document and try login via tokens in URL
    await oauthService.loadDiscoveryDocumentAndTryLogin();

    if (oauthService.hasValidAccessToken() && oauthService.hasValidIdToken()) {
      try {
        const userProfile = await oauthService.loadUserProfile();
        if (!await loginService.doLogin(userProfile)) {
          await router.navigate(['/login']);
          return false;
        }

        // Store the attempted URL and query parameters only if they are not already set
        if (!loginService.redirectUrl) {
          console.log(`Storing state.url: ${state.url} and queryParams: ${JSON.stringify(route.queryParams)}`);
          loginService.redirectUrl = state.url;
          loginService.redirectParams = route.queryParams;
        } else {
          console.log('Redirect parameters already set');
        }
        const redirectUrl = loginService.constructRedirectUrl();
        console.log(`Redirect URL: ${redirectUrl}`);

        // Ensure single navigation by setting the URL to root before navigating to the final URL
        loginService.redirectUrl = ''; // Reset
        loginService.redirectParams = {}; // Reset
        await router.navigateByUrl(redirectUrl);

        return true;
      } catch (err) {
        console.error('Error loading user profile', err);
        await router.navigate(['/login']);
        return false;
      }
    } else {
      // Store the attempted URL and query parameters only if they are not already set
      if (!loginService.redirectUrl) {
        console.log(`Storing state.url: ${state.url} and queryParams: ${JSON.stringify(route.queryParams)}`);
        loginService.redirectUrl = state.url;
        loginService.redirectParams = route.queryParams;
      } else {
        console.log('Redirect parameters already set');
      }
      // Start OAuth code flow
      oauthService.initCodeFlow();
      return false;
    }
  } catch (error) {
    console.error('Error during OAuth discovery/login', error);
    await router.navigate(['/login']);
    return false;
  }
};
