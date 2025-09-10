

'use server';

/**
 * @fileOverview Manages reviews and comments.
 */
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp }from 'firebase-admin/firestore';
import { type Review, ReviewSchema, AddReviewInputSchema, AddReviewInput, ReviewStatusSchema } from './review-management.types';


/**
 * Fetches all reviews from the 'reviews' collection in Firestore.
 * If a toolId is provided, it fetches reviews only for that specific tool.
 * @param {string} [toolId] - Optional ID of the tool to fetch reviews for.
 * @returns {Promise<Review[]>} A list of reviews.
 */
export async function getReviews(toolId?: string): Promise<Review[]> {
    try {
        const adminDb = getAdminDb();
        if (!adminDb) {
            console.warn("Database not initialized, cannot fetch reviews.");
            return [];
        }
        
        let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData> = adminDb.collection('reviews');

        if (toolId) {
            query = query.where('toolId', '==', toolId).where('status', '==', 'approved');
        }

        const snapshot = await query.orderBy('submittedOn', 'desc').get();
        
        if (snapshot.empty) {
            return [];
        }

        const reviews = snapshot.docs.map(doc => {
            const data = doc.data();
            return ReviewSchema.parse({
                id: doc.id,
                ...data,
                submittedOn: (data.submittedOn as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
            });
        });

        return reviews;
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return [];
    }
}


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
