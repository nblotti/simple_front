import {Route} from '@angular/router';
import {LoginComponent} from "./login/login.component";
import {authGuard} from "./auth.guard";


export const APP_ROUTES: Route[] = [
    {path: 'login', component: LoginComponent},

    {
      path: '',
      canActivate: [authGuard], // Apply the AuthGuard to all routes
      children: [
        {
          path: 'docs/:document_id/:page_number',
          loadComponent: () => import('./document-screen/document-screen').then(mod => mod.DocumentScreen),
        },
        {
          path: 'dashboard',
          loadComponent: () => import('./dashboard/dashboard.component').then(mod => mod.DashboardComponent),
        }
      ]
    },
    {
      path: '**', redirectTo:
        'login'
    } // Redirect invalid routes to home

  ]
;
