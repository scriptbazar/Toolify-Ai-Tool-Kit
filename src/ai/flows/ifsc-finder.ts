'use server';

/**
 * @fileOverview A flow for fetching bank details from an IFSC code.
 */
import { z } from 'zod';

const BankDetailsSchema = z.object({
  BRANCH: z.string(),
  ADDRESS: z.string(),
  CITY: z.string(),
  STATE: z.string(),
  IFSC: z.string(),
  BANK: z.string(),
  MICR: z.string().optional(),
  CONTACT: z.string().optional(),
});

export type BankDetails = z.infer<typeof BankDetailsSchema>;

export async function getBankDetailsFromIfsc(ifsc: string): Promise<BankDetails> {
  if (!ifsc || ifsc.length !== 11) {
    throw new Error('Invalid IFSC code provided.');
  }

  const response = await fetch(`https://ifsc.razorpay.com/${ifsc}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('IFSC code not found. Please check the code and try again.');
    }
    throw new Error('Failed to fetch bank details from the service.');
  }

  const data = await response.json();
  const validatedData = BankDetailsSchema.safeParse(data);

  if (!validatedData.success) {
    throw new Error('Received invalid data format from the bank details service.');
  }

  return validatedData.data;
}
