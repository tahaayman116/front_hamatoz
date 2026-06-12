import { Injectable, signal, computed } from '@angular/core';
import { StorageService } from './storage.service';
import { User, Agency, UserStatus } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserAgencyService {
  private users = signal<User[]>([]);
  
  approvedAgencies = computed(() => 
    this.users()
      .filter((u): u is Agency => u.role === 'agency' && u.status === 'active')
  );

  pendingAgencies = computed(() =>
    this.users()
      .filter((u): u is Agency => u.role === 'agency' && u.status === 'pending')
  );

  rejectedAgencies = computed(() =>
    this.users()
      .filter((u): u is Agency => u.role === 'agency' && u.status === 'inactive')
  );

  allAgencies = computed(() =>
    this.users()
      .filter((u): u is Agency => u.role === 'agency')
  );

  regularUsers = computed(() =>
    this.users()
      .filter(u => u.role === 'user')
  );

  constructor(private storageService: StorageService) {
    this.loadUsers();
  }

  private loadUsers(): void {
    const storedUsers = this.storageService.getItem('users') || [];
    this.users.set(storedUsers);
  }

  private saveUsers(): void {
    this.storageService.setItem('users', this.users());
  }

  private generateId(type: string): string {
    return `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  registerUser(userData: Partial<User>): { success: boolean; user?: User; error?: string } {
    const existingUser = this.users().find(
      u => u.email?.toLowerCase() === userData.email?.toLowerCase()
    );
    
    if (existingUser) {
      return { success: false, error: 'Email already registered' };
    }

    const newUser: User = {
      id: this.generateId('user'),
      name: userData.name || '',
      email: userData.email || '',
      password: userData.password || '',
      role: this.normalizeRole(userData.role),
      status: this.normalizeRole(userData.role) === 'agency' ? 'pending' : 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...userData,
    };

    this.users.update(users => [...users, newUser]);
    this.saveUsers();

    return { success: true, user: newUser };
  }

  approveAgency(agencyId: string, notes?: string): { success: boolean; error?: string } {
    const index = this.users().findIndex(u => u.id === agencyId && u.role === 'agency');
    
    if (index === -1) {
      return { success: false, error: 'Agency not found' };
    }

    const updatedUsers = [...this.users()];
    const agency = updatedUsers[index] as Agency;
    agency.status = 'active' as UserStatus;
    agency.updatedAt = new Date();
    if (notes) agency.approverNotes = notes;

    this.users.set(updatedUsers);
    this.saveUsers();

    return { success: true };
  }

  rejectAgency(agencyId: string, reason?: string): { success: boolean; error?: string } {
    const index = this.users().findIndex(u => u.id === agencyId && u.role === 'agency');
    
    if (index === -1) {
      return { success: false, error: 'Agency not found' };
    }

    const updatedUsers = [...this.users()];
    const agency = updatedUsers[index] as Agency;
    agency.status = 'inactive' as UserStatus;
    agency.updatedAt = new Date();
    if (reason) agency.approverNotes = reason;

    this.users.set(updatedUsers);
    this.saveUsers();

    return { success: true };
  }

  updateUserStatus(userId: string, status: UserStatus): { success: boolean; error?: string } {
    const index = this.users().findIndex(u => u.id === userId);
    
    if (index === -1) {
      return { success: false, error: 'User not found' };
    }

    const updatedUsers = [...this.users()];
    updatedUsers[index].status = status;
    updatedUsers[index].updatedAt = new Date();

    this.users.set(updatedUsers);
    this.saveUsers();

    return { success: true };
  }

  deleteUser(userId: string): { success: boolean; error?: string } {
    const index = this.users().findIndex(u => u.id === userId);
    
    if (index === -1) {
      return { success: false, error: 'User not found' };
    }

    this.users.update(users => users.filter((_, i) => i !== index));
    this.saveUsers();

    return { success: true };
  }

  getUserById(userId: string): User | undefined {
    return this.users().find(u => u.id === userId);
  }

  getAgencyById(agencyId: string): Agency | undefined {
    return this.users().find((u): u is Agency => u.id === agencyId && u.role === 'agency');
  }

  getAllUsers(): User[] {
    return this.users();
  }

  findByCredentials(email: string, password: string): User | undefined {
    return this.users().find(
      (user) =>
        user.email?.toLowerCase() === email.trim().toLowerCase() &&
        user.password === password
    );
  }

  getStats() {
    return {
      totalUsers: this.users().filter(u => u.role === 'user').length,
      totalAgencies: this.allAgencies().length,
      approvedAgencies: this.approvedAgencies().length,
      pendingAgencies: this.pendingAgencies().length,
      rejectedAgencies: this.rejectedAgencies().length,
    };
  }

  private normalizeRole(role?: string): any {
    const normalized = role?.toLowerCase();
    if (normalized === 'agency') return 'agency';
    if (normalized === 'admin') return 'admin';
    return 'user';
  }
}
