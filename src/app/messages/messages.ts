import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { ChatService, Conversation, Message } from '../core/services/chat.service';
import { ChatReadStateService } from '../core/services/chat-read-state.service';
import { NotificationsService } from '../core/services/notifications.service';
import { User } from '../core/models/user.model';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, RouterLink],
  templateUrl: './messages.html',
  styleUrl: './messages.css',
})
export class Messages implements OnInit {
  currentUser: User | null = null;
  conversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  messages: Message[] = [];
  replyText = '';
  isLoadingConversations = true;
  isLoadingMessages = false;
  isSending = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private chatService: ChatService,
    private chatReadState: ChatReadStateService,
    private notificationsService: NotificationsService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/sign-in']);
      return;
    }

    this.loadConversations();
    this.notificationsService.getNotifications().subscribe({
      next: () => this.notificationsService.markAllAsRead().subscribe({ error: () => {} }),
      error: () => {},
    });
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
        if (conversations.length) {
          this.selectConversation(conversations[0]);
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
        this.markSelectedConversationRead(messages);
        this.isLoadingMessages = false;
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
        this.markSelectedConversationRead(this.messages);
        this.replyText = '';
        this.isSending = false;
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
    if (this.isAgency) return `Customer #${conversation.customerUserId || 'N/A'}`;
    return `Agency #${conversation.agencyUserId || 'N/A'}`;
  }

  private readableApiError(err: any, fallback: string): string {
    if (err?.status === 401) return 'Please sign in again.';
    if (err?.details?.errors) return Object.values(err.details.errors).flat().join(' ');
    return err?.details?.message || err?.message || fallback;
  }

  private markSelectedConversationRead(messages: Message[]) {
    if (!this.currentUser || !this.selectedConversation) return;
    this.chatReadState.markConversationRead(this.currentUser.id, this.selectedConversation.id, messages);
  }
}
