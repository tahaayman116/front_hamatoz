import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Cars } from './cars/cars';
import { CarsDetails } from './cars-details/cars-details';
import { Services } from './services/services';
import { About } from './about/about';
import { Parts } from './parts/parts';
import { SignUp } from './sign-up/sign-up';
import { SignIn } from './sign-in/sign-in';
import { Preferences } from './preferences/preferences';
import { UserProfile } from './user/profile/user-profile';
import { AdminSignIn } from './admin/sign-in/admin-sign-in';
import { AdminDashboard } from './admin/dashboard/admin-dashboard';
import { AdminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'cars', component: Cars },
  { path: 'cars/:id', component: CarsDetails },
  { path: 'services', component: Services },
  { path: 'about', component: About },
  { path: 'parts', component: Parts },
  { path: 'sign-up', component: SignUp },
  { path: 'sign-in', component: SignIn },
  { path: 'preferences', component: Preferences },
  { path: 'profile', component: UserProfile },
  
  // Admin Routes
  { path: 'admin/sign-in', component: AdminSignIn },
  {
    path: 'admin/dashboard',
    component: AdminDashboard,
    canActivate: [AdminGuard]
  },
  {
    path: 'admin',
    redirectTo: 'admin/dashboard',
    pathMatch: 'full'
  },
];
