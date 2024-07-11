/// <reference types="@angular/localize" />

import {bootstrapApplication} from '@angular/platform-browser';

import {AppComponent} from './app/app.component';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {provideHttpClient} from "@angular/common/http";
import {PreloadAllModules, provideRouter, withComponentInputBinding, withPreloading} from "@angular/router";
import {APP_ROUTES} from "./app/app.routes";
import {provideOAuthClient} from "angular-oauth2-oidc";

bootstrapApplication(AppComponent, {
  providers: [provideAnimationsAsync(), provideAnimationsAsync(), provideHttpClient(),
    provideRouter(APP_ROUTES, withComponentInputBinding(), withPreloading(PreloadAllModules)),
    provideOAuthClient()]
})
  .catch((err) => console.error(err));
