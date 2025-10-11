
'use server';

/**
 * @fileOverview A server-side proxy for an IFSC API to avoid CORS issues and handle data fetching.
 */

export async function getBankList(): Promise<string[]> {
    const API_BASE_URL = 'https://ifsc.bank/api';
    try {
        const response = await fetch(`${API_BASE_URL}/banks`);
        if (!response.ok) {
            throw new Error(`Failed to fetch bank list. Status: ${response.status}`);
        }
        const data = await response.json();
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
    const API_BASE_URL = 'https://ifsc.bank/api';
    if (!bankName) {
        throw new Error('Bank name is required.');
    }
    try {
        // Corrected to fetch branches for a specific bank directly
        const response = await fetch(`${API_BASE_URL}/branches/${encodeURIComponent(bankName)}`);
         if (!response.ok) {
            throw new Error(`Failed to fetch branches for ${bankName}. Status: ${response.status}`);
        }
        const data = await response.json();

        if (data && Array.isArray(data.data)) {
            return data.data;
        }
        return [];
    } catch (error: any)        {
        console.error(`Error in getBranchesForBank for ${bankName}:`, error);
        throw new Error(error.message || `Could not fetch branches for ${bankName}.`);
    }
}
