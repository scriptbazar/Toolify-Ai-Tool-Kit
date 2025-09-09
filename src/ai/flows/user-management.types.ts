

/**
 * @fileOverview Types and schemas for user management flows.
 */
import { z } from 'zod';

export type UpdateUserRoleInput = {
  userId: string;
  newRole: 'user' | 'admin';
};

export type AddLeadUserInput = {
  name: string;
  email: string;
  message?: string;
};

export type ReferralStatus = 'not_joined' | 'pending' | 'approved' | 'rejected';

export type ReferralRequest = {
    id: string;
    name: string;
    email: string;
    avatar: string;
    requestDate: string;
    status: 'pending';
};

export type Affiliate = {
    id: string;
    name: string;
    email: string;
    avatar: string;
    referrals: number;
    earnings: number;
    status: 'Active' | 'Inactive';
};

export type CommentStatus = 'approved' | 'pending' | 'rejected';

export type Comment = {
  id: string;
  authorId: string;
  authorName: string;
  authorEmail: string;
  authorAvatar: string;
  comment: string;
  postId: string;
  postTitle: string;
  submittedOn: string;
  status: CommentStatus;
};
