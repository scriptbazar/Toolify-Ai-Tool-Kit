
'use server';

/**
 * @fileOverview Manages payment history in Firestore and integrates with payment gateways.
 */

import { adminDb } from '@/lib/firebase-admin';
import { type Payment } from './payment-management.types';
import { getSettings } from './settings-management';
import { z } from 'zod';
import Stripe from 'stripe';

const CreateStripeSessionInputSchema = z.object({
  planId: z.string(),
  planName: z.string(),
  planPrice: z.number(),
  userId: z.string(),
  userEmail: z.string().email(),
});

type CreateStripeSessionInput = z.infer<typeof CreateStripeSessionInputSchema>;

const CreateStripeSessionOutputSchema = z.object({
  sessionId: z.string(),
  publishableKey: z.string(),
});

type CreateStripeSessionOutput = z.infer<typeof CreateStripeSessionOutputSchema>;

/**
 * Creates a Stripe Checkout session for a user to purchase a plan.
 * @param {CreateStripeSessionInput} input - The details for the checkout session.
 * @returns {Promise<CreateStripeSessionOutput>} The session ID and publishable key.
 */
export async function createStripeCheckoutSession(input: CreateStripeSessionInput): Promise<CreateStripeSessionOutput> {
  const { planId, planName, planPrice, userId, userEmail } = CreateStripeSessionInputSchema.parse(input);

  const settings = await getSettings();
  const stripeSettings = settings.payment?.stripe;

  if (!stripeSettings?.isEnabled || !stripeSettings.secretKey || !stripeSettings.publishableKey) {
    throw new Error('Stripe is not configured or enabled.');
  }

  const stripe = new Stripe(stripeSettings.secretKey);
  
  const siteUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: userEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: planName,
              description: `Subscription to the ${planName} plan on ToolifyAI.`,
            },
            unit_amount: planPrice * 100, // Amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment', // Use 'subscription' for recurring payments
      success_url: `${siteUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/payment/cancel`,
      metadata: {
        userId,
        planId,
      },
    });

    if (!session.id) {
        throw new Error('Could not create Stripe session.');
    }

    return {
      sessionId: session.id,
      publishableKey: stripeSettings.publishableKey,
    };
  } catch (error: any) {
    console.error("Stripe Error:", error);
    throw new Error(`Failed to create Stripe checkout session: ${error.message}`);
  }
}


/**
 * Fetches all payment records from Firestore.
 */
export async function getPayments(): Promise<Payment[]> {
    try {
        const snapshot = await adminDb.collection('payments').orderBy('date', 'desc').get();
        if (snapshot.empty) {
            return [];
        }
        
        const payments = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                transactionId: doc.id,
                userId: data.userId,
                userName: data.userName,
                userEmail: data.userEmail,
                plan: data.plan,
                amount: data.amount,
                date: data.date.toDate().toISOString(),
                status: data.status,
                paymentMethod: data.paymentMethod,
            } as Payment;
        });

        return payments;
    } catch (error) {
        console.error("Error fetching payments:", error);
        // In a real app, you might want more robust error handling,
        // but for now, we'll return an empty array to prevent crashing the client.
        return [];
    }
}
