
'use server';

/**
 * @fileOverview A flow for sending transactional emails.
 *
 * This file contains flows for sending various system emails using Mailgun.
 * It reads credentials from environment variables.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import formData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || '',
});

const SENDER_EMAIL = `ToolifyAI <no-reply@${process.env.MAILGUN_DOMAIN}>`;


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

    try {
        await mg.messages.create(process.env.MAILGUN_DOMAIN!, {
            from: SENDER_EMAIL,
            to: [to],
            subject: subject,
            text: body,
        });
        return { success: true, message: `Password change notification sent to ${to}.` };
    } catch (error: any) {
        console.error("Mailgun error:", error);
        return { success: false, message: `Failed to send email: ${error.message}` };
    }
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
        
         try {
            await mg.messages.create(process.env.MAILGUN_DOMAIN!, {
                from: SENDER_EMAIL,
                to: [to],
                subject: subject,
                html: body,
            });
            return { success: true, message: `Support ticket confirmation sent to ${to}.` };
        } catch (error: any) {
            console.error("Mailgun error:", error);
            return { success: false, message: `Failed to send email: ${error.message}` };
        }
    }
);
