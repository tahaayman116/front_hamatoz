export type PostType = 'car' | 'part' | 'service';
export type PostStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface Post {
  id: string;
  title: string;
  description: string;
  type: PostType;
  authorId: string;
  authorName: string;
  status: PostStatus;
  createdAt: Date;
  updatedAt: Date;
  images?: string[];
  rejectionReason?: string;
  price?: number;
  brand?: string;
  modelOrPartName?: string;
  condition?: string;
  city?: string;
  area?: string;
  year?: number;
  kmsDriven?: number;
  fuel?: string;
  transmission?: string;
  assembly?: string;
}

export interface CarPost extends Post {
  type: 'car';
  model?: string;
  mileage?: number;
}

export interface PartPost extends Post {
  type: 'part';
  partName?: string;
  partCategory?: string;
}

export interface ServicePost extends Post {
  type: 'service';
  serviceType?: string;
  price?: number;
  duration?: string;
}
