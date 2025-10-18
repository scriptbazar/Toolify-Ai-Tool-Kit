
'use server';

/**
 * @fileOverview A flow for fetching live cryptocurrency exchange rates.
 */

import { z } from 'zod';

const ExchangeRateResponseSchema = z.object({
  rates: z.record(z.object({
    name: z.string(),
    unit: z.string(),
    value: z.number(),
    type: z.enum(['crypto', 'fiat', 'commodity']),
  })),
});

export const getCryptoExchangeRates = async (): Promise<Record<string, number>> => {
  try {
    const apiKey = process.env.COINGECKO_API_KEY;
    if (!apiKey) {
      throw new Error('CoinGecko API key is not configured.');
    }
    
    // Using CoinGecko API
    const response = await fetch('https://api.coingecko.com/api/v3/exchange_rates', {
      headers: {
        'x-cg-demo-api-key': apiKey
      },
      // Using next revalidate to cache for 1 minute
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch exchange rates. Status: ${response.status}`);
    }

    const data = await response.json();
    const validatedData = ExchangeRateResponseSchema.safeParse(data);

    if (!validatedData.success) {
        console.error("CoinGecko API response error:", validatedData.error);
        throw new Error('Invalid data received from exchange rate API.');
    }

    const allRates: { [key: string]: number } = {};
    for (const key in validatedData.data.rates) {
        allRates[key.toUpperCase()] = validatedData.data.rates[key].value;
    }
    
    // The API gives rates relative to BTC. We need to convert them relative to USD.
    const btcToUsdRate = allRates['USD'];
    if (!btcToUsdRate) {
        throw new Error('BTC to USD rate not found in the API response.');
    }
    
    const ratesInUsd: { [key: string]: number } = {};
    for (const key in allRates) {
        ratesInUsd[key] = allRates[key] / btcToUsdRate;
    }

    return ratesInUsd;

  } catch (error: any) {
    console.error("Error in getCryptoExchangeRates:", error);
    throw new Error('Could not fetch latest currency exchange rates.');
  }
};
