import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Cars } from './cars/cars';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'cars', component: Cars },
];
