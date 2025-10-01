

'use server';

/**
 * @fileOverview Manages payment history in Firestore and integrates with payment gateways.
 */

import { getAdminDb } from '@/lib/firebase-admin';
import { type Payment } from './payment-management.types';
import { getSettings } from './settings-management';
import { z } from 'zod';
import paypal from '@paypal/checkout-server-sdk';
import Razorpay from 'razorpay';
import crypto from 'crypto';


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

const CreateRazorpayOrderInputSchema = z.object({
    planId: z.string(),
    planName: z.string(),
    planPrice: z.number(),
    userId: z.string(),
    userEmail: z.string().email(),
    userName: z.string(),
});
type CreateRazorpayOrderInput = z.infer<typeof CreateRazorpayOrderInputSchema>;

const CreateRazorpayOrderOutputSchema = z.object({
    id: z.string(),
    amount: z.number(),
    currency: z.string(),
    name: z.string(),
    description: z.string(),
    key: z.string(),
    prefill: z.object({
        name: z.string(),
        email: z.string().email(),
    }),
    notes: z.object({
        userId: z.string(),
        planId: z.string(),
    }),
});
type CreateRazorpayOrderOutput = z.infer<typeof CreateRazorpayOrderOutputSchema>;


/**
 * Creates a PayPal order for a user to purchase a plan.
 */
export async function createPayPalOrder(input: CreatePayPalOrderInput): Promise<z.infer<typeof CreatePayPalOrderOutputSchema>> {
  const { planId, planName, planPrice, userId } = CreatePayPalOrderInputSchema.parse(input);
  
  // Directly get settings and create client inside the function
  const settings = await getSettings();
  const paypalSettings = settings.payment?.paypal;
  if (!paypalSettings?.isEnabled || !paypalSettings.clientId || !paypalSettings.clientSecret) {
    throw new Error('PayPal is not configured or enabled.');
  }

  const environment = paypalSettings.mode === 'live'
    ? new paypal.core.LiveEnvironment(paypalSettings.clientId, paypalSettings.clientSecret)
    : new paypal.core.SandboxEnvironment(paypalSettings.clientId, paypalSettings.clientSecret);
    
  const client = new paypal.core.PayPalHttpClient(environment);
  
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
      return_url: `${siteUrl}/payment/success`,
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
    console.error("PayPal Error:", JSON.stringify(error.result, null, 2));
    const errorDetails = error.result ? `{"error":"${error.result.name}","error_description":"${error.result.message}"}` : error.message;
    throw new Error(`Failed to create PayPal order: ${errorDetails}`);
  }
}


/**
 * Fetches all payment records from Firestore.
 */
export async function getPayments(): Promise<Payment[]> {
    const adminDb = getAdminDb();
    if (!adminDb) {
      console.error("Database not initialized, cannot fetch payments.");
      return [];
    }
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

/**
 * Creates a Razorpay order.
 */
export async function createRazorpayOrder(input: CreateRazorpayOrderInput): Promise<CreateRazorpayOrderOutput> {
  const { planId, planName, planPrice, userId, userEmail, userName } = CreateRazorpayOrderInputSchema.parse(input);
  const settings = await getSettings();
  const razorpaySettings = settings.payment?.razorpay;

  if (!razorpaySettings?.isEnabled || !razorpaySettings.keyId || !razorpaySettings.keySecret) {
    throw new Error('Razorpay is not configured or enabled.');
  }

  const instance = new Razorpay({
    key_id: razorpaySettings.keyId,
    key_secret: razorpaySettings.keySecret,
  });

  const options = {
    amount: planPrice * 100, // amount in the smallest currency unit
    currency: "INR",
    receipt: `receipt_order_${Date.now()}`,
    notes: {
      userId,
      planId,
    }
  };

  try {
    const order = await instance.orders.create(options);
    return {
      ...order,
      key: razorpaySettings.keyId,
      name: settings.general?.siteTitle || 'ToolifyAI',
      description: `Payment for ${planName}`,
      prefill: {
        name: userName,
        email: userEmail,
      },
    };
  } catch (error: any) {
    console.error("Razorpay Error:", error);
    throw new Error(`Failed to create Razorpay order: ${error.message}`);
  }
}


/**
 * Captures a PayPal order and updates the user's plan.
 */
export async function capturePayPalOrder(orderId: string): Promise<{ success: boolean; message: string; planId?: string }> {
    const adminDb = getAdminDb();
    if (!adminDb) {
      throw new Error('Database not initialized for verification.');
    }
    try {
        const settings = await getSettings();
        const paypalSettings = settings.payment?.paypal;
        if (!paypalSettings?.isEnabled || !paypalSettings.clientId || !paypalSettings.clientSecret) {
            throw new Error('PayPal is not configured or enabled.');
        }

        const environment = paypalSettings.mode === 'live'
            ? new paypal.core.LiveEnvironment(paypalSettings.clientId, paypalSettings.clientSecret)
            : new paypal.core.SandboxEnvironment(paypalSettings.clientId, paypalSettings.clientSecret);
            
        const client = new paypal.core.PayPalHttpClient(environment);

        const request = new paypal.orders.OrdersCaptureRequest(orderId);
        request.requestBody({});

        const capture = await client.execute(request);

        if (capture.result.status === 'COMPLETED') {
            const purchaseUnit = capture.result.purchase_units?.[0];
            const customId = purchaseUnit?.custom_id;

            if (!customId) {
                throw new Error('PayPal order is missing required metadata (custom_id).');
            }
            
            const [userId, planId] = customId.split('|');
            
            if (!userId || !planId) {
                 throw new Error('Invalid metadata format in PayPal order.');
            }

            const userRef = adminDb.collection('users').doc(userId);
            await userRef.update({
                planId: planId,
                subscriptionStatus: 'active',
            });

            return { success: true, message: 'PayPal payment captured and plan updated.', planId };
        } else {
            return { success: false, message: 'PayPal payment was not completed.' };
        }

    } catch (error: any) {
        console.error('PayPal capture error:', error);
        return { success: false, message: error.message || 'An unknown error occurred while capturing the PayPal payment.' };
    }
}


/**
 * Verifies a Razorpay payment.
 */
export async function verifyRazorpayPayment(input: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; }): Promise<{ success: boolean; message: string }> {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = input;
  
  const settings = await getSettings();
  const razorpaySettings = settings.payment?.razorpay;
  if (!razorpaySettings?.isEnabled || !razorpaySettings.keySecret) {
    throw new Error('Razorpay is not configured for verification.');
  }

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto.createHmac('sha256', razorpaySettings.keySecret).update(body.toString()).digest('hex');

  if (expectedSignature === razorpay_signature) {
    // Signature matches, now fetch order details to get user/plan info
    const instance = new Razorpay({ key_id: razorpaySettings.keyId, key_secret: razorpaySettings.keySecret });
    const order = await instance.orders.fetch(razorpay_order_id);

    if (order && order.notes && order.notes.userId && order.notes.planId) {
      const { userId, planId } = order.notes;
      const userRef = getAdminDb().collection('users').doc(userId);
      await userRef.update({ planId, subscriptionStatus: 'active' });
      return { success: true, message: 'Payment verified and plan updated.' };
    }
    throw new Error('Order details not found.');
  } else {
    return { success: false, message: 'Payment verification failed. Signature mismatch.' };
  }
}
