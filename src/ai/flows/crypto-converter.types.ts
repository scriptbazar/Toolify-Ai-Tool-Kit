
import { z } from 'zod';

export const CurrencySchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
});
export type Currency = z.infer<typeof CurrencySchema>;

export const GetCurrenciesOutputSchema = z.object({
    success: z.boolean(),
    currencies: z.array(CurrencySchema),
    message: z.string().optional(),
});

export const GetRatesOutputSchema = z.object({
    success: z.boolean(),
    rates: z.record(z.number()),
    message: z.string().optional(),
});
