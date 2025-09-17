
'use server';
/**
 * @fileOverview A server-side flow to fetch cryptocurrency data from the CoinGecko API.
 * This acts as a proxy to avoid CORS issues on the client-side.
 */

import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { CurrencySchema, GetCurrenciesOutputSchema, GetRatesOutputSchema } from './crypto-converter.types';
import { getSettings } from './settings-management';

const COINGECKO_API_BASE = 'https://api.coingecko.com/api/v3';

const constructUrl = (path: string, apiKey?: string) => {
    let url = `${COINGECKO_API_BASE}${path}`;
    if (apiKey) {
        const separator = url.includes('?') ? '&' : '?';
        url += `${separator}x_cg_demo_api_key=${apiKey}`;
    }
    return url;
};

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
            const settings = await getSettings();
            const apiKey = settings.general?.apiKeys?.coinGecko;

            const coinsUrl = constructUrl('/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false', apiKey);
            const fiatUrl = constructUrl('/simple/supported_vs_currencies', apiKey);

            const coinsRes = await fetch(coinsUrl);
            const fiatRes = await fetch(fiatUrl);

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
             const settings = await getSettings();
             const apiKey = settings.general?.apiKeys?.coinGecko;

            const popularCurrencyIds = [
                'bitcoin', 'ethereum', 'tether', 'binancecoin', 'solana', 'ripple', 'dogecoin',
                'cardano', 'shiba-inu', 'avalanche-2', 'polkadot', 'chainlink', 'tron', 'litecoin',
                'bitcoin-cash', 'stellar', 'monero', 'cosmos',
            ];
            
            const vsCurrencies = 'usd,inr,eur,gbp,jpy,aud,cad';

            const ratesUrl = constructUrl(`/simple/price?ids=${popularCurrencyIds.join(',')}&vs_currencies=${vsCurrencies}`, apiKey);
            const ratesRes = await fetch(ratesUrl);
            
            if (!ratesRes.ok) {
                throw new Error('Failed to fetch price data from CoinGecko API.');
            }
            const priceData = await ratesRes.json();
            
            const newRates: { [key: string]: number } = { 'usd': 1 };
            for (const key in priceData) {
                if (priceData[key].usd) {
                    newRates[key] = priceData[key].usd;
                }
            }
            
            // Fetch fiat rates against USD separately
            const fiatUrl = constructUrl('/simple/price?ids=indian-rupee,euro,british-pound-sterling,japanese-yen,australian-dollar,canadian-dollar&vs_currencies=usd', apiKey);
            const fiatRes = await fetch(fiatUrl);
            if(fiatRes.ok) {
                const fiatData = await fiatRes.json();
                newRates['inr'] = 1 / fiatData['indian-rupee'].usd;
                newRates['eur'] = 1 / fiatData['euro'].usd;
                newRates['gbp'] = 1 / fiatData['british-pound-sterling'].usd;
                newRates['jpy'] = 1 / fiatData['japanese-yen'].usd;
                newRates['aud'] = 1 / fiatData['australian-dollar'].usd;
                newRates['cad'] = 1 / fiatData['canadian-dollar'].usd;
            } else {
                 console.warn("Could not fetch direct fiat rates against USD.");
            }


            return { success: true, rates: newRates };
        } catch (error: any) {
             console.error("Error in getCryptoRates flow:", error);
             return { success: false, rates: {}, message: error.message };
        }
    }
);
