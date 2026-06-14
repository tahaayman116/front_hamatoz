import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { ChatService, Conversation, Message } from '../core/services/chat.service';
import { NotificationsService } from '../core/services/notifications.service';
import { User } from '../core/models/user.model';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, RouterLink],
  templateUrl: './messages.html',
  styleUrl: './messages.css',
})
export class Messages implements OnInit, OnDestroy {
  currentUser: User | null = null;
  conversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  messages: Message[] = [];
  replyText = '';
  isLoadingConversations = true;
  isLoadingMessages = false;
  isSending = false;
  errorMessage = '';
  private messageRefreshTimer?: ReturnType<typeof setInterval>;
  private routeSubscription?: Subscription;

  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private notificationsService: NotificationsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/sign-in']);
      return;
    }

    this.routeSubscription = this.route.queryParamMap.subscribe(() => this.loadConversations());
    this.notificationsService.getNotifications().subscribe({
      next: () => this.notificationsService.markAllAsRead().subscribe({ error: () => {} }),
      error: () => {},
    });
  }

  ngOnDestroy() {
    this.stopMessageAutoRefresh();
    this.routeSubscription?.unsubscribe();
  }

  get isAgency(): boolean {
    return this.currentUser?.role?.toLowerCase() === 'agency';
  }

  loadConversations() {
    this.isLoadingConversations = true;
    this.errorMessage = '';

    this.chatService.getConversations().subscribe({
      next: (conversations) => {
        this.conversations = conversations;
        this.isLoadingConversations = false;
        const requestedConversationId = this.route.snapshot.queryParamMap.get('conversationId');
        const requestedRequestId = this.route.snapshot.queryParamMap.get('requestId');
        const selected =
          conversations.find((conversation) => requestedConversationId && conversation.id === requestedConversationId) ||
          conversations.find((conversation) => requestedRequestId && String(conversation.requestId) === requestedRequestId) ||
          conversations.find((conversation) => this.selectedConversation?.id === conversation.id) ||
          conversations[0];
        if (selected) {
          this.selectConversation(selected);
        }
      },
      error: (err) => {
        this.errorMessage = this.readableApiError(err, 'Could not load messages.');
        this.isLoadingConversations = false;
      },
    });
  }

  selectConversation(conversation: Conversation) {
    this.selectedConversation = conversation;
    this.messages = [];
    this.replyText = '';
    this.isLoadingMessages = true;
    this.errorMessage = '';

    this.chatService.getMessages(conversation.id).subscribe({
      next: (messages) => {
        this.messages = messages;
        this.isLoadingMessages = false;
        this.startMessageAutoRefresh();
      },
      error: (err) => {
        this.errorMessage = this.readableApiError(err, 'Could not load this conversation.');
        this.isLoadingMessages = false;
      },
    });
  }

  sendReply() {
    const text = this.replyText.trim();
    if (!this.selectedConversation || !text || this.isSending) return;

    this.isSending = true;
    this.errorMessage = '';

    this.chatService.sendMessage(this.selectedConversation.id, text).subscribe({
      next: (message) => {
        this.messages = [...this.messages, message];
        this.replyText = '';
        this.isSending = false;
        this.startMessageAutoRefresh();
      },
      error: (err) => {
        this.errorMessage = this.readableApiError(err, 'Could not send message.');
        this.isSending = false;
      },
    });
  }

  isOwnMessage(message: Message): boolean {
    return Boolean(this.currentUser && message.senderUserId && String(message.senderUserId) === this.currentUser.id);
  }

  participantLabel(conversation: Conversation): string {
    if (this.isAgency && conversation.customerName) return conversation.customerName;
    if (!this.isAgency && conversation.agencyName) return conversation.agencyName;
    if (conversation.participantName) return conversation.participantName;
    if (this.isAgency) return `Customer #${conversation.customerUserId || 'N/A'}`;
    return `Agency #${conversation.agencyUserId || 'N/A'}`;
  }

  conversationTitle(conversation: Conversation): string {
    return this.participantLabel(conversation);
  }

  private readableApiError(err: any, fallback: string): string {
    if (err?.status === 401) return 'Please sign in again.';
    if (err?.details?.errors) return Object.values(err.details.errors).flat().join(' ');
    return err?.details?.message || err?.message || fallback;
  }

  private startMessageAutoRefresh() {
    if (this.messageRefreshTimer || !this.selectedConversation) return;
    this.messageRefreshTimer = setInterval(() => this.refreshSelectedMessages(), 3000);
  }

  private stopMessageAutoRefresh() {
    if (!this.messageRefreshTimer) return;
    clearInterval(this.messageRefreshTimer);
    this.messageRefreshTimer = undefined;
  }

  private refreshSelectedMessages() {
    if (!this.selectedConversation || this.isSending) return;

    this.chatService.getMessages(this.selectedConversation.id).subscribe({
      next: (messages) => {
        this.messages = messages;
      },
      error: () => {},
    });
  }
}
