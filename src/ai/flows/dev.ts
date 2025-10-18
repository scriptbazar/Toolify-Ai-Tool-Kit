
// Since Next.js now handles dotenv, we don't need it here for the dev server
// if it shares the same environment. If running separately, you might need it.
// For now, we assume a unified environment.

import '@/ai/flows/user-management.ts';
import '@/ai/flows/settings-management.ts';
import '@/ai/flows/send-email.ts';
import '@/ai/flows/ticket-management.ts';
import '@/ai/flows/payment-management.ts';
import '@/ai/flows/blog-management.ts';
import '@/ai/flows/tool-management.ts';
import '@/ai/flows/user-activity.ts';
import '@/ai/flows/announcement-flow.ts';
import '@/ai/flows/review-management.ts';
import '@/ai/flows/utility-actions.ts';
import '@/ai/flows/verify-recaptcha.ts';
import '@/ai/flows/pdf-management.ts';
import '@/ai/flows/currency-converter.ts';
import '@/ai/flows/crypto-converter.ts';
import '@/ai/flows/serp-checker.ts';

import '@/ai/flows/ai-email-composer.ts';
import '@/ai/flows/youtube-data.ts';
import '@/ai/flows/website-analyzer.ts';
import '@/ai/flows/text-recognizer.ts';
