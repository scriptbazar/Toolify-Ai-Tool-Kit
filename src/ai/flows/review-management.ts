'use server';

/**
 * @fileOverview Manages reviews and comments.
 */
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp }from 'firebase-admin/firestore';
import { z } from 'zod';
import { unstable_cache as cache } from 'next/cache';
import { type Review, type ReviewStatus, type AddReviewInput, ReviewSchema, ReviewStatusSchema, AddReviewInputSchema } from './review-management.types';

interface GetReviewsOptions {
    toolId?: string;
    limit?: number;
    status?: ReviewStatus;
}

/**
 * Fetches reviews from the 'reviews' collection in Firestore.
 * @param {GetReviewsOptions} [options] - Options for fetching reviews.
 * @returns {Promise<Review[]>} A list of reviews.
 */
export const getReviews = cache(
  async (options: GetReviewsOptions = {}): Promise<Review[]> => {
    const { toolId, limit, status } = options;
    try {
        const adminDb = getAdminDb();
        if (!adminDb) {
            console.warn("Database not initialized, cannot fetch reviews.");
            return [];
        }
        
        let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = adminDb.collection('reviews');
        
        const snapshot = await query.get();
        
        if (snapshot.empty) {
            return [];
        }
        
        let allReviews = snapshot.docs.map(doc => {
            const data = doc.data();
            return ReviewSchema.parse({
                id: doc.id,
                ...data,
                submittedOn: (data.submittedOn as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            });
        });

        // Manual filtering and sorting on the server
        allReviews.sort((a, b) => new Date(b.submittedOn).getTime() - new Date(a.submittedOn).getTime());
        
        let filteredReviews = allReviews;

        if (toolId) {
          filteredReviews = filteredReviews.filter(review => review.toolId === toolId);
        }

        // Default to showing only 'approved' reviews if a status isn't explicitly requested for public-facing queries
        if (status) {
            filteredReviews = filteredReviews.filter(review => review.status === status);
        } else if (toolId) {
             filteredReviews = filteredReviews.filter(review => review.status === 'approved');
        }

        // Apply limit after all filtering
        if (limit) {
            filteredReviews = filteredReviews.slice(0, limit);
        }

        return filteredReviews;

    } catch (error) {
        console.error("Error fetching reviews:", error);
        // Return an empty array on error to prevent crashing the calling component
        return [];
    }
  },
  ['reviews'],
  { revalidate: 3600 }
);


/**
 * Adds a new review to Firestore with a 'pending' status.
 * @param {AddReviewInput} input - The review data to add.
 * @returns {Promise<{ success: boolean; message: string }>}
 */
export async function addReview(input: AddReviewInput): Promise<{ success: boolean; message: string }> {
  try {
    const adminDb = getAdminDb();
    if (!adminDb) {
      throw new Error("Database not initialized");
    }
    const validatedInput = AddReviewInputSchema.parse(input);
    
    await adminDb.collection('reviews').add({
      ...validatedInput,
      submittedOn: FieldValue.serverTimestamp(),
      status: 'pending',
    });

    return { success: true, message: 'Your review has been submitted for approval.' };
  } catch (error: any) {
    console.error("Error adding review:", error);
    return { success: false, message: error.message || 'An unknown error occurred.' };
  }
}

/**
 * Updates the status of a review.
 * @param {string} reviewId - The ID of the review to update.
 * @param {ReviewStatus} status - The new status.
 * @returns {Promise<{ success: boolean; message: string }>}
 */
export async function updateReviewStatus(reviewId: string, status: 'approved' | 'rejected'): Promise<{ success: boolean; message: string }> {
  try {
    const adminDb = getAdminDb();
    if (!adminDb) {
      throw new Error("Database not initialized");
    }
    
    // Validate status just in case
    const parsedStatus = ReviewStatusSchema.parse(status);
    
    const reviewRef = adminDb.collection('reviews').doc(reviewId);
    await reviewRef.update({ status: parsedStatus });
    
    return { success: true, message: `Review status updated to ${status}.` };
  } catch (error: any) {
    console.error(`Error updating review ${reviewId}:`, error);
    return { success: false, message: error.message || 'An unknown error occurred.' };
  }
}


/**
 * Deletes a review from Firestore.
 * @param {string} reviewId - The ID of the review to delete.
 * @returns {Promise<{ success: boolean; message: string }>}
 */
export async function deleteReview(reviewId: string): Promise<{ success: boolean; message: string }> {
    const adminDb = getAdminDb();
    if (!adminDb) {
        return { success: false, message: "Database not initialized." };
    }
    try {
        await adminDb.collection('reviews').doc(reviewId).delete();
        return { success: true, message: 'Review deleted successfully.' };
    } catch (error: any) {
        console.error(`Error deleting review ${reviewId}:`, error);
        return { success: false, message: error.message || 'An unknown error occurred.' };
    }
}
