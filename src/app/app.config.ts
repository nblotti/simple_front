import {ApplicationConfig, importProvidersFrom} from '@angular/core';
import {provideRouter} from '@angular/router';


import {HttpClientModule} from "@angular/common/http";
import {APP_ROUTES} from './app.routes';
import {OAuthModule, provideOAuthClient} from "angular-oauth2-oidc";

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(APP_ROUTES),
    importProvidersFrom(HttpClientModule),
    provideOAuthClient()

    ]

};
