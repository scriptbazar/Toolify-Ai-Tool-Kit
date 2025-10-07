

'use server';

/**
 * @fileOverview Manages blog-related data, such as posts and comments, in Firestore.
 */
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp, type Query } from 'firebase-admin/firestore';
import { z } from 'zod';
import { unstable_cache as cache } from 'next/cache';

const POSTS_COLLECTION = 'blogPosts';
const COMMENTS_COLLECTION = 'comments';
const CATEGORIES_COLLECTION = 'blogCategories';


export const CommentStatusSchema = z.enum(['approved', 'pending', 'rejected']);
export type CommentStatus = z.infer<typeof CommentStatusSchema>;

export const CommentSchema = z.object({
  id: z.string(),
  authorId: z.string(),
  authorName: z.string(),
  authorEmail: z.string().email(),
  authorAvatar: z.string().url(),
  comment: z.string(),
  postId: z.string(),
  postTitle: z.string(),
  submittedOn: z.string().datetime({ offset: true }),
  status: CommentStatusSchema,
});
export type Comment = z.infer<typeof CommentSchema>;


export const PostStatusSchema = z.enum(['Published', 'Draft', 'Scheduled', 'Trash']);
export type PostStatus = z.infer<typeof PostStatusSchema>;

export const PostSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  content: z.string().min(1, 'Content is required'),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).optional(),
  imageUrl: z.string().url().optional(),
  imageHint: z.string().optional(),
  status: PostStatusSchema,
  createdAt: z.string().datetime({ offset: true }),
  publishedAt: z.string().datetime({ offset: true }).optional(),
  metaDescription: z.string().optional(),
  targetKeyword: z.string().optional(),
  seoTitle: z.string().optional(),
  canonicalUrl: z.string().url().optional(),
});
export type Post = z.infer<typeof PostSchema>;

export const CategorySchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Category name is required."),
    slug: z.string().min(1, "Slug is required."),
    description: z.string().optional(),
});
export type Category = z.infer<typeof CategorySchema>;



/**
 * Fetches posts from Firestore. By default, it fetches only 'Published' posts.
 * To fetch all posts (e.g., for the admin panel), pass 'all' as the status.
 * @param {('Published' | 'all')} [status='Published'] - The status of posts to fetch.
 * @returns {Promise<Post[]>} A list of posts.
 */
export const getPosts = cache(async (status: 'Published' | 'all' = 'Published'): Promise<Post[]> => {
  try {
    const adminDb = getAdminDb();
    if (!adminDb) {
      console.warn("Database not initialized, cannot fetch posts.");
      return [];
    }
    
    let query: Query = adminDb.collection(POSTS_COLLECTION).orderBy('createdAt', 'desc');
    
    const snapshot = await query.get();
    
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

    if (status !== 'all') {
        return posts.filter(post => post.status === status);
    }

    return posts;
  } catch (error: any) {
    console.error("Error fetching posts:", error.message);
    return [];
  }
},
['posts'],
{ revalidate: 3600 }
);

/**
 * Fetches all comments from Firestore.
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
export const getCategories = cache(async (): Promise<Category[]> => {
  const adminDb = getAdminDb();
  if (!adminDb) return [];
  try {
    const snapshot = await adminDb.collection(CATEGORIES_COLLECTION).get();
    return snapshot.docs.map(doc => CategorySchema.parse({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
},
['categories'],
{ revalidate: 3600 }
);

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
