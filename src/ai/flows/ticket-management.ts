'use server';

/**
 * @fileOverview Manages support tickets in Firestore.
 */
import { z } from 'zod';
import { getAdminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { ai } from '@/ai/genkit';
import { getStorage } from 'firebase-admin/storage';
import { type Ticket, type TicketMessage, type CreateTicketInput, type AddReplyInput, type UpdateTicketDetailsInput, TicketMessageSchema, CreateTicketInputSchema, AddReplyInputSchema, UpdateTicketDetailsInputSchema } from './ticket-management.types';

/**
 * Creates a new support ticket in Firestore.
 */
export async function createTicket(input: CreateTicketInput): Promise<{ success: boolean; message: string }> {
    try {
        const { ticketId, subject, priority, message, userId, userName, userEmail, expiresAt, attachments } = CreateTicketInputSchema.parse(input);
        const adminDb = getAdminDb();
        const ticketRef = adminDb.collection('tickets').doc(ticketId);
        
        const initialMessage: TicketMessage = {
            author: 'user',
            name: userName,
            avatar: `https://i.pravatar.cc/150?u=${userEmail}`,
            text: message,
            timestamp: new Date().toISOString(),
            attachments: attachments || [],
        };

        const automatedReply: TicketMessage = {
            author: 'admin',
            name: 'ToolifyAI Bot',
            avatar: 'https://i.pravatar.cc/150?u=admin-bot',
            text: `Hello ${userName},\n\nThank you for reaching out! This is an automated confirmation that we have received your support ticket.\n\nYour reference ID is: ${ticketId}`,
            timestamp: new Date().toISOString(),
        }

        await ticketRef.set({
            subject,
            priority,
            status: 'Open',
            userId,
            user: {
                name: userName,
                email: userEmail,
                avatar: `https://i.pravatar.cc/150?u=${userEmail}`,
            },
            createdAt: FieldValue.serverTimestamp(),
            lastUpdated: FieldValue.serverTimestamp(),
            expiresAt: new Date(expiresAt),
            messages: [initialMessage, automatedReply],
        });
        
        return { success: true, message: 'Ticket created successfully.' };
    } catch (error: any) {
        console.error("Error creating ticket:", error);
        if (error instanceof z.ZodError) {
            return { success: false, message: `Validation error: ${error.errors.map(e => e.message).join(', ')}` };
        }
        return { success: false, message: error.message || 'An unknown error occurred.' };
    }
}


/**
 * Fetches all support tickets and deletes expired ones along with their media from Firebase Storage.
 */
export async function getTickets(): Promise<Ticket[]> {
    try {
        const adminDb = getAdminDb();
        const now = new Date();
        const ticketsRef = adminDb.collection('tickets');

        // Get default bucket from Firebase Admin
        const bucket = getStorage().bucket();

        // Delete expired tickets and their associated media
        const expiredQuery = ticketsRef.where('expiresAt', '<=', now);
        const expiredSnapshot = await expiredQuery.get();
        if (!expiredSnapshot.empty) {
            const ticketBatch = adminDb.batch();
            const deletionPromises: Promise<any>[] = [];
            
            for (const doc of expiredSnapshot.docs) {
                // Queue the ticket document for deletion
                ticketBatch.delete(doc.ref);
                
                // Find and queue associated media for deletion from Firebase Storage
                const ticketData = doc.data() as Ticket;
                if (ticketData.messages) {
                    for (const message of ticketData.messages) {
                        if (message.attachments) {
                            for (const url of message.attachments) {
                                try {
                                    const decodedUrl = decodeURIComponent(url);
                                    const filePath = decodedUrl.split('/o/')[1].split('?')[0];
                                    if (filePath) {
                                        deletionPromises.push(bucket.file(filePath).delete().catch(e => console.error(`Failed to delete storage file ${filePath}:`, e.message)));
                                    }
                                } catch (e) {
                                    console.error(`Could not parse or delete file from URL ${url}:`, e);
                                }
                            }
                        }
                    }
                }
                console.log(`Queueing deletion for expired ticket: ${doc.id} and its media.`);
            }
            
            // Execute all deletions
            await Promise.all([ticketBatch.commit(), ...deletionPromises]);
        }
        
        // Fetch remaining tickets
        const snapshot = await ticketsRef.orderBy('lastUpdated', 'desc').get();
        const tickets = snapshot.docs.map(doc => {
            const data = doc.data();
            const createdAt = data.createdAt?.toDate()?.toISOString() || new Date().toISOString();
            const lastUpdated = data.lastUpdated?.toDate()?.toISOString() || new Date().toISOString();
            const expiresAt = data.expiresAt?.toDate()?.toISOString() || new Date().toISOString();
            return { ...data, id: doc.id, createdAt, lastUpdated, expiresAt } as Ticket;
        });

        return tickets;
    } catch (error) {
        console.error("Error fetching tickets:", error);
        return [];
    }
}


/**
 * Fetches all tickets for a specific user.
 */
export async function getTicketsByUser(userId: string): Promise<Ticket[]> {
    if (!userId) return [];
    try {
        const adminDb = getAdminDb();
        const snapshot = await adminDb.collection('tickets')
            .where('userId', '==', userId)
            .orderBy('lastUpdated', 'desc')
            .get();

        if (snapshot.empty) return [];
        
        const tickets = snapshot.docs.map(doc => {
             const data = doc.data();
             const createdAt = data.createdAt?.toDate()?.toISOString() || new Date().toISOString();
             const lastUpdated = data.lastUpdated?.toDate()?.toISOString() || new Date().toISOString();
             const expiresAt = data.expiresAt?.toDate()?.toISOString() || new Date().toISOString();
             return { ...data, id: doc.id, createdAt, lastUpdated, expiresAt } as Ticket;
        });
        
        return tickets;
    } catch (error) {
        console.error(`Error fetching tickets for user ${userId}:`, error);
        return [];
    }
}


/**
 * Adds a reply message to a ticket.
 */
export async function addTicketReply(input: AddReplyInput): Promise<{ success: boolean; message: string }> {
    try {
        const { ticketId, message } = AddReplyInputSchema.parse(input);
        const adminDb = getAdminDb();
        const ticketRef = adminDb.collection('tickets').doc(ticketId);

        await ticketRef.update({
            messages: FieldValue.arrayUnion(message),
            lastUpdated: FieldValue.serverTimestamp(),
        });
        
        return { success: true, message: 'Reply added successfully.' };
    } catch (error: any) {
         console.error(`Error adding reply to ticket ${input.ticketId}:`, error);
         return { success: false, message: error.message || 'An unknown error occurred.' };
    }
}

/**
 * Updates the status or priority of a ticket.
 */
export async function updateTicketDetails(input: UpdateTicketDetailsInput): Promise<{ success: boolean; message: string }> {
   try {
        const { ticketId, ...updates } = UpdateTicketDetailsInputSchema.parse(input);
        const adminDb = getAdminDb();

        if (!ticketId || Object.keys(updates).length === 0) {
            return { success: false, message: 'Ticket ID and at least one update field are required.' };
        }

        const ticketRef = adminDb.collection('tickets').doc(ticketId);
        
        const updatePayload: { [key: string]: any } = { ...updates, lastUpdated: FieldValue.serverTimestamp() };

        await ticketRef.update(updatePayload);
        
        return { success: true, message: 'Ticket details updated.' };
    } catch (error: any) {
        console.error(`Error updating ticket ${input.ticketId}:`, error);
        return { success: false, message: error.message || 'An unknown error occurred.' };
    }
}

/**
 * Generates a detailed support ticket message using AI based on a brief summary.
 */
const GenerateTicketContentInputSchema = z.object({
  problemSummary: z.string().describe('A brief summary of the user\'s problem.'),
});

const GenerateTicketContentOutputSchema = z.object({
  detailedMessage: z.string().describe('A detailed, polite, and well-structured support ticket message.'),
});

export async function generateTicketContent(input: z.infer<typeof GenerateTicketContentInputSchema>): Promise<z.infer<typeof GenerateTicketContentOutputSchema>> {
  return generateTicketContentFlow(input);
}

const generateTicketContentPrompt = ai.definePrompt({
  name: 'generateTicketContentPrompt',
  input: { schema: GenerateTicketContentInputSchema },
  output: { schema: GenerateTicketContentOutputSchema },
  config: {
    responseMimeType: "application/json",
  },
  prompt: `You are an expert at writing clear and detailed support ticket messages.
A user has provided a short summary of their problem. Expand this summary into a full support message.

The message should be polite and provide as much detail as possible to help the support team understand the issue.
If the summary is about a specific tool, mention that the user was using that tool.

User's problem summary:
"{{{problemSummary}}}"

Generate a detailed support message based on this summary.`,
});

const generateTicketContentFlow = ai.defineFlow(
  {
    name: 'generateTicketContentFlow',
    inputSchema: GenerateTicketContentInputSchema,
    outputSchema: GenerateTicketContentOutputSchema,
  },
  async (input) => {
    const { output } = await generateTicketContentPrompt(input);
    if (!output) {
      throw new Error('Failed to generate ticket content.');
    }
    return output;
  }
);
