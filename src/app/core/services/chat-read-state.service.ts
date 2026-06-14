import { Injectable, signal } from '@angular/core';
import { Conversation, Message } from './chat.service';

type ReadState = Record<string, number>;

@Injectable({ providedIn: 'root' })
export class ChatReadStateService {
  readonly unreadCount = signal(0);

  markConversationRead(userId: string, conversationId: string, messages: Message[]) {
    const unreadBefore = this.countUnreadInConversation(userId, conversationId, messages);
    const latestMessageId = this.latestMessageId(messages);
    const state = this.getReadState(userId);
    state[conversationId] = Math.max(state[conversationId] || 0, latestMessageId);
    this.saveReadState(userId, state);
    this.unreadCount.update((count) => Math.max(0, count - unreadBefore));
  }

  updateUnreadCount(userId: string, conversations: Conversation[], messagesByConversation: Record<string, Message[]>) {
    const state = this.getReadState(userId);
    let count = 0;

    for (const conversation of conversations) {
      const messages = messagesByConversation[conversation.id] || [];
      const readMessageId = state[conversation.id] || 0;
      count += this.hasUnreadIncoming(userId, messages, readMessageId) ? 1 : 0;
    }

    this.unreadCount.set(count);
  }

  private countUnreadInConversation(userId: string, conversationId: string, messages: Message[]): number {
    const readMessageId = this.getReadState(userId)[conversationId] || 0;
    return this.hasUnreadIncoming(userId, messages, readMessageId) ? 1 : 0;
  }

  private hasUnreadIncoming(userId: string, messages: Message[], readMessageId: number): boolean {
    const latestIncoming = messages
      .filter((message) => this.isIncoming(userId, message))
      .reduce((latest, message) => Math.max(latest, this.messageOrder(message)), 0);

    return latestIncoming > readMessageId;
  }

  private isIncoming(userId: string, message: Message): boolean {
    if (!message.senderUserId && !message.senderId) return true;
    return String(message.senderUserId || message.senderId) !== userId;
  }

  private latestMessageId(messages: Message[]): number {
    return messages.reduce((latest, message) => {
      return Math.max(latest, this.messageOrder(message));
    }, 0);
  }

  private messageOrder(message: Message): number {
    const messageId = Number(message.id);
    if (Number.isFinite(messageId) && messageId > 0) return messageId;

    const messageAt = message.timestamp instanceof Date ? message.timestamp.getTime() : new Date(message.timestamp).getTime();
    return Number.isFinite(messageAt) ? messageAt : 0;
  }

  private getReadState(userId: string): ReadState {
    try {
      const raw = localStorage.getItem(this.storageKey(userId));
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }

  private saveReadState(userId: string, state: ReadState) {
    try {
      localStorage.setItem(this.storageKey(userId), JSON.stringify(state));
    } catch {}
  }

  private storageKey(userId: string): string {
    return `hamatoz_chat_read_${userId}`;
  }
}
