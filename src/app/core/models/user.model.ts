export type UserRole = 'user' | 'agency' | 'admin' | 'Customer' | 'Agency' | 'Admin';
export type UserStatus = 'active' | 'pending' | 'inactive';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  bio?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface Agency extends User {
  role: 'agency';
  description?: string;
  contactPhone?: string;
  address?: string;
  website?: string;
  logo?: string;
  approverNotes?: string;
}

export interface Admin extends User {
  role: 'admin';
}
