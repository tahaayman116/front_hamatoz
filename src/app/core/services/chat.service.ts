import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { API_CONFIG } from '../api/api.config';

export interface Conversation {
  id: string;
  requestId?: number;
  customerUserId?: number;
  agencyUserId?: number;
  participantId?: string;
  participantName?: string;
  customerName?: string;
  agencyName?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderUserId?: number;
  senderId?: string;
  senderName?: string;
  content: string;
  text?: string;
  timestamp: Date;
  read?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private conversations = signal<Conversation[]>([]);
  private currentMessages = signal<Message[]>([]);
  private loading = signal(false);
  private error = signal<string | null>(null);

  constructor(private apiService: ApiService) {}

  /**
   * Get all conversations
   */
  getConversations(): Observable<Conversation[]> {
    return new Observable((observer) => {
      this.loading.set(true);
      this.apiService.get<any>(API_CONFIG.endpoints.chat.conversations).subscribe({
        next: (response: any) => {
          const conversationsArray = this.normalizeArray(response, 'conversations').map((conversation) =>
            this.normalizeConversation(conversation)
          );
          this.conversations.set(conversationsArray);
          this.error.set(null);
          this.loading.set(false);
          observer.next(conversationsArray);
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
   * Get messages from conversation
   */
  getMessages(conversationId: string): Observable<Message[]> {
    return new Observable((observer) => {
      this.loading.set(true);
      const endpoint = API_CONFIG.endpoints.chat.messages.replace(
        '{conversationId}',
        conversationId
      );
      this.apiService.get<any>(endpoint).subscribe({
        next: (response: any) => {
          const messagesArray = this.normalizeArray(response, 'messages').map((message) =>
            this.normalizeMessage(message)
          );
          this.currentMessages.set(messagesArray);
          this.error.set(null);
          this.loading.set(false);
          observer.next(messagesArray);
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
   * Send message
   */
  sendMessage(conversationId: string, content: string): Observable<Message> {
    return new Observable((observer) => {
      this.loading.set(true);
      const endpoint = API_CONFIG.endpoints.chat.messages.replace(
        '{conversationId}',
        conversationId
      );
      const data = { text: content };
      this.apiService.post<any>(endpoint, data).subscribe({
        next: (response: any) => {
          const message = this.normalizeMessage(response.data || response);
          this.currentMessages.update((messages) => [...messages, message]);
          this.error.set(null);
          this.loading.set(false);
          observer.next(message);
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
   * Get signals
   */
  getConversations$() {
    return this.conversations;
  }

  getMessages$() {
    return this.currentMessages;
  }

  isLoading$() {
    return this.loading;
  }

  error$() {
    return this.error;
  }

  private normalizeArray(response: any, key: string): any[] {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.items)) return response.items;
    if (Array.isArray(response.result)) return response.result;
    if (Array.isArray(response.$values)) return response.$values;
    if (Array.isArray(response[key])) return response[key];
    if (Array.isArray(response.data?.$values)) return response.data.$values;
    if (Array.isArray(response.data?.items)) return response.data.items;
    if (Array.isArray(response.data?.[key])) return response.data[key];
    return [response.data || response];
  }

  private normalizeConversation(conversation: any): Conversation {
    const createdAt = this.toDate(
      conversation.createdAtUtc || conversation.createdAt,
      Boolean(conversation.createdAtUtc)
    );
    const updatedAt = this.toDate(
      conversation.updatedAtUtc || conversation.updatedAt || conversation.createdAtUtc,
      Boolean(conversation.updatedAtUtc || conversation.createdAtUtc)
    );

    return {
      ...conversation,
      id: String(conversation.id),
      requestId: Number(conversation.requestId) || undefined,
      customerUserId: Number(conversation.customerUserId) || undefined,
      agencyUserId: Number(conversation.agencyUserId) || undefined,
      participantId: conversation.participantId ? String(conversation.participantId) : undefined,
      participantName: conversation.participantName || conversation.customerName || conversation.agencyName || conversation.otherUserName,
      customerName: conversation.customerName || conversation.customerFullName,
      agencyName: conversation.agencyName || conversation.agencyFullName,
      createdAt,
      updatedAt,
      lastMessageTime: conversation.lastMessageTime ? this.toDate(conversation.lastMessageTime) : undefined,
    };
  }

  private normalizeMessage(message: any): Message {
    const timestamp = this.toDate(
      message.sentAtUtc || message.timestamp || message.createdAtUtc || message.createdAt,
      Boolean(message.sentAtUtc || message.createdAtUtc)
    );
    const senderUserId =
      message.senderUserId ??
      message.senderUserID ??
      message.senderId ??
      message.senderID ??
      message.userId ??
      message.userID ??
      message.fromUserId ??
      message.fromUserID ??
      message.createdByUserId;

    return {
      ...message,
      id: String(message.id ?? message.messageId ?? message.messageID ?? `${message.conversationId || ''}-${timestamp.getTime()}`),
      conversationId: String(message.conversationId ?? message.conversationID),
      senderUserId: Number(senderUserId) || undefined,
      senderId: senderUserId !== undefined && senderUserId !== null ? String(senderUserId) : undefined,
      content: message.content || message.text || '',
      text: message.text || message.content || '',
      timestamp,
    };
  }

  private toDate(value: any, assumeUtc = false): Date {
    let normalizedValue = value;
    if (
      assumeUtc &&
      typeof value === 'string' &&
      !/(?:z|[+-]\d{2}:?\d{2})$/i.test(value.trim())
    ) {
      normalizedValue = `${value.trim()}Z`;
    }

    const date = normalizedValue ? new Date(normalizedValue) : new Date();
    return Number.isNaN(date.getTime()) ? new Date() : date;
  }
}
