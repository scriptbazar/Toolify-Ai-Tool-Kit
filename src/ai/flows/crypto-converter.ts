
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
            // Fetch top 250 coins by market cap instead of the full list
            const coinsRes = await fetch(`${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false`);
            const fiatRes = await fetch(`${COINGECKO_API_BASE}/simple/supported_vs_currencies`);

            if (!coinsRes.ok || !fiatRes.ok) {
                throw new Error('Failed to fetch currency data from CoinGecko API.');
            }
            
            const coinsData: { id: string; symbol: string; name: string; }[] = await coinsRes.json();
            const coins = coinsData.map(c => ({ id: c.id, symbol: c.symbol, name: c.name }));
            
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
 * Fetches the current price of a curated list of popular currencies against USD.
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
            // A curated list of popular crypto and fiat currencies to keep the request size manageable.
            const popularCurrencyIds = [
                // Top Crypto by Market Cap
                'bitcoin', 'ethereum', 'tether', 'binancecoin', 'solana', 'ripple', 'dogecoin',
                'cardano', 'shiba-inu', 'avalanche-2', 'polkadot', 'chainlink', 'tron', 'litecoin',
                'bitcoin-cash', 'stellar', 'monero', 'cosmos',
                // Major Fiat Currencies
                'usd', 'eur', 'jpy', 'gbp', 'aud', 'cad', 'chf', 'cny', 'hkd', 'sgd', 'inr', 'rub', 'krw', 'brl'
            ];

            const ratesRes = await fetch(`${COINGECKO_API_BASE}/simple/price?ids=${popularCurrencyIds.join(',')}&vs_currencies=usd`);
            
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
             if (!newRates['inr']) {
                const inrRateRes = await fetch(`${COINGECKO_API_BASE}/simple/price?ids=tether&vs_currencies=inr`);
                const inrPriceData = await inrRateRes.json();
                if(inrPriceData.tether.inr && newRates.tether) {
                    newRates['inr'] = newRates.tether * inrPriceData.tether.inr;
                }
            }


            return { success: true, rates: newRates };
        } catch (error: any) {
             console.error("Error in getCryptoRates flow:", error);
             return { success: false, rates: {}, message: error.message };
        }
    }
);
