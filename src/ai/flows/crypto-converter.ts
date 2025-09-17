
'use server';
/**
 * @fileOverview A server-side flow to fetch cryptocurrency data from the CoinGecko API.
 * This acts as a proxy to avoid CORS issues on the client-side.
 */

import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { CurrencySchema, GetCurrenciesOutputSchema, GetRatesOutputSchema } from './crypto-converter.types';

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

/**
 * Fetches a list of all supported cryptocurrencies and fiat currencies.
 * @returns {Promise<z.infer<typeof GetCurrenciesOutputSchema>>}
 */
export const getCryptoCurrencies = ai.defineFlow(
    {
        name: 'getCryptoCurrencies',
        inputSchema: z.void(),
        outputSchema: GetCurrenciesOutputSchema,
    },
    async () => {
        try {
            const [coinsRes, fiatRes] = await Promise.all([
                fetch(`${COINGECKO_API_BASE}/coins/list`),
                fetch(`${COINGECKO_API_BASE}/simple/supported_vs_currencies`)
            ]);

            if (!coinsRes.ok || !fiatRes.ok) {
                throw new Error('Failed to fetch currency data from CoinGecko API.');
            }
            
            const coins: z.infer<typeof CurrencySchema>[] = await coinsRes.json();
            const fiats: string[] = await fiatRes.json();
            
            const allCurrencies = [
                ...coins,
                ...fiats.map(f => ({ id: f, symbol: f, name: f.toUpperCase() }))
            ];

            // Remove duplicates and sort alphabetically by name
            const uniqueCurrencies = Array.from(new Map(allCurrencies.map(c => [c.id, c])).values())
                                       .sort((a,b) => a.name.localeCompare(b.name));

            return { success: true, currencies: uniqueCurrencies };
        } catch (error: any) {
            console.error("Error in getCryptoCurrencies flow:", error);
            return { success: false, currencies: [], message: error.message };
        }
    }
);

/**
 * Fetches the current price of all known currencies against USD.
 * @returns {Promise<z.infer<typeof GetRatesOutputSchema>>}
 */
export const getCryptoRates = ai.defineFlow(
    {
        name: 'getCryptoRates',
        inputSchema: z.void(),
        outputSchema: GetRatesOutputSchema,
    },
    async () => {
        try {
            // First, get all available currencies to build the price query
            const currencyData = await getCryptoCurrencies();
            if (!currencyData.success || !currencyData.currencies) {
                throw new Error("Could not retrieve currency list to fetch rates.");
            }

            const allIds = currencyData.currencies.map(c => c.id);
            const ratesRes = await fetch(`${COINGECKO_API_BASE}/simple/price?ids=${allIds.join(',')}&vs_currencies=usd`);
            
            if (!ratesRes.ok) {
                throw new Error('Failed to fetch price data from CoinGecko API.');
            }
            const priceData = await ratesRes.json();
            
            const newRates: { [key: string]: number } = { 'usd': 1 }; // Base rate for USD itself
            for (const key in priceData) {
                if (priceData[key].usd) {
                    newRates[key] = priceData[key].usd;
                }
            }

            return { success: true, rates: newRates };
        } catch (error: any) {
             console.error("Error in getCryptoRates flow:", error);
             return { success: false, rates: {}, message: error.message };
        }
    }
);
