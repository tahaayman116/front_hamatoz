import { Injectable, signal, computed } from '@angular/core';
import { StorageService } from './storage.service';
import { Post, PostStatus } from '../models/post.model';

@Injectable({ providedIn: 'root' })
export class PostService {
  private posts = signal<Post[]>([]);

  pendingPosts = computed(() =>
    this.posts().filter(p => p.status === 'pending')
  );

  approvedPosts = computed(() =>
    this.posts().filter(p => p.status === 'approved')
  );

  rejectedPosts = computed(() =>
    this.posts().filter(p => p.status === 'rejected')
  );

  draftPosts = computed(() =>
    this.posts().filter(p => p.status === 'draft')
  );

  constructor(private storageService: StorageService) {
    this.loadPosts();
  }

  private loadPosts(): void {
    const storedPosts = this.storageService.getItem('posts') || [];
    this.posts.set(storedPosts);
  }

  private savePosts(): void {
    this.storageService.setItem('posts', this.posts());
  }

  private generateId(): string {
    return `post-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  createPost(postData: Partial<Post>): { success: boolean; post?: Post; error?: string } {
    const newPost: Post = {
      id: this.generateId(),
      title: postData.title || '',
      description: postData.description || '',
      type: postData.type || 'car',
      authorId: postData.authorId || '',
      authorName: postData.authorName || '',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...postData,
    };

    this.posts.update(posts => [...posts, newPost]);
    this.savePosts();

    return { success: true, post: newPost };
  }

  approvePost(postId: string): { success: boolean; error?: string } {
    const index = this.posts().findIndex(p => p.id === postId);
    
    if (index === -1) {
      return { success: false, error: 'Post not found' };
    }

    const updatedPosts = [...this.posts()];
    updatedPosts[index].status = 'approved';
    updatedPosts[index].updatedAt = new Date();
    updatedPosts[index].rejectionReason = undefined;

    this.posts.set(updatedPosts);
    this.savePosts();

    return { success: true };
  }

  rejectPost(postId: string, reason?: string): { success: boolean; error?: string } {
    const index = this.posts().findIndex(p => p.id === postId);
    
    if (index === -1) {
      return { success: false, error: 'Post not found' };
    }

    const updatedPosts = [...this.posts()];
    updatedPosts[index].status = 'rejected';
    updatedPosts[index].updatedAt = new Date();
    if (reason) updatedPosts[index].rejectionReason = reason;

    this.posts.set(updatedPosts);
    this.savePosts();

    return { success: true };
  }

  deletePost(postId: string): { success: boolean; error?: string } {
    const index = this.posts().findIndex(p => p.id === postId);
    
    if (index === -1) {
      return { success: false, error: 'Post not found' };
    }

    this.posts.update(posts => posts.filter((_, i) => i !== index));
    this.savePosts();

    return { success: true };
  }

  getPostById(postId: string): Post | undefined {
    return this.posts().find(p => p.id === postId);
  }

  getPostsByAuthor(authorId: string): Post[] {
    return this.posts().filter(p => p.authorId === authorId);
  }

  getAllPosts(): Post[] {
    return this.posts();
  }

  updatePostStatus(postId: string, status: PostStatus, reason?: string): { success: boolean; error?: string } {
    const index = this.posts().findIndex(p => p.id === postId);
    
    if (index === -1) {
      return { success: false, error: 'Post not found' };
    }

    const updatedPosts = [...this.posts()];
    updatedPosts[index].status = status;
    updatedPosts[index].updatedAt = new Date();
    if (reason) updatedPosts[index].rejectionReason = reason;

    this.posts.set(updatedPosts);
    this.savePosts();

    return { success: true };
  }

  getStats() {
    return {
      totalPosts: this.posts().length,
      pendingPosts: this.pendingPosts().length,
      approvedPosts: this.approvedPosts().length,
      rejectedPosts: this.rejectedPosts().length,
      draftPosts: this.draftPosts().length,
    };
  }
}
