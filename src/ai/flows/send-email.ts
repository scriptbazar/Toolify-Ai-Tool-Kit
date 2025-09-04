
'use server';

/**
 * @fileOverview A flow for sending transactional emails.
 *
 * This file contains flows for sending various system emails. It is set up
 * to be easily integrated with a service like Mailgun but currently simulates
 * the email sending process by logging to the console.
 */

import { z } from 'zod';
import { ai } from '@/ai/genkit';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

const SENDER_EMAIL = `ToolifyAI <no-reply@toolifyai.com>`;


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

export const EmailStatusSchema = z.enum(['sent', 'opened', 'clicked', 'unsubscribed', 'failed', 'blocked']);
export type EmailLog = {
    id: string;
    recipient: string;
    subject: string;
    status: 'sent' | 'opened' | 'clicked' | 'unsubscribed' | 'failed' | 'blocked';
    date: string;
};


async function logEmail(recipient: string, subject: string, status: EmailLog['status']) {
    try {
        await adminDb.collection('emailLog').add({
            recipient,
            subject,
            status,
            date: FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error("Error logging email:", error);
    }
}

export async function getEmailLog(): Promise<EmailLog[]> {
    try {
        const snapshot = await adminDb.collection('emailLog').orderBy('date', 'desc').get();
        return snapshot.docs.map(doc => {
            const data = doc.data();
            const date = (data.date as Timestamp)?.toDate()?.toISOString() || new Date().toISOString();
            return {
              id: doc.id,
              recipient: data.recipient,
              subject: data.subject,
              status: data.status,
              date,
            } as EmailLog;
        });
    } catch (error) {
        console.error("Error fetching email log:", error);
        return [];
    }
}

async function sendEmail(to: string, subject: string, body: string, isHtml: boolean = false) {
    let status: EmailLog['status'] = 'sent';
    try {
        // Email sending is simulated by logging to the console.
        console.log("--- SIMULATED EMAIL ---");
        console.log(`To: ${to}`);
        console.log(`From: ${SENDER_EMAIL}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: ${body}`);
        console.log("-----------------------");
        
        return { success: true, message: `Email sent to ${to}.` };
    } catch (error: any) {
        console.error("Simulated email error:", error);
        status = 'failed';
        return { success: false, message: `Failed to send email: ${error.message}` };
    } finally {
        await logEmail(to, subject, status);
    }
}


/**
 * Sends a password change notification email.
 * @param {PasswordChangeEmailInput} input - The recipient's details.
 * @returns {Promise<EmailOutput>} Result of the send operation.
 */
export const sendPasswordChangeEmail = ai.defineFlow(
  {
    name: 'sendPasswordChangeEmailFlow',
    inputSchema: PasswordChangeEmailSchema,
    outputSchema: EmailOutputSchema,
  },
  async ({ to, name }) => {
    const subject = "Your ToolifyAI Password Has Been Changed";
    const body = `Hello ${name},\n\nThis is a confirmation that the password for your ToolifyAI account was successfully changed.\n\nIf you did not make this change, please reset your password immediately and contact our support team.\n\nBest,\nThe ToolifyAI Team`;
    return sendEmail(to, subject, body);
  }
);

/**
 * Sends a support ticket confirmation email.
 * @param {SupportTicketEmailInput} input - The user and ticket details.
 * @returns {Promise<EmailOutput>} Result of the send operation.
 */
export const sendSupportTicketConfirmationEmail = ai.defineFlow(
    {
        name: 'sendSupportTicketConfirmationEmailFlow',
        inputSchema: SupportTicketEmailSchema,
        outputSchema: EmailOutputSchema,
    },
    async({ to, name, ticketId }) => {
        const subject = `We've Received Your Support Request (Ticket #${ticketId})`;
        const ticketLink = `https://your-app-url.com/my-tickets/${ticketId}`; // Placeholder URL
        const body = `Hello ${name},\n\nThanks for reaching out! This email is to confirm that we have received your support request (Ticket #${ticketId}). Our team will review it and get back to you as soon as possible, typically within 24 hours.\n\nYou can view the status of your ticket by clicking the button below.\n\n<a href="${ticketLink}" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">View Ticket Status</a>\n\nBest regards,\nThe ToolifyAI Support Team`;
        return sendEmail(to, subject, body, true);
    }
);
