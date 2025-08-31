
// Since Next.js now handles dotenv, we don't need it here for the dev server
// if it shares the same environment. If running separately, you might need it.
// For now, we assume a unified environment.

import '@/ai/flows/youtube-summarizer.ts';
import '@/ai/flows/pdf-q-and-a.ts';
import '@/ai/flows/ai-resume-builder.ts';
import '@/ai/flows/code-helper.ts';
import '@/ai/flows/ai-writer.ts';
import '@/ai/flows/ai-image-generator.ts';
import '@/ai/flows/user-management.ts';
import '@/ai/flows/settings-management.ts';
import '@/ai/flows/ai-chat.ts';
import '@/ai/flows/ai-email-composer.ts';
import '@/ai/flows/send-email.ts';
import '@/ai/flows/ticket-management.ts';
import '@/ai/flows/payment-management.ts';
import '@/ai/flows/blog-management.ts';
import '@/ai/flows/tool-management.ts';
import '@/ai/flows/user-activity.ts';
