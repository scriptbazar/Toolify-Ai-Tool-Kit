
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

const SupportTicketEmailSchema = z.object({
  to: z.string().email().describe("The recipient's email address."),
  name: z.string().describe("The recipient's name."),
  ticketId: z.string().describe("The ID of the support ticket."),
});
export type SupportTicketEmailInput = z.infer<typeof SupportTicketEmailSchema>;

/**
 * Sends a password change notification email.
 * @param {PasswordChangeEmailInput} input - The recipient's details.
 * @returns {Promise<EmailOutput>} Result of the send operation.
 */
export async function sendPasswordChangeEmail(input: PasswordChangeEmailInput): Promise<EmailOutput> {
  return sendPasswordChangeEmailFlow(input);
}

/**
 * Sends a support ticket confirmation email.
 * @param {SupportTicketEmailInput} input - The user and ticket details.
 * @returns {Promise<EmailOutput>} Result of the send operation.
 */
export async function sendSupportTicketConfirmationEmail(input: SupportTicketEmailInput): Promise<EmailOutput> {
    return sendSupportTicketConfirmationEmailFlow(input);
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

const sendSupportTicketConfirmationEmailFlow = ai.defineFlow(
    {
        name: 'sendSupportTicketConfirmationEmailFlow',
        inputSchema: SupportTicketEmailSchema,
        outputSchema: EmailOutputSchema,
    },
    async({ to, name, ticketId }) => {
        const subject = `We've Received Your Support Request (Ticket #${ticketId})`;
        const ticketLink = `https://your-app-url.com/my-tickets/${ticketId}`; // Placeholder URL
        const body = `Hello ${name},\n\nThanks for reaching out! This email is to confirm that we have received your support request (Ticket #${ticketId}). Our team will review it and get back to you as soon as possible, typically within 24 hours.\n\nYou can view the status of your ticket by clicking the button below.\n\n<a href="${ticketLink}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">View Ticket Status</a>\n\nBest regards,\nThe ToolifyAI Support Team`;
        
        console.log("--- Sending Support Ticket Email ---");
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: ${body}`);
        console.log("--- Email Sent (Simulated) ---");

        return {
            success: true,
            message: `Support ticket confirmation sent to ${to}.`,
        };
    }
);

    
