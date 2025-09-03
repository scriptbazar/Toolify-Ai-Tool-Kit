
'use server';

/**
 * @fileOverview Manages blog-related data, such as posts and comments, in Firestore.
 */
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { type Comment } from './blog-management.types';
import { PostSchema, type Post } from './blog-management.types';

const POSTS_COLLECTION = 'blogPosts';

/**
 * Fetches all comments from the 'comments' collection in Firestore.
 * @returns {Promise<Comment[]>} A list of all comments.
 */
export async function getComments(): Promise<Comment[]> {
    try {
        const snapshot = await adminDb.collection('comments').orderBy('submittedOn', 'desc').get();
        if (snapshot.empty) {
            return [];
        }

        const comments = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                authorId: data.authorId,
                authorName: data.authorName,
                authorAvatar: data.authorAvatar,
                comment: data.comment,
                postId: data.postId,
                postTitle: data.postTitle,
                status: data.status,
                submittedOn: data.submittedOn.toDate().toISOString(),
            } as Comment;
        });

        return comments;
    } catch (error) {
        console.error("Error fetching comments:", error);
        return [];
    }
}


/**
 * Fetches all posts from Firestore, ordered by creation date.
 * @returns {Promise<Post[]>} A list of all posts.
 */
export async function getPosts(): Promise<Post[]> {
  try {
    const snapshot = await adminDb.collection(POSTS_COLLECTION).orderBy('createdAt', 'desc').get();
    if (snapshot.empty) {
      return [];
    }

    const posts = snapshot.docs.map(doc => {
      const data = doc.data();
      return PostSchema.parse({
        id: doc.id,
        ...data,
        createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
        publishedAt: (data.publishedAt as Timestamp)?.toDate().toISOString() || undefined,
      });
    });

    return posts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
}

/**
 * Adds or updates a blog post in Firestore.
 * @param {Omit<Post, 'id' | 'createdAt'> & { id?: string }} postData - The data for the post.
 * @returns {Promise<{ success: boolean; message: string; postId?: string }>}
 */
export async function upsertPost(postData: Omit<Post, 'id' | 'createdAt'> & { id?: string }): Promise<{ success: boolean; message: string; postId?: string }> {
  try {
    const { id, ...data } = postData;
    
    if (id) {
      // Update existing post
      const postRef = adminDb.collection(POSTS_COLLECTION).doc(id);
      await postRef.update({
          ...data,
          ...(data.status === 'Published' && !data.publishedAt && { publishedAt: FieldValue.serverTimestamp() })
      });
      return { success: true, message: 'Post updated successfully.', postId: id };
    } else {
      // Add new post
      const postRef = adminDb.collection(POSTS_COLLECTION).doc();
      await postRef.set({
        ...data,
        createdAt: FieldValue.serverTimestamp(),
        ...(data.status === 'Published' && { publishedAt: FieldValue.serverTimestamp() })
      });
      return { success: true, message: 'Post created successfully.', postId: postRef.id };
    }
  } catch (error: any) {
    console.error("Error upserting post:", error);
    return { success: false, message: error.message || 'An unknown error occurred.' };
  }
}
