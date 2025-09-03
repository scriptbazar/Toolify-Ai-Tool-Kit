'use server';

/**
 * @fileOverview Manages reviews and comments.
 */
import { adminDb } from '@/lib/firebase-admin';
import { type Review, ReviewSchema } from './review-management.types';


/**
 * Fetches all reviews from the 'reviews' collection in Firestore.
 * @returns {Promise<Review[]>} A list of all reviews.
 */
export async function getReviews(): Promise<Review[]> {
    try {
        const snapshot = await adminDb.collection('reviews').orderBy('submittedOn', 'desc').get();
        if (snapshot.empty) {
            return [];
        }

        const reviews = snapshot.docs.map(doc => {
            const data = doc.data();
            return ReviewSchema.parse({
                id: doc.id,
                ...data,
                submittedOn: data.submittedOn.toDate().toISOString(),
            });
        });

        return reviews;
    } catch (error) {
        console.error("Error fetching reviews:", error);
        return [];
    }
}
