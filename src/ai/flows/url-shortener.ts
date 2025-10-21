
'use server';

/**
 * @fileOverview Manages URL shortening functionality using Firestore.
 */

import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import { nanoid } from 'nanoid';

const CreateShortUrlInputSchema = z.object({
  originalUrl: z.string().url('Please provide a valid URL.'),
});

type CreateShortUrlInput = z.infer<typeof CreateShortUrlInputSchema>;

const CreateShortUrlOutputSchema = z.object({
  shortUrl: z.string().optional(),
  error: z.string().optional(),
});

type CreateShortUrlOutput = z.infer<typeof CreateShortUrlOutputSchema>;


/**
 * Creates a new short URL and stores it in Firestore.
 * @param {CreateShortUrlInput} input - The original URL to shorten.
 * @returns {Promise<CreateShortUrlOutput>} The new short URL or an error.
 */
export async function createShortUrl(input: CreateShortUrlInput): Promise<CreateShortUrlOutput> {
  try {
    const adminDb = getAdminDb();
    if (!adminDb) {
      throw new Error('Database not initialized.');
    }
    
    const { originalUrl } = CreateShortUrlInputSchema.parse(input);
    const shortId = nanoid(7); // Generate a 7-character unique ID
    const shortUrlRef = adminDb.collection('shortenedUrls').doc(shortId);

    await shortUrlRef.set({
      originalUrl,
      shortId,
      createdAt: FieldValue.serverTimestamp(),
    });
    
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const shortUrl = `${baseUrl}/s/${shortId}`;

    return { shortUrl };

  } catch (error: any) {
    console.error('Error creating short URL:', error);
    return { error: error.message || 'An unknown error occurred.' };
  }
}

/**
 * Fetches the original URL for a given short ID.
 * @param {string} shortId - The short ID to look up.
 * @returns {Promise<string | null>} The original URL or null if not found.
 */
export async function getOriginalUrl(shortId: string): Promise<string | null> {
    if (!shortId) return null;
    try {
        const adminDb = getAdminDb();
        const docRef = adminDb.collection('shortenedUrls').doc(shortId);
        const docSnap = await docRef.get();
        if (docSnap.exists) {
            return (docSnap.data() as { originalUrl: string }).originalUrl;
        }
        return null;
    } catch (error) {
        console.error("Error fetching original URL:", error);
        return null;
    }
}
