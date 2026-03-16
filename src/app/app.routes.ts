import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Cars } from './cars/cars';
import { Services } from './services/services';
import { About } from './about/about';
import { Parts } from './parts/parts';
import { SignUp } from './sign-up/sign-up';
import { SignIn } from './sign-in/sign-in';
import { Preferences } from './preferences/preferences';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'cars', component: Cars },
  { path: 'services', component: Services },
  { path: 'about', component: About },
  { path: 'parts', component: Parts },
  { path: 'sign-up', component: SignUp },
  { path: 'sign-in', component: SignIn },
  { path: 'preferences', component: Preferences },
];
