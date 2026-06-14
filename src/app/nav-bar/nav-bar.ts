import { Component, HostListener, OnDestroy, effect } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth.service';
import { ChatService, Conversation, Message } from '../core/services/chat.service';
import { ChatReadStateService } from '../core/services/chat-read-state.service';
import { NotificationsService } from '../core/services/notifications.service';
import { User } from '../core/models/user.model';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './nav-bar.html',
  styleUrl: './nav-bar.css',
})
export class NavBar implements OnDestroy {
  isMobileMenuOpen = false;
  messagePulse = false;

  private lastUnreadCount: number | null = null;
  private notificationPoll?: ReturnType<typeof setInterval>;
  private pulseTimer?: ReturnType<typeof setTimeout>;
  private audioContext?: AudioContext;
  private audioUnlocked = false;
  private isRefreshingMessages = false;

  constructor(
    public authService: AuthService,
    private chatService: ChatService,
    public chatReadState: ChatReadStateService,
    public notificationsService: NotificationsService,
    private router: Router
  ) {
    effect(() => {
      if (this.authService.currentUser()) {
        this.refreshNotifications();
        this.refreshMessageUnreadCount();
        this.startNotificationPolling();
        return;
      }

      this.stopNotificationPolling();
      this.lastUnreadCount = null;
    });
  }

  ngOnDestroy() {
    this.stopNotificationPolling();
    if (this.pulseTimer) clearTimeout(this.pulseTimer);
    this.audioContext?.close().catch(() => {});
  }

  get currentUser(): User | null {
    return this.authService.currentUser();
  }

  get unreadNotifications(): number {
    return this.notificationsService.getUnreadCount$()();
  }

  get unreadMessages(): number {
    return this.chatReadState.unreadCount();
  }

  get unreadMessageBadge(): number {
    return Math.max(this.unreadMessages, this.unreadNotifications);
  }

  logout() {
    this.authService.logout();
    this.isMobileMenuOpen = false;
    this.router.navigate(['/sign-in']);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  @HostListener('document:pointerdown')
  @HostListener('document:keydown')
  unlockNotificationSound() {
    if (this.audioUnlocked || typeof window === 'undefined') return;

    const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextCtor) return;

    this.audioContext = this.audioContext || new AudioContextCtor();
    this.audioContext.resume().then(() => {
      this.audioUnlocked = true;
    }).catch(() => {});
  }

  private startNotificationPolling() {
    if (this.notificationPoll) return;
    this.notificationPoll = setInterval(() => {
      this.refreshNotifications();
      this.refreshMessageUnreadCount();
    }, 4000);
  }

  private stopNotificationPolling() {
    if (!this.notificationPoll) return;
    clearInterval(this.notificationPoll);
    this.notificationPoll = undefined;
  }

  private refreshNotifications() {
    this.notificationsService.getNotifications().subscribe({
      next: () => this.handleUnreadCount(this.unreadMessageBadge, false),
      error: () => {},
    });
  }

  private refreshMessageUnreadCount() {
    const user = this.currentUser;
    if (!user || this.isRefreshingMessages) return;

    this.isRefreshingMessages = true;
    this.chatService.getConversations().subscribe({
      next: (conversations) => {
        if (!conversations.length) {
          this.chatReadState.updateUnreadCount(user.id, [], {});
          this.handleUnreadCount(this.unreadMessageBadge, false);
          this.isRefreshingMessages = false;
          return;
        }

        this.loadConversationMessagesForUnread(user.id, conversations);
      },
      error: () => {
        this.isRefreshingMessages = false;
      },
    });
  }

  private loadConversationMessagesForUnread(userId: string, conversations: Conversation[]) {
    const messagesByConversation: Record<string, Message[]> = {};
    let completed = 0;

    conversations.forEach((conversation) => {
      this.chatService.getMessages(conversation.id).subscribe({
        next: (messages) => {
          messagesByConversation[conversation.id] = messages;
          completed++;
          this.finishUnreadRefreshIfReady(userId, conversations, messagesByConversation, completed);
        },
        error: () => {
          messagesByConversation[conversation.id] = [];
          completed++;
          this.finishUnreadRefreshIfReady(userId, conversations, messagesByConversation, completed);
        },
      });
    });
  }

  private finishUnreadRefreshIfReady(
    userId: string,
    conversations: Conversation[],
    messagesByConversation: Record<string, Message[]>,
    completed: number
  ) {
    if (completed < conversations.length) return;

    this.chatReadState.updateUnreadCount(userId, conversations, messagesByConversation);
    this.handleUnreadCount(this.unreadMessageBadge, true);
    this.isRefreshingMessages = false;
  }

  private handleUnreadCount(nextUnreadCount: number, allowInitialAlert: boolean) {
    if (this.lastUnreadCount !== null && nextUnreadCount > this.lastUnreadCount) {
      this.triggerMessageNotification();
    } else if (allowInitialAlert && this.lastUnreadCount === null && nextUnreadCount > 0) {
      this.triggerMessageNotification();
    }

    this.lastUnreadCount = nextUnreadCount;
  }

  private triggerMessageNotification() {
    this.messagePulse = false;
    window.requestAnimationFrame(() => {
      this.messagePulse = true;
    });

    if (this.pulseTimer) clearTimeout(this.pulseTimer);
    this.pulseTimer = setTimeout(() => {
      this.messagePulse = false;
    }, 1700);

    this.playNotificationSound();
  }

  private playNotificationSound() {
    if (!this.audioUnlocked || typeof window === 'undefined') return;

    const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextCtor) return;

    const context = this.audioContext || new AudioContextCtor();
    this.audioContext = context;
    if (context.state === 'suspended') {
      context.resume().catch(() => {});
    }

    const now = context.currentTime;
    const gain = context.createGain();
    const firstTone = context.createOscillator();
    const secondTone = context.createOscillator();

    gain.connect(context.destination);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

    firstTone.type = 'sine';
    firstTone.frequency.setValueAtTime(880, now);
    firstTone.connect(gain);
    firstTone.start(now);
    firstTone.stop(now + 0.2);

    secondTone.type = 'sine';
    secondTone.frequency.setValueAtTime(1174.66, now + 0.12);
    secondTone.connect(gain);
    secondTone.start(now + 0.12);
    secondTone.stop(now + 0.42);
  }
}
