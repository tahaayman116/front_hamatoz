import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { API_CONFIG } from '../api/api.config';

export interface Notification {
  id: number;
  title: string;
  message: string;
  isRead: boolean;
  read: boolean;
  createdAtUtc: string;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationsService {
  private notifications = signal<Notification[]>([]);
  private unreadCount = signal(0);
  private loading = signal(false);
  private error = signal<string | null>(null);

  constructor(private apiService: ApiService) {}

  /**
   * Get all notifications
   */
  getNotifications(): Observable<Notification[]> {
    return new Observable((observer) => {
      this.loading.set(true);
      this.apiService.get<any>(API_CONFIG.endpoints.notifications.all).subscribe({
        next: (response: any) => {
          const notificationsArray = this.normalizeNotifications(response)
            .map((notification: any) => this.normalizeNotification(notification));
          this.notifications.set(notificationsArray);
          this.updateUnreadCount(notificationsArray);
          this.error.set(null);
          this.loading.set(false);
          observer.next(notificationsArray);
          observer.complete();
        },
        error: (err) => {
          this.error.set(err.message);
          this.loading.set(false);
          observer.error(err);
        },
      });
    });
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): Observable<any> {
    return new Observable((observer) => {
      const endpoint = API_CONFIG.endpoints.notifications.markAsRead.replace(
        '{notificationId}',
        notificationId
      );
      this.apiService.post<any>(endpoint, {}).subscribe({
        next: (response: any) => {
          this.notifications.update((notifications) =>
            notifications.map((n) => (String(n.id) === notificationId ? { ...n, isRead: true, read: true } : n))
          );
          this.updateUnreadCount(this.notifications());
          observer.next(response);
          observer.complete();
        },
        error: (err) => {
          observer.error(err);
        },
      });
    });
  }

  /**
   * Mark all as read
   */
  markAllAsRead(): Observable<any> {
    return new Observable((observer) => {
      const unreadNotifications = this.notifications().filter((n) => !n.read);
      let completed = 0;

      if (unreadNotifications.length === 0) {
        observer.next({ success: true });
        observer.complete();
        return;
      }

      unreadNotifications.forEach((notification) => {
      this.markAsRead(String(notification.id)).subscribe({
          next: () => {
            completed++;
            if (completed === unreadNotifications.length) {
              observer.next({ success: true });
              observer.complete();
            }
          },
          error: (err) => {
            observer.error(err);
          },
        });
      });
    });
  }

  /**
   * Update unread count
   */
  private updateUnreadCount(notifications: Notification[]): void {
    const count = notifications.filter((n) => !n.isRead).length;
    this.unreadCount.set(count);
  }

  private normalizeNotification(notification: any): Notification {
    return {
      ...notification,
      read: notification.read ?? notification.isRead ?? false,
      isRead: notification.isRead ?? notification.read ?? false,
    };
  }

  private normalizeNotifications(response: any): any[] {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.notifications)) return response.notifications;
    return [response.data || response];
  }

  /**
   * Get signals
   */
  getNotifications$() {
    return this.notifications;
  }

  getUnreadCount$() {
    return this.unreadCount;
  }

  isLoading$() {
    return this.loading;
  }

  error$() {
    return this.error;
  }
}
