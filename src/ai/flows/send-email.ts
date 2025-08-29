
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
import { FieldValue } from 'firebase-admin/firestore';
// To use a real email service, you would uncomment the following lines
// and install the necessary package, e.g., `npm install mailgun.js`
import formData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY || '',
});

const SENDER_EMAIL = `ToolifyAI <no-reply@${process.env.MAILGUN_DOMAIN || 'example.com'}>`;


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

const EmailLogSchema = z.object({
  id: z.string(),
  recipient: z.string(),
  subject: z.string(),
  status: z.enum(['sent', 'opened', 'failed', 'blocked']),
  date: z.string(),
});
export type EmailLog = z.infer<typeof EmailLogSchema>;


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
            const date = data.date?.toDate()?.toISOString() || new Date().toISOString();
            return { ...data, id: doc.id, date } as EmailLog;
        });
    } catch (error) {
        console.error("Error fetching email log:", error);
        return [];
    }
}


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
    let status: EmailLog['status'] = 'sent';

    try {
        // SIMULATED: In a real app, you would uncomment the code below
        // and replace the console.log with the mg.messages.create call.
        // await mg.messages.create(process.env.MAILGUN_DOMAIN!, {
        //     from: SENDER_EMAIL,
        //     to: [to],
        //     subject: subject,
        //     text: body,
        // });
        console.log("--- SIMULATED EMAIL ---");
        console.log(`To: ${to}`);
        console.log(`From: ${SENDER_EMAIL}`);
        console.log(`Subject: ${subject}`);
        console.log(`Body: ${body}`);
        console.log("-----------------------");
        
        return { success: true, message: `Password change notification sent to ${to}.` };
    } catch (error: any) {
        console.error("Mailgun simulation error:", error);
        status = 'failed';
        return { success: false, message: `Failed to send email: ${error.message}` };
    } finally {
        await logEmail(to, subject, status);
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
        let status: EmailLog['status'] = 'sent';
        
         try {
            // SIMULATED: In a real app, you would uncomment the code below
            // and replace the console.log with the mg.messages.create call.
            // await mg.messages.create(process.env.MAILGUN_DOMAIN!, {
            //     from: SENDER_EMAIL,
            //     to: [to],
            //     subject: subject,
            //     html: body, // Use html for styled emails
            // });
            console.log("--- SIMULATED EMAIL ---");
            console.log(`To: ${to}`);
            console.log(`From: ${SENDER_EMAIL}`);
            console.log(`Subject: ${subject}`);
            console.log(`Body (HTML): ${body}`);
            console.log("-----------------------");

            return { success: true, message: `Support ticket confirmation sent to ${to}.` };
        } catch (error: any) {
            console.error("Mailgun simulation error:", error);
            status = 'failed';
            return { success: false, message: `Failed to send email: ${error.message}` };
        } finally {
            await logEmail(to, subject, status);
        }
    }
);
