
'use server';

/**
 * @fileOverview A server-side proxy for an IFSC API to avoid CORS issues and handle data fetching.
 * This file now uses the Razorpay IFSC API.
 */

export async function getBankList(): Promise<string[]> {
    const API_URL = 'https://ifsc.razorpay.com/';
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`Failed to fetch bank list. Status: ${response.status}`);
        }
        
        const html = await response.text();
        
        // The bank list is embedded in a script tag within the HTML.
        // We need to extract the JSON string assigned to window.STATE.
        const jsonStartMarker = 'window.STATE = ';
        const startIndex = html.indexOf(jsonStartMarker);
        
        if (startIndex === -1) {
            throw new Error('Could not find bank list data in the API response.');
        }

        // Find the end of the script tag that contains the state
        const endIndex = html.indexOf('</script>', startIndex);
        if (endIndex === -1) {
            throw new Error('Could not find the end of the bank list data script.');
        }

        // Extract the JSON object string
        // We add the length of the marker to the start index to get the beginning of the JSON.
        // The end is before the closing script tag.
        const jsonString = html.substring(startIndex + jsonStartMarker.length, endIndex).trim();
        
        // Remove trailing semicolon if it exists
        const cleanJsonString = jsonString.endsWith(';') ? jsonString.slice(0, -1) : jsonString;

        const data = JSON.parse(cleanJsonString);
        
        // The bank list is inside data.api.bankList
        if (data && data.api && Array.isArray(data.api.bankList)) {
            return data.api.bankList;
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
