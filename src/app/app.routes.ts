import {Route} from '@angular/router';
import {LoginComponent} from './login/login.component';
import {authGuard} from './auth/auth.guard';


export const APP_ROUTES: Route[] = [
  {path: 'login', component: LoginComponent},

  // Add the dedicated OAuth callback route

  {
    path: '',
    canActivate: [authGuard],
    children: [
      {path: '', redirectTo: 'assistant', pathMatch: 'full'}, // Default redirect to assistant
      {
        path: 'assistant',
        loadComponent: () => import('./assistant/assistant.component').then(m => m.AssistantComponent)
      },
      {
        path: 'docs',
        loadComponent: () => import('./dashboard-document-screen/document-screen').then(m => m.DocumentScreen),
        pathMatch: 'full', // Ensure the route matches fully
        children: [
          {
            path: '',
            loadComponent: () => import('./dashboard-document-screen/document-screen').then(m => m.DocumentScreen)
          }
        ]
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard-main-screen/dashboard.component').then(m => m.DashboardComponent)
      },
      {path: 'share', loadComponent: () => import('./share/share.component').then(m => m.ShareComponent)},
      {path: 'admin', loadComponent: () => import('./admin-main-screen/admin.component').then(m => m.AdminComponent)}
    ]
  },

  {path: '**', redirectTo: 'agent'}
];
