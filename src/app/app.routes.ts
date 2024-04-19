import {Route, Routes} from '@angular/router';
import {PmsContainerComponent} from "./pms-container/pms-container.component";
import {DocumentListComponent} from "./document-list/document-list.component";


export const APP_ROUTES: Route[] = [
  {
    path: 'docs/:id',
    loadComponent: () => import('./document-container/document-container.component').then(mod => mod.DocumentContainerComponent)
  },
  {
    path: 'docslist',
    loadComponent: () => import('./document-list/document-list.component').then(mod => mod.DocumentListComponent)
  },
  {
    path: 'pms',
    loadComponent: () => import('./pms-container/pms-container.component').then(mod => mod.PmsContainerComponent)
  },

];
