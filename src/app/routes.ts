import { Routes } from '@angular/router';
import { MainComponent } from './routes/main/main.component';

export const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: '',
        loadChildren: 'app/routes/home/home.module#HomeModule'
      }
      ]
  }
  ];

