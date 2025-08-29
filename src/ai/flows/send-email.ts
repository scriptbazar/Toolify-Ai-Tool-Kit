
'use server';

/**
 * @fileOverview A flow for sending transactional emails.
 *
 * This file contains flows for sending various system emails, such as password change notifications.
 * In a real application, this would integrate with an SMTP or API-based email service.
 * For this demo, it will log the email to the console.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const PasswordChangeEmailSchema = z.object({
  to: z.string().email().describe("The recipient's email address."),
  name: z.string().describe("The recipient's name."),
});
export type PasswordChangeEmailInput = z.infer<typeof PasswordChangeEmailSchema>;

const EmailOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type EmailOutput = z.infer<typeof EmailOutputSchema>;


/**
 * Sends a password change notification email.
 * @param {PasswordChangeEmailInput} input - The recipient's details.
 * @returns {Promise<EmailOutput>} Result of the send operation.
 */
export async function sendPasswordChangeEmail(input: PasswordChangeEmailInput): Promise<EmailOutput> {
  return sendPasswordChangeEmailFlow(input);
}


const sendPasswordChangeEmailFlow = ai.defineFlow(
  {
    name: 'sendPasswordChangeEmailFlow',
    inputSchema: PasswordChangeEmailSchema,
    outputSchema: EmailOutputSchema,
  },
  async ({ to, name }) => {
    const subject = "Your ToolifyAI Password Has Been Changed";
    const body = `Hello ${name},\n\nThis is a confirmation that the password for your ToolifyAI account was successfully changed.\n\nIf you did not make this change, please reset your password immediately and contact our support team.\n\nBest,\nThe ToolifyAI Team`;

    console.log("--- Sending Email ---");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${body}`);
    console.log("--- Email Sent (Simulated) ---");

    // In a real app, you would use a service like Nodemailer, SendGrid, etc. here.
    // For example: await emailService.send({ to, subject, html: body });

    return {
      success: true,
      message: `Password change notification sent to ${to}.`,
    };
  }
);

    