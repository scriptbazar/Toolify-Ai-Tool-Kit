
'use server';

/**
 * @fileOverview An AI agent that composes emails based on user-provided criteria.
 *
 * - composeEmail - A function that generates an email body using AI.
 * - regenerateEmailTemplate - A function that regenerates an email template.
 * - generateFeatureAnnouncementEmail - A function that generates a new feature announcement email.
 */

import {ai} from '@/ai/genkit';
import {
    AiEmailComposerInputSchema, 
    AiEmailComposerOutputSchema, 
    RegenerateTemplateInputSchema, 
    GenerateFeatureAnnouncementInputSchema,
    type AiEmailComposerInput,
    type AiEmailComposerOutput,
    type RegenerateTemplateInput,
    type GenerateFeatureAnnouncementInput
} from './ai-email-composer.types';


export async function composeEmail(input: AiEmailComposerInput): Promise<AiEmailComposerOutput> {
  return composeEmailFlow(input);
}

const prompt = ai.definePrompt({
  name: 'composeEmailPrompt',
  input: {schema: AiEmailComposerInputSchema},
  output: {schema: AiEmailComposerOutputSchema},
  prompt: `You are an expert email copywriter. Your task is to write a clear, concise, and effective email based on the provided information.
The email should sound like it was written by a human admin, not an AI.

Subject: {{{subject}}}

Key Points to Include:
{{{keyPoints}}}

Tone: {{{tone}}}

Please generate only the body of the email. Do not include the subject line in your response.
`,
});

const composeEmailFlow = ai.defineFlow(
  {
    name: 'composeEmailFlow',
    inputSchema: AiEmailComposerInputSchema,
    outputSchema: AiEmailComposerOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("The AI failed to compose an email. Please try again.");
    }
    return output;
  }
);


// The output schema is the same as the composer output
export async function regenerateEmailTemplate(input: RegenerateTemplateInput): Promise<AiEmailComposerOutput> {
  return regenerateEmailTemplateFlow(input);
}

const regeneratePrompt = ai.definePrompt({
  name: 'regenerateEmailTemplatePrompt',
  input: {schema: RegenerateTemplateInputSchema},
  output: {schema: AiEmailComposerOutputSchema},
  prompt: `You are an expert email copywriter. Your task is to write a new, professional, and effective email body for the following template type:

Template for: {{{templateType}}}

Instructions:
- Write a complete and modern email body.
- Use placeholders like {{name}}, {{resetLink}}, {{planName}}, etc., where appropriate for the template type.
- If the template requires a call-to-action (like resetting a password or verifying an email), include a styled HTML anchor tag that looks like a button. Use this style: style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;"
- Generate only the body of the email. Do not include the subject line.
- Be creative and ensure the copy is engaging and clear.
`,
});

const regenerateEmailTemplateFlow = ai.defineFlow(
  {
    name: 'regenerateEmailTemplateFlow',
    inputSchema: RegenerateTemplateInputSchema,
    outputSchema: AiEmailComposerOutputSchema,
  },
  async (input) => {
    const {output} = await regeneratePrompt(input);
    if (!output) {
      throw new Error("The AI failed to regenerate the email template. Please try again.");
    }
    return output;
  }
);


export async function generateFeatureAnnouncementEmail(input: GenerateFeatureAnnouncementInput): Promise<AiEmailComposerOutput> {
  return generateFeatureAnnouncementFlow(input);
}

const featureAnnouncementPrompt = ai.definePrompt({
  name: 'featureAnnouncementPrompt',
  input: {schema: GenerateFeatureAnnouncementInputSchema},
  output: {schema: AiEmailComposerOutputSchema},
  prompt: `You are an expert marketing copywriter specializing in software feature announcements. Your task is to write an engaging and exciting email announcing a new feature.

Feature Name: {{{featureName}}}
Feature Description: {{{featureDescription}}}

Instructions:
- Start with a catchy and exciting opening.
- Clearly explain what the new feature is and its main benefits for the user.
- Encourage users to try out the new feature.
- Include a call-to-action button with the placeholder {{featureLink}}. The button must be a styled HTML anchor tag: style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;"
- Maintain an enthusiastic and friendly tone.
- Generate only the body of the email.
`,
});

const generateFeatureAnnouncementFlow = ai.defineFlow(
  {
    name: 'generateFeatureAnnouncementFlow',
    inputSchema: GenerateFeatureAnnouncementInputSchema,
    outputSchema: AiEmailComposerOutputSchema,
  },
  async (input) => {
    const {output} = await featureAnnouncementPrompt(input);
    if (!output) {
      throw new Error("The AI failed to generate the announcement email. Please try again.");
    }
    return output;
  }
);
