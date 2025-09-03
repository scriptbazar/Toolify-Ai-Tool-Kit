
'use server';

/**
 * @fileOverview Manages reviews and comments.
 */
import { adminDb } from '@/lib/firebase-admin';
import { type Comment } from './blog-management.types';


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

