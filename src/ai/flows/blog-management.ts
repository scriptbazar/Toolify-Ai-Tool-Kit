

'use server';

/**
 * @fileOverview Manages blog-related data, such as posts and comments, in Firestore.
 */
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { PostSchema, type Post, CommentSchema, type Comment, CategorySchema, type Category, CommentStatusSchema } from './blog-management.types';

const POSTS_COLLECTION = 'blogPosts';
const COMMENTS_COLLECTION = 'comments';
const CATEGORIES_COLLECTION = 'blogCategories';


/**
 * Fetches all posts from Firestore, ordered by creation date.
 * @returns {Promise<Post[]>} A list of all posts.
 */
export async function getPosts(): Promise<Post[]> {
  const adminDb = getAdminDb();
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
 * Fetches all comments from Firestore.
 * @returns {Promise<Comment[]>} A list of all comments.
 */
export async function getComments(): Promise<Comment[]> {
    const adminDb = getAdminDb();
    if (!adminDb) {
      console.error("Database not initialized, cannot fetch comments.");
      return [];
    }
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

/**
 * Updates the status of a blog comment.
 * @param {string} commentId - The ID of the comment to update.
 * @param {CommentStatus} status - The new status ('approved' or 'rejected').
 * @returns {Promise<{ success: boolean; message: string }>} Result of the operation.
 */
export async function updateCommentStatus(commentId: string, status: 'approved' | 'rejected' | 'pending'): Promise<{ success: boolean; message: string }> {
  const adminDb = getAdminDb();
  if (!adminDb) {
    return { success: false, message: 'Database not initialized.' };
  }
  try {
    const validatedStatus = CommentStatusSchema.parse(status);
    await adminDb.collection(COMMENTS_COLLECTION).doc(commentId).update({
      status: validatedStatus,
    });
    return { success: true, message: `Comment status updated to ${validatedStatus}.` };
  } catch (error: any) {
    console.error(`Error updating comment ${commentId}:`, error);
    return { success: false, message: error.message || 'An unknown error occurred.' };
  }
}

/**
 * Adds or updates a blog post in Firestore.
 * @param {Omit<Post, 'id' | 'createdAt'> & { id?: string }} postData - The data for the post.
 * @returns {Promise<{ success: boolean; message: string; postId?: string }>}
 */
export async function upsertPost(postData: Partial<Omit<Post, 'id' | 'createdAt'>> & { id?: string }): Promise<{ success: boolean; message: string; postId?: string }> {
  const adminDb = getAdminDb();
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
  const adminDb = getAdminDb();
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

/**
 * Fetches all blog categories from Firestore.
 */
export async function getCategories(): Promise<Category[]> {
  const adminDb = getAdminDb();
  if (!adminDb) return [];
  try {
    const snapshot = await adminDb.collection(CATEGORIES_COLLECTION).get();
    return snapshot.docs.map(doc => CategorySchema.parse({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

/**
 * Adds a new blog category.
 */
export async function addCategory(category: Omit<Category, 'id'>): Promise<{ success: boolean; message: string }> {
  const adminDb = getAdminDb();
  if (!adminDb) return { success: false, message: 'Database not initialized.' };
  try {
    const docRef = adminDb.collection(CATEGORIES_COLLECTION).doc(category.slug);
    await docRef.set(category);
    return { success: true, message: 'Category added successfully.' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Could not add category.' };
  }
}

/**
 * Updates an existing blog category.
 */
export async function updateCategory(categoryId: string, data: Partial<Omit<Category, 'id'>>): Promise<{ success: boolean; message: string }> {
  const adminDb = getAdminDb();
  if (!adminDb) return { success: false, message: 'Database not initialized.' };
  try {
    await adminDb.collection(CATEGORIES_COLLECTION).doc(categoryId).update(data);
    return { success: true, message: 'Category updated successfully.' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Could not update category.' };
  }
}

/**
 * Deletes a blog category.
 */
export async function deleteCategory(categoryId: string): Promise<{ success: boolean; message: string }> {
  const adminDb = getAdminDb();
  if (!adminDb) return { success: false, message: 'Database not initialized.' };
  try {
    await adminDb.collection(CATEGORIES_COLLECTION).doc(categoryId).delete();
    return { success: true, message: 'Category deleted successfully.' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Could not delete category.' };
  }
}
