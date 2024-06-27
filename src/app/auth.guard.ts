import {CanActivateFn, Router} from '@angular/router';
import {OAuthService} from 'angular-oauth2-oidc';
import {inject} from '@angular/core';
import {authCodeFlowConfig} from './auth/auth.config'; // Assuming you have this configured
import {JwksValidationHandler} from 'angular-oauth2-oidc-jwks'
import {UserContextService} from "./user-context.service";


interface GoogleUserProfile {
  info: {
    sub: string; // Subject - Unique identifier for the user (required)
    name?: string; // Full name of the user
    given_name?: string; // Given name(s) or first name(s) of the user
    family_name?: string; // Surname(s) or last name(s) of the user
    middle_name?: string; // Middle name(s) of the user
    nickname?: string; // Casual name of the user
    preferred_username?: string; // Shorthand name by which the user wishes to be referred to
    profile?: string; // URL of the user's profile page
    picture?: string; // URL of the user's profile picture
    website?: string; // URL of the user's website
    email?: string; // Email address of the user
    email_verified?: boolean; // True if the user's email address has been verified; otherwise false
    gender?: string; // Gender of the user
    birthdate?: string; // Birthday of the user
    phone_number?: string; // Preferred telephone number of the user
    phone_number_verified?: boolean; // True if the user's phone number has been verified; otherwise false
    address?: {
      formatted?: string; // Full mailing address, formatted for display or use with a mailing label
      street_address?: string;
      locality?: string;
      region?: string;
      postal_code?: string;
      country?: string;
    }; // Preferred address of the user
    updated_at?: number; // Time the user's information was last updated
  }
}


export const authGuard: CanActivateFn = (route, state) => {
  const oauthService = inject(OAuthService);
  const userContext = inject(UserContextService);
  const router = inject(Router);

  oauthService.configure(authCodeFlowConfig);
  oauthService.tokenValidationHandler = new JwksValidationHandler();
  oauthService.setupAutomaticSilentRefresh();

  let groups: string[] = [];
  groups.push("1");

  return oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
    if (oauthService.hasValidAccessToken() && oauthService.hasValidIdToken()) {
      // Ensure the user profile is loaded
      return oauthService.loadUserProfile()
        .then((userProfile) => {
          const profile = userProfile as GoogleUserProfile;

          userContext.setLoggedIn(true, profile.info.sub, groups)
          return true;
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

