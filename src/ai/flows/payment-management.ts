
'use server';

/**
 * @fileOverview Manages payment history in Firestore and integrates with payment gateways.
 */

import { adminDb } from '@/lib/firebase-admin';
import { type Payment } from './payment-management.types';
import { getSettings } from './settings-management';
import { z } from 'zod';
import Stripe from 'stripe';
import paypal from '@paypal/checkout-server-sdk';

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


const CreatePayPalOrderInputSchema = z.object({
  planId: z.string(),
  planName: z.string(),
  planPrice: z.number(),
  userId: z.string(),
});
type CreatePayPalOrderInput = z.infer<typeof CreatePayPalOrderInputSchema>;

const CreatePayPalOrderOutputSchema = z.object({
  id: z.string(),
  links: z.array(z.object({
    href: z.string(),
    rel: z.string(),
    method: z.string(),
  })),
});


function getPayPalClient() {
  return new Promise<paypal.core.PayPalHttpClient>(async (resolve, reject) => {
    const settings = await getSettings();
    const paypalSettings = settings.payment?.paypal;
    if (!paypalSettings?.isEnabled || !paypalSettings.clientId || !paypalSettings.clientSecret) {
      return reject(new Error('PayPal is not configured or enabled.'));
    }

    const environment = paypalSettings.mode === 'live'
      ? new paypal.core.LiveEnvironment(paypalSettings.clientId, paypalSettings.clientSecret)
      : new paypal.core.SandboxEnvironment(paypalSettings.clientId, paypalSettings.clientSecret);
      
    const client = new paypal.core.PayPalHttpClient(environment);
    resolve(client);
  });
}

/**
 * Creates a PayPal order for a user to purchase a plan.
 */
export async function createPayPalOrder(input: CreatePayPalOrderInput): Promise<z.infer<typeof CreatePayPalOrderOutputSchema>> {
  const { planId, planName, planPrice, userId } = CreatePayPalOrderInputSchema.parse(input);
  const client = await getPayPalClient();
  const request = new paypal.orders.OrdersCreateRequest();
  
  const siteUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

  request.prefer("return=representation");
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      description: `Subscription to ${planName}`,
      amount: {
        currency_code: 'USD',
        value: planPrice.toFixed(2),
      },
      custom_id: `${userId}|${planId}`,
    }],
    application_context: {
      return_url: `${siteUrl}/payment/success?gateway=paypal`,
      cancel_url: `${siteUrl}/payment/cancel`,
      brand_name: 'ToolifyAI',
      user_action: 'PAY_NOW',
    },
  });

  try {
    const order = await client.execute(request);
    return CreatePayPalOrderOutputSchema.parse({
      id: order.result.id,
      links: order.result.links,
    });
  } catch (error: any) {
    console.error("PayPal Error:", error);
    throw new Error(`Failed to create PayPal order: ${error.message}`);
  }
}

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
