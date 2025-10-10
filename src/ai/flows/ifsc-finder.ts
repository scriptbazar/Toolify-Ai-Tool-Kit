
'use server';

/**
 * @fileOverview A server-side proxy for the Razorpay IFSC API to avoid CORS issues and handle data fetching.
 */

// Note: The ifsc.codes API is down. Switched to Razorpay's unofficial but reliable API.

const API_BASE_URL = 'https://ifsc.razorpay.com/';

export async function getBankList(): Promise<string[]> {
    try {
        const response = await fetch(`${API_BASE_URL}banks`);
        if (!response.ok) {
            throw new Error(`Failed to fetch bank list. Status: ${response.status}`);
        }
        return await response.json();
    } catch (error: any) {
        console.error("Error in getBankList:", error);
        throw new Error(error.message || 'Could not fetch bank list from the server.');
    }
}

export async function getBranchesForBank(bankCode: string) {
    if (!bankCode) {
        throw new Error('Bank code is required.');
    }
    try {
        // Razorpay API returns all branches for a bank in a single call.
        const response = await fetch(`${API_BASE_URL}${bankCode}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch branches for ${bankCode}. Status: ${response.status}`);
        }
        return await response.json();
    } catch (error: any) {
        console.error(`Error in getBranchesForBank for ${bankCode}:`, error);
        throw new Error(error.message || `Could not fetch branches for ${bankCode}.`);
    }
}
