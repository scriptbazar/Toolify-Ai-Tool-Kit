
'use server';

/**
 * @fileOverview A server-side proxy for the ifsc.codes API to avoid CORS issues.
 */

const API_BASE = 'https://ifsc.codes/api';

export async function getBankList() {
    try {
        const response = await fetch(`${API_BASE}/banks`);
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
        const response = await fetch(`${API_BASE}/branches/${bankCode}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch branches for ${bankCode}. Status: ${response.status}`);
        }
        return await response.json();
    } catch (error: any) {
        console.error(`Error in getBranchesForBank for ${bankCode}:`, error);
        throw new Error(error.message || `Could not fetch branches for ${bankCode}.`);
    }
}
