
'use server';

/**
 * @fileOverview A flow for fetching live currency exchange rates.
 */

import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { cache } from 'react';

const ExchangeRateResponseSchema = z.object({
  result: z.string(),
  base_code: z.string(),
  conversion_rates: z.record(z.number()),
});

// We wrap the fetch in `cache` to prevent re-fetching on every render within a short period.
// This acts like a server-side cache for the duration of a request-render cycle.
export const getExchangeRates = cache(async (): Promise<Record<string, number>> => {
  try {
    // Using a free, no-key-required API for this example.
    const response = await fetch('https://v6.exchangerate-api.com/v6/e5f52f3a5281ded108e45f13/latest/USD');

    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rates. Status: ${response.status}`);
    }

    const data = await response.json();
    const validatedData = ExchangeRateResponseSchema.safeParse(data);

    if (!validatedData.success || validatedData.data.result !== 'success') {
        console.error("ExchangeRate API response error:", validatedData.error);
        throw new Error('Invalid data received from exchange rate API.');
    }

    return validatedData.data.conversion_rates;
  } catch (error: any) {
    console.error("Error in getExchangeRates:", error);
    // In case of an error, it's better to throw it so the client can handle it,
    // rather than returning empty data which might cause calculation errors.
    throw new Error('Could not fetch latest currency exchange rates.');
  }
});
