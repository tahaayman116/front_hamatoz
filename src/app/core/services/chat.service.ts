import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { API_CONFIG } from '../api/api.config';

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
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
          const conversationsArray = this.normalizeArray(response, 'conversations');
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
          const messagesArray = this.normalizeArray(response, 'messages');
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
          const message = response.data || response;
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
    if (Array.isArray(response[key])) return response[key];
    return [response.data || response];
  }
}
