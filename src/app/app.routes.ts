import { Route } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { authGuard } from './auth.guard';

export const APP_ROUTES:  Route[]  = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'assistant', pathMatch: 'full' }, // Default redirect to assistant
      { path: 'assistant', loadComponent: () => import('./assistant/assistant.component').then(m => m.AssistantComponent) },
      { path: 'docs/:document_id/:page_number', loadComponent: () => import('./document-screen/document-screen').then(m => m.DocumentScreen) },
      { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
    ]
  },
  { path: '**', redirectTo: 'login' }
];
