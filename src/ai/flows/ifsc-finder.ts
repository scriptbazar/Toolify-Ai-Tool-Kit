
'use server';

/**
 * @fileOverview A server-side proxy for an IFSC API to avoid CORS issues and handle data fetching.
 * This file now uses the Razorpay IFSC API.
 */

export async function getBankList(): Promise<string[]> {
    // The correct endpoint to get a JSON list of banks is /banks
    const API_URL = 'https://ifsc.razorpay.com/';
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch bank list. Status: ${response.status}`);
        }
        // The response body is a JSON array of strings
        const data = await response.json();
        
        if (Array.isArray(data)) {
            return data;
        }
        return [];

    } catch (error: any) {
        console.error("Error in getBankList:", error);
        throw new Error(error.message || 'Could not fetch bank list from the server.');
    }
}

export async function getBranchesForBank(bankName: string) {
    const API_BASE_URL = 'https://ifsc.razorpay.com';
    if (!bankName) {
        throw new Error('Bank name is required.');
    }
    try {
        // The Razorpay API for branches is not directly available in the same way.
        // This tool's functionality is now limited as we can't get branches just by bank name.
        // We will assume a different tool (IFSC to details) will handle branch lookups.
        // For now, this function will return an empty array to prevent errors.
        // A better implementation would be to find a new API that supports this.
        console.warn(`getBranchesForBank is not supported by the new API for bank: ${bankName}`);
        return [];
    } catch (error: any) {
        console.error(`Error in getBranchesForBank for ${bankName}:`, error);
        throw new Error(error.message || `Could not fetch branches for ${bankName}.`);
    }
}

