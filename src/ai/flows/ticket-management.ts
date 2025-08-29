
'use server';

/**
 * @fileOverview Manages support tickets in Firestore.
 */
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';


// Schemas
const TicketMessageSchema = z.object({
  author: z.enum(['user', 'admin']),
  name: z.string(),
  avatar: z.string().url(),
  text: z.string(),
  timestamp: z.string().datetime({ offset: true }),
});

export const CreateTicketInputSchema = z.object({
  ticketId: z.string(),
  subject: z.string(),
  priority: z.enum(['Low', 'Medium', 'High']),
  message: z.string(),
  userId: z.string(),
  userName: z.string(),
  userEmail: z.string().email(),
  expiresAt: z.string().datetime({ offset: true }),
});

export const TicketSchema = z.object({
  id: z.string(),
  subject: z.string(),
  priority: z.enum(['Low', 'Medium', 'High']),
  status: z.enum(['Open', 'In Progress', 'Closed']),
  userId: z.string(),
  user: z.object({
    name: z.string(),
    email: z.string().email(),
    avatar: z.string().url(),
  }),
  createdAt: z.string().datetime({ offset: true }),
  lastUpdated: z.string().datetime({ offset: true }),
  expiresAt: z.string().datetime({ offset: true }),
  messages: z.array(TicketMessageSchema),
});

export const AddReplyInputSchema = z.object({
    ticketId: z.string(),
    message: TicketMessageSchema,
});

export const UpdateTicketDetailsInputSchema = z.object({
    ticketId: z.string(),
    status: z.enum(['Open', 'In Progress', 'Closed']).optional(),
    priority: z.enum(['Low', 'Medium', 'High']).optional(),
});


// Types
export type Ticket = z.infer<typeof TicketSchema>;
export type TicketMessage = z.infer<typeof TicketMessageSchema>;
export type CreateTicketInput = z.infer<typeof CreateTicketInputSchema>;
export type AddReplyInput = z.infer<typeof AddReplyInputSchema>;
export type UpdateTicketDetailsInput = z.infer<typeof UpdateTicketDetailsInputSchema>;
export type TicketStatus = Ticket['status'];
export type TicketPriority = Ticket['priority'];

const TICKETS_COLLECTION = 'tickets';


/**
 * Creates a new support ticket in Firestore.
 */
export async function createTicket(input: CreateTicketInput): Promise<{ success: boolean; message: string }> {
    try {
        const { ticketId, subject, priority, message, userId, userName, userEmail, expiresAt } = CreateTicketInputSchema.parse(input);
        const ticketRef = adminDb.collection(TICKETS_COLLECTION).doc(ticketId);
        
        const initialMessage: TicketMessage = {
            author: 'user',
            name: userName,
            avatar: `https://i.pravatar.cc/150?u=${userEmail}`,
            text: message,
            timestamp: new Date().toISOString(),
        };

        const automatedReply: TicketMessage = {
            author: 'admin',
            name: 'ToolifyAI Bot',
            avatar: 'https://i.pravatar.cc/150?u=admin-bot',
            text: `Hello ${userName},\n\nThank you for reaching out! This is an automated confirmation that we have received your support ticket. Our team will review it and get back to you as soon as possible.\n\nYour reference ID is: ${ticketId}`,
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
 * Fetches all support tickets and deletes expired ones.
 */
export async function getTickets(): Promise<Ticket[]> {
    try {
        const now = new Date();
        const ticketsRef = adminDb.collection(TICKETS_COLLECTION);

        // Delete expired tickets
        const expiredQuery = ticketsRef.where('expiresAt', '<=', now);
        const expiredSnapshot = await expiredQuery.get();
        if (!expiredSnapshot.empty) {
            const batch = adminDb.batch();
            expiredSnapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
                console.log(`Deleted expired ticket: ${doc.id}`);
            });
            await batch.commit();
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
        const snapshot = await adminDb.collection(TICKETS_COLLECTION)
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
        const ticketRef = adminDb.collection(TICKETS_COLLECTION).doc(ticketId);

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
export async function updateTicketDetails(input: Partial<UpdateTicketDetailsInput>): Promise<{ success: boolean; message: string }> {
   try {
        const { ticketId, ...updates } = UpdateTicketDetailsInputSchema.parse(input);

        if (!ticketId || Object.keys(updates).length === 0) {
            return { success: false, message: 'Ticket ID and at least one update field are required.' };
        }

        const ticketRef = adminDb.collection(TICKETS_COLLECTION).doc(ticketId);
        
        const updatePayload: { [key: string]: any } = { ...updates, lastUpdated: FieldValue.serverTimestamp() };

        await ticketRef.update(updatePayload);
        
        return { success: true, message: 'Ticket details updated.' };
    } catch (error: any) {
        console.error(`Error updating ticket ${input.ticketId}:`, error);
        return { success: false, message: error.message || 'An unknown error occurred.' };
    }
}
