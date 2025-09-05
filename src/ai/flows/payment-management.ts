
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
import Razorpay from 'razorpay';
import crypto from 'crypto';


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


const CreatePayUPaymentInputSchema = z.object({
    planId: z.string(),
    planName: z.string(),
    planPrice: z.number(),
    userId: z.string(),
    userEmail: z.string().email(),
    userName: z.string(),
});
type CreatePayUPaymentInput = z.infer<typeof CreatePayUPaymentInputSchema>;

const CreatePayUPaymentOutputSchema = z.object({
  action: z.string(),
  hash: z.string(),
  txnid: z.string(),
  key: z.string(),
  amount: z.string(),
  productinfo: z.string(),
  firstname: z.string(),
  email: z.string(),
  surl: z.string(),
  furl: z.string(),
});

type CreatePayUPaymentOutput = z.infer<typeof CreatePayUPaymentOutputSchema>;

const CreateCashfreeOrderInputSchema = z.object({
  planId: z.string(),
  planName: z.string(),
  planPrice: z.number(),
  userId: z.string(),
  userEmail: z.string().email(),
  userName: z.string(),
});
type CreateCashfreeOrderInput = z.infer<typeof CreateCashfreeOrderInputSchema>;

const CreateCashfreeOrderOutputSchema = z.object({
  payment_session_id: z.string(),
  order_id: z.string(),
  appId: z.string(),
  mode: z.enum(['sandbox', 'production']),
});
type CreateCashfreeOrderOutput = z.infer<typeof CreateCashfreeOrderOutputSchema>;

const CreatePhonePePaymentInputSchema = z.object({
  planId: z.string(),
  planName: z.string(),
  planPrice: z.number(),
  userId: z.string(),
  userEmail: z.string().email(),
  userName: z.string(),
});
type CreatePhonePePaymentInput = z.infer<typeof CreatePhonePePaymentInputSchema>;

const CreatePhonePePaymentOutputSchema = z.object({
  redirectUrl: z.string(),
});
type CreatePhonePePaymentOutput = z.infer<typeof CreatePhonePePaymentOutputSchema>;


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
 * Creates a PayU payment.
 */
export async function createPayUPayment(input: CreatePayUPaymentInput): Promise<CreatePayUPaymentOutput> {
  const { planId, planName, planPrice, userId, userEmail, userName } = CreatePayUPaymentInputSchema.parse(input);
  const settings = await getSettings();
  const payuSettings = settings.payment?.payu;

  if (!payuSettings?.isEnabled || !payuSettings.merchantKey || !payuSettings.merchantSalt) {
    throw new Error('PayU is not configured or enabled.');
  }
  
  const siteUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  const txnid = `txn_${Date.now()}`;
  const amount = planPrice.toFixed(2);
  
  const hashString = `${payuSettings.merchantKey}|${txnid}|${amount}|${planName}|${userName}|${userEmail}|||||||||||${payuSettings.merchantSalt}`;
  const hash = crypto.createHash('sha512').update(hashString).digest('hex');

  const action = payuSettings.mode === 'live' 
    ? 'https://secure.payu.in/_payment' 
    : 'https://test.payu.in/_payment';

  return {
    action,
    key: payuSettings.merchantKey,
    txnid,
    amount,
    productinfo: planName,
    firstname: userName,
    email: userEmail,
    surl: `${siteUrl}/payment/success`,
    furl: `${siteUrl}/payment/cancel`,
    hash,
  };
}

/**
 * Creates a Cashfree payment session.
 */
export async function createCashfreePayment(input: CreateCashfreeOrderInput): Promise<CreateCashfreeOrderOutput> {
  const { planId, planPrice, userId, userEmail, userName } = CreateCashfreeOrderInputSchema.parse(input);
  const settings = await getSettings();
  const cashfreeSettings = settings.payment?.cashfree;
  
  if (!cashfreeSettings?.isEnabled || !cashfreeSettings.appId || !cashfreeSettings.secretKey) {
    throw new Error('Cashfree is not configured or enabled.');
  }
  
  const siteUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  const orderId = `order_${Date.now()}`;
  const url = cashfreeSettings.mode === 'production'
    ? 'https://api.cashfree.com/pg/orders'
    : 'https://sandbox.cashfree.com/pg/orders';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-client-id': cashfreeSettings.appId,
      'x-client-secret': cashfreeSettings.secretKey,
      'x-api-version': '2022-09-01',
    },
    body: JSON.stringify({
      order_id: orderId,
      order_amount: planPrice,
      order_currency: 'INR',
      customer_details: {
        customer_id: userId,
        customer_email: userEmail,
        customer_phone: '9999999999', // Placeholder
        customer_name: userName,
      },
      order_meta: {
        return_url: `${siteUrl}/payment/success?order_id={order_id}`,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Cashfree Error:", errorData);
    throw new Error(errorData.message || 'Failed to create Cashfree order.');
  }

  const data = await response.json();
  return {
      payment_session_id: data.payment_session_id,
      order_id: data.order_id,
      appId: cashfreeSettings.appId,
      mode: cashfreeSettings.mode,
  };
}


/**
 * Creates a PhonePe payment request.
 */
export async function createPhonePePayment(input: CreatePhonePePaymentInput): Promise<CreatePhonePePaymentOutput> {
  const { planPrice, userId } = CreatePhonePePaymentInputSchema.parse(input);
  const settings = await getSettings();
  const phonepeSettings = settings.payment?.phonepe;

  if (!phonepeSettings?.isEnabled || !phonepeSettings.merchantId || !phonepeSettings.saltKey || !phonepeSettings.saltIndex) {
    throw new Error('PhonePe is not configured or enabled.');
  }
  
  const siteUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  const merchantTransactionId = `MT${Date.now()}`;
  const amount = planPrice * 100; // in paise
  
  const payload = {
    merchantId: phonepeSettings.merchantId,
    merchantTransactionId,
    merchantUserId: phonepeSettings.merchantUserId || `MUID${userId}`,
    amount,
    redirectUrl: `${siteUrl}/payment/success`,
    redirectMode: 'POST',
    callbackUrl: `${siteUrl}/api/phonepe-callback`,
    mobileNumber: '9999999999', // Placeholder
    paymentInstrument: { type: 'PAY_PAGE' },
  };

  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
  const verifyString = `${base64Payload}/pg/v1/pay${phonepeSettings.saltKey}`;
  const sha256 = crypto.createHash('sha256').update(verifyString).digest('hex');
  const xVerify = `${sha256}###${phonepeSettings.saltIndex}`;
  
  const url = phonepeSettings.mode === 'production'
      ? 'https://api.phonepe.com/apis/hermes/pg/v1/pay'
      : 'https://api-preprod.phonepe.com/apis/hermes/pg/v1/pay';

  const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerify,
      },
      body: JSON.stringify({ request: base64Payload }),
  });

  const responseData = await response.json();

  if (!responseData.success) {
      console.error("PhonePe Error:", responseData);
      throw new Error(responseData.message || 'Failed to initiate PhonePe payment.');
  }

  return {
    redirectUrl: responseData.data.instrumentResponse.redirectInfo.url,
  };
}
