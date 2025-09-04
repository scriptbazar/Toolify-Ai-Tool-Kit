

'use server';

/**
 * @fileOverview Manages blog-related data, such as posts and comments, in Firestore.
 */
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { PostSchema, type Post } from './blog-management.types';

const POSTS_COLLECTION = 'blogPosts';

/**
 * Fetches all posts from Firestore, ordered by creation date.
 * @returns {Promise<Post[]>} A list of all posts.
 */
export async function getPosts(): Promise<Post[]> {
  if (!adminDb) {
    console.error("Database not initialized, cannot fetch posts.");
    return [];
  }
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
  if (!adminDb) {
    return { success: false, message: "Database not initialized" };
  }
  try {
    const { id, ...data } = postData;
    
    if (id) {
      // Update existing post
      const postRef = adminDb.collection(POSTS_COLLECTION).doc(id);
      const currentDoc = await postRef.get();
      const wasPublished = currentDoc.exists() && currentDoc.data()?.status === 'Published';

      const updateData: { [key: string]: any } = {
          ...data,
      };
      
      // Only set publishedAt if the status is changing to 'Published' for the first time
      if (data.status === 'Published' && !wasPublished) {
        updateData.publishedAt = FieldValue.serverTimestamp();
      }

      await postRef.update(updateData);
      return { success: true, message: 'Post updated successfully.', postId: id };
    } else {
      // Add new post
      const postRef = adminDb.collection(POSTS_COLLECTION).doc();
      const newPostData: { [key: string]: any } = {
        ...data,
        createdAt: FieldValue.serverTimestamp(),
      };
      if (data.status === 'Published') {
        newPostData.publishedAt = FieldValue.serverTimestamp();
      }
      await postRef.set(newPostData);
      return { success: true, message: 'Post created successfully.', postId: postRef.id };
    }
  } catch (error: any) {
    console.error("Error upserting post:", error);
    return { success: false, message: error.message || 'An unknown error occurred.' };
  }
}


/**
 * Deletes a post by moving it to 'Trash' status.
 * @param {string} postId - The ID of the post to delete.
 * @returns {Promise<{ success: boolean; message: string }>}
 */
export async function deletePost(postId: string): Promise<{ success: boolean; message: string }> {
  if (!adminDb) {
    return { success: false, message: "Database not initialized" };
  }
  try {
    const postRef = adminDb.collection(POSTS_COLLECTION).doc(postId);
    await postRef.update({ status: 'Trash' });
    return { success: true, message: 'Post moved to trash.' };
  } catch (error: any) {
    console.error(`Error deleting post ${postId}:`, error);
    return { success: false, message: error.message || 'An unknown error occurred.' };
  }
}
