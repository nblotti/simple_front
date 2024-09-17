import { ApplicationConfig } from '@angular/core';
import { PreloadAllModules, provideRouter, withComponentInputBinding, withPreloading } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient } from "@angular/common/http";
import { APP_ROUTES } from './app.routes';
import { provideOAuthClient } from "angular-oauth2-oidc";
import { MyHttpInterceptor } from "./http.interceptor";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { HIGHLIGHT_OPTIONS } from "ngx-highlightjs";

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    provideHttpClient(),
    provideRouter(APP_ROUTES, withComponentInputBinding(), withPreloading(PreloadAllModules)),
    provideOAuthClient(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MyHttpInterceptor,
      multi: true,
    },
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        // Customize as per your requirement
        languages: {
          typescript: () => import('highlight.js/lib/languages/typescript'),
          html: () => import('highlight.js/lib/languages/xml'),
          css: () => import('highlight.js/lib/languages/css'),
        }
      }
    }
  ],
};
