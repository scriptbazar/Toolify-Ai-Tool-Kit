
'use server';

/**
 * @fileOverview A server-side proxy for an IFSC API to avoid CORS issues and handle data fetching.
 */

// Switched to a new, more reliable API endpoint.
const API_BASE_URL = 'https://ifsc.bank/api';

export async function getBankList(): Promise<string[]> {
    try {
        const response = await fetch(`${API_BASE_URL}/banks`);
        if (!response.ok) {
            throw new Error(`Failed to fetch bank list. Status: ${response.status}`);
        }
        const data = await response.json();
        // The new API returns an object with a 'data' key which is an array of objects.
        // We need to extract the 'bank_name' from each object.
        if (data && Array.isArray(data.data)) {
            return data.data.map((bank: any) => bank.bank_name);
        }
        return [];

    } catch (error: any) {
        console.error("Error in getBankList:", error);
        throw new Error(error.message || 'Could not fetch bank list from the server.');
    }
}

export async function getBranchesForBank(bankName: string) {
    if (!bankName) {
        throw new Error('Bank name is required.');
    }
    try {
        // The new API requires fetching all branches and then filtering.
        // This is less efficient but necessary with the new API structure.
        const response = await fetch(`${API_BASE_URL}/all_branches`);
         if (!response.ok) {
            throw new Error(`Failed to fetch branches for ${bankName}. Status: ${response.status}`);
        }
        const allBranches = await response.json();

        if (allBranches && Array.isArray(allBranches.data)) {
            return allBranches.data.filter((branch: any) => branch.bank_name === bankName);
        }
        return [];
    } catch (error: any)        {
        console.error(`Error in getBranchesForBank for ${bankName}:`, error);
        throw new Error(error.message || `Could not fetch branches for ${bankName}.`);
    }
}
