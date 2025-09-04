
'use server';

/**
 * @fileOverview Verifies a Google reCAPTCHA token on the server-side.
 */

import { z } from 'zod';
import { getSettings } from './settings-management';

const VerifyRecaptchaInputSchema = z.string().describe('The reCAPTCHA token from the client.');

const VerifyRecaptchaOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
type VerifyRecaptchaOutput = z.infer<typeof VerifyRecaptchaOutputSchema>;

export async function verifyRecaptcha(token: string): Promise<VerifyRecaptchaOutput> {
  const validatedToken = VerifyRecaptchaInputSchema.safeParse(token);
  if (!validatedToken.success) {
    return { success: false, message: 'Invalid reCAPTCHA token format.' };
  }

  try {
    const settings = await getSettings();
    const secretKey = settings.general?.security?.recaptchaSecretKey;

    if (!secretKey) {
      console.warn("reCAPTCHA secret key is not configured in settings. Skipping verification.");
      // In a production environment, you might want to fail this check.
      // For development and ease of setup, we'll allow it to pass if not configured.
      return { success: true, message: 'Skipped (no secret key).' };
    }

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${validatedToken.data}`,
    });
    
    if (!response.ok) {
        throw new Error(`Failed to verify reCAPTCHA. Status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      return { success: true, message: 'reCAPTCHA verified successfully.' };
    } else {
      // Log error codes for debugging
      console.error('reCAPTCHA verification failed with error codes:', data['error-codes']);
      return { success: false, message: 'Failed to verify reCAPTCHA. Please try again.' };
    }
  } catch (error: any) {
    console.error('Error during reCAPTCHA verification:', error);
    return { success: false, message: 'An internal error occurred during verification.' };
  }
}
