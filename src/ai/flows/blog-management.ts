
'use server';

/**
 * @fileOverview Manages blog-related data, such as posts and comments, in Firestore.
 */
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { PostSchema, type Post, CommentSchema, type Comment } from './blog-management.types';

const POSTS_COLLECTION = 'blogPosts';
const COMMENTS_COLLECTION = 'blogComments';

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
        publishedAt: data.publishedAt ? (data.publishedAt as Timestamp)?.toDate().toISOString() : undefined,
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
export async function upsertPost(postData: Partial<Omit<Post, 'id' | 'createdAt'>> & { id?: string }): Promise<{ success: boolean; message: string; postId?: string }> {
  try {
    const { id, ...data } = postData;
    
    if (id) {
      // Update existing post
      const postRef = adminDb.collection(POSTS_COLLECTION).doc(id);
      const currentDoc = await postRef.get();
      const wasPublished = currentDoc.exists() && currentDoc.data()?.status === 'Published';

      await postRef.update({
          ...data,
          // Only set publishedAt if the status is changing to 'Published' for the first time
          ...(data.status === 'Published' && !wasPublished && { publishedAt: FieldValue.serverTimestamp() })
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


/**
 * Fetches all comments from Firestore.
 * @returns {Promise<Comment[]>} A list of all comments.
 */
export async function getComments(): Promise<Comment[]> {
    try {
        const snapshot = await adminDb.collection(COMMENTS_COLLECTION).orderBy('submittedOn', 'desc').get();
        if (snapshot.empty) {
            return [];
        }

        const comments = snapshot.docs.map(doc => {
            const data = doc.data();
            return CommentSchema.parse({
                id: doc.id,
                ...data,
                submittedOn: (data.submittedOn as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            });
        });

        return comments;
    } catch (error) {
        console.error("Error fetching comments:", error);
        return [];
    }
}
