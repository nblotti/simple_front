import {Route, Routes} from '@angular/router';
import {PmsContainerComponent} from "./pms-container/pms-container.component";
import {DashboardComponent} from "./dashboard/dashboard.component";


export const APP_ROUTES: Route[] = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'docs/:document_id/:page_number',
    loadComponent: () => import('./document-screen/document-screen').then(mod => mod.DocumentScreen)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(mod => mod.DashboardComponent)
  },
  {
    path: 'pms',
    loadComponent: () => import('./pms-container/pms-container.component').then(mod => mod.PmsContainerComponent)
  },

];
