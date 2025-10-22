
'use server';

/**
 * @fileOverview A server-side proxy for an IFSC API to avoid CORS issues and handle data fetching.
 */
import { unstable_cache as cache } from 'next/cache';

const API_BASE_URL = 'https://ifsc.razorpay.com';

/**
 * Fetches a list of all available banks.
 * This function is cached for 24 hours to reduce API calls.
 */
export const getBankList = cache(async (): Promise<string[]> => {
    try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
            throw new Error('Failed to fetch bank list');
        }
        const data = await response.json();
        return data as string[];
    } catch (error: any) {
        console.error("Error fetching bank list:", error);
        throw new Error(error.message || "Could not fetch the list of banks.");
    }
}, ['bank-list'], { revalidate: 86400 });

/**
 * Fetches all branches for a specific bank.
 * This function is cached for 24 hours per bank to reduce API calls.
 * @param bankName The name of the bank (e.g., "HDFC Bank").
 */
export const getBranchesForBank = cache(async (bankName: string): Promise<any[]> => {
     if (!bankName) return [];
    try {
        const response = await fetch(`${API_BASE_URL}/${bankName}`);
        if (!response.ok) {
            if (response.status === 404) {
                return []; // Bank not found or has no branches listed
            }
            throw new Error(`Failed to fetch branches for ${bankName}`);
        }
        const data = await response.json();
        return data;
    } catch (error: any) {
        console.error(`Error fetching branches for ${bankName}:`, error);
        throw new Error(error.message || "Could not fetch branch data.");
    }
}, ['bank-branches'], { revalidate: 86400 });
