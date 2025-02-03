import { ApplicationConfig } from '@angular/core';
import { PreloadAllModules, provideRouter, withComponentInputBinding, withPreloading } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient } from "@angular/common/http";
import { APP_ROUTES } from './app.routes';
import { provideOAuthClient } from "angular-oauth2-oidc";
import { MyHttpInterceptor } from "./http.interceptor";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import {HIGHLIGHT_OPTIONS, provideHighlightOptions} from "ngx-highlightjs";
import { provideMarkdown } from 'ngx-markdown';

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
    provideHighlightOptions({
      coreLibraryLoader: () => import('highlight.js/lib/core'),
      lineNumbersLoader: () => import('ngx-highlightjs/line-numbers'), // Optional, add line numbers if needed
      languages: {
        typescript: () => import('highlight.js/lib/languages/typescript'),
        css: () => import('highlight.js/lib/languages/css'),
        xml: () => import('highlight.js/lib/languages/xml')
      }
    }),
    provideMarkdown(),
  ],
};
