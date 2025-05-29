import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [    
  { path: 'index', component: HomeComponent },
  
  { path: '**', redirectTo: 'index', pathMatch: 'full' }
];
